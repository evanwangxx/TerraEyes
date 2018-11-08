#! /usr/bin/env python
# -*- coding: utf-8 -*-
#
# Author: Neptunewang
# Create: 2018/08/29
#
# model evaluation for multi-class classification model
#
# TODO: 1.Change output structure to ndarray 2.Add more metrics 3. unitest

import math
import numpy as np

from pyspark.sql.types import StructType, StructField, DoubleType


class Evaluation(object):

    # TODO: Add more general methods into Evaluation Class, like toDict

    def __init__(self, model, spark, label=None, prediction=None):

        self.spark = spark
        self.model = model
        self.label = label if label else "label"
        self.prediction = prediction if label else "prediction"

    @ staticmethod
    def accuracyCalculation(label_and_prediction, length=None):
        """
        Calculate the accuracy for a certain model
        Args:
            label_and_prediction: rdd with label and prediction
            length: data length
        Returns:
            accuracy value
        """
        if not length:
            length = label_and_prediction.count()

        accuracy = float(label_and_prediction.filter(lambda r: r[0] == r[1]).count())/float(length)
        return accuracy

    @ property
    def label(self):
        return self.label

    @ label.setter
    def label(self, name):
        self.label = name

    @ property
    def prediction(self):
        return self.prediction

    @ prediction.setter
    def prediction(self, name):
        self.prediction = name


class BinaryClassificationEvaluation(Evaluation):

    def __init__(self, model, spark):
        """
        Create a new BinaryClassificationEvaluation configuration
        Args:
            model: model need to evaluate
            spark: SparkSession
        """
        super(BinaryClassificationEvaluation, self).__init__(model=model, spark=spark)
        self.auc = None
        self.apr = None
        self.matrix = None
        self.likelihood = None

    def evaluation(self, data, threshold_list=None, rdd_model=True):
        """
        Evaluate the self.model performance on a certain data set
        Args:
            data: data in LabeledPoint or rdd
            threshold_list: thresholds, default [0.25, 0.50, 0.75]
            rdd_model: model is a RDD based model or not

        Returns:
            evaluation matrix
            auc value
            apr value
        """
        if not threshold_list:
            threshold_list = [0.25, 0.50, 0.75]

        # TODO: defaultDictionary
        output_order = ["threshold", "Accuracy",
                        "TN", "TP", "FN", "FP",
                        "precision", "recall", "TPR", "FPR", "F1"]
        result = {key: [] for key in output_order}
        data_length = float(data.count())

        model = self.model
        if rdd_model:
            model.clearThreshold()
            self.likelihood = data.map(lambda p: (p.label,
                                                  float(model.predict(p.features)))).persist()
        else:
            self.likelihood = model.transform(data).select(self.label, "probability")\
                .rdd.map(lambda x: (x[0], x[1][1])).persist()

        # TODO: O(n)*c to O(c)*n, although both in O(n), second one should be faster since less IO
        for threshold in threshold_list:
            label_and_predict = self.likelihood\
                .map(lambda l, t=threshold: (l[0], 1.0 if l[1] >= t else 0.0)).cache()

            accuracy = Evaluation.accuracyCalculation(label_and_predict, data_length)
            TN, TP, FN, FP = self.confusionMatrix(label_and_predict)
            precision, recall, TPR, FPR, F1 = self.confusionMatrixEvaluation(TN, TP, FN, FP)

            result["threshold"].append(threshold)
            result["Accuracy"].append(accuracy)
            result["TN"].append(TN)
            result["TP"].append(TP)
            result["FN"].append(FN)
            result["FP"].append(FP)
            result["precision"].append(precision)
            result["recall"].append(recall)
            result["TPR"].append(TPR)
            result["FPR"].append(FPR)
            result["F1"].append(F1)

        self.matrix = self.dictionaryToDataFrame(result, self.spark, output_order)

        roc_fpr, roc_tpr = self._rocAxisConvert(result["FPR"], result["TPR"])
        self.auc = self.trapezoidAreaCalculation(roc_fpr, roc_tpr)
        self.apr = self.trapezoidAreaCalculation(result["recall"], result["precision"])

        return self.matrix, self.auc, self.apr

    @staticmethod
    def confusionMatrix(label_and_prediction):
        """
        Construct a confusion matrix from true label and the corresponding prediction
        Args:
            label_and_prediction: rdd with label and prediction

        Returns:
            tn: True positive
            tp: True negative
            fn: False negative
            fp: False positive
        """

        # TODO: Toooo Slow, find a way to only traversal once
        tp = float(label_and_prediction.filter(lambda r: r[0] == r[1] and r[0] == 1.0).count())
        tn = float(label_and_prediction.filter(lambda r: r[0] == r[1] and r[0] == 0.0).count())
        fn = float(label_and_prediction.filter(lambda r: r[0] != r[1] and r[0] == 1.0).count())
        fp = float(label_and_prediction.filter(lambda r: r[0] != r[1] and r[0] == 0.0).count())

        return tn, tp, fn, fp

    @staticmethod
    def confusionMatrixEvaluation(tn, tp, fn, fp):
        """
        Using confusion matrix to calculate model performance index
        Args:
            tn: True positive
            tp: True negative
            fn: False negative
            fp: False positive

        Returns:
            precision
            recall
            tpr
            fpr
            f1
        """
        tpr = tp / (tp + fn)
        fpr = fp / (fp + tn)
        recall = tp / (tp + fn)
        precision = tp / (tp + fp)
        f1 = 2 * precision * recall / (precision + recall)

        return precision, recall, tpr, fpr, f1

    @staticmethod
    def dictionaryToDataFrame(dic, spark, output_order=None):
        """
        Helper method for converting the result Dictionary to DataFrame(Spark)
        Args:
            dic: result dictionary
            spark: Spark Session
            output_order: output column order

        Returns: result DataFrame(Spark)
        """
        if not output_order:
            output_order = dic.keys()

        schema_ls = []
        for key in output_order:
            schema_ls.append(StructField(key, DoubleType(), True))
        schema = StructType(schema_ls)

        row_ls = [[] for _ in range(len(list(dic.values())[0]))]
        i = 0
        for row in row_ls:
            for k in output_order:
                row.append(dic[k][i])
            i += 1

        return spark.createDataFrame(row_ls, schema)

    def _rocAxisConvert(self, fpr, tpr):
        """
        Add (0, 0) and (1, 1) into ROC plot
        Args:
            fpr: FPR list in order
            tpr: TPR list in order

        Returns: FPR list and the corresponding TPR list
        """
        if len(tpr) != len(fpr):
            raise ValueError("ERROR | TPR and FPR length mismatch")

        fpr_plot = fpr
        fpr_plot.append(0.0)
        fpr_plot.insert(0, 1.0)

        tpr_plot = tpr
        tpr_plot.append(0.0)
        tpr_plot.insert(0, 1.0)

        return fpr_plot, tpr_plot

    @staticmethod
    def trapezoidAreaCalculation(x, y):
        """
        Estimate the area under points (x, y) by using trapezoid area calculation
        Args:
            x: x-axis
            y: y-axis

        Returns: area
        """
        if len(x) != len(y):
            raise ValueError("ERROR | x and y length mismatch")

        else:
            area = 0
            for i in range(1, len(x)):
                tmp_area = math.fabs(x[i] - x[i - 1]) * (y[i - 1] + y[i]) * 0.5
                area += tmp_area
            return area


class MultiEvaluation(Evaluation):

    def __init__(self, model, spark):
        super(MultiEvaluation, self).__init__(model=model, spark=spark)
        self.distinct_label_name = None
        self.confusion_matrix = None  # confusion matrix by label
        self.precision = None # precision dictionary by label
        self.recall = None  # recall dictionary by label

    def evaluation(self, data):
        """
        Evaluate the self.model performance on a certain data-set
        Args:
            data: data in DataFrameN
        """
        self._setDistinctLabelName(data, self.label)

        model = self.model
        likelihood = model.transform(data).select(self.label, "probability").rdd
        label_and_predict = likelihood.map(lambda l: (l[0], float(l[1].argmax()))).cache()

        self.accuracy = Evaluation.accuracyCalculation(label_and_predict)
        cm, true_sum, predict_sum, confusion_matrix = self._confusionMatrix(label_and_predict)
        self.precision, self.recall = self._confusionMatrixEvaluation(cm, true_sum, predict_sum)

        self.confusion_matrix = np.array(confusion_matrix)

    def _confusionMatrix(self, label_and_predict):
        """
        Private method, calculate confusion matrix
        Args:
            label_and_predict: rdd with label and prediction

        TODO: nested for-loop, although it seems fine in this problem
        """
        cm_dict = {}
        true_sum = {}
        predict_sum = {}
        confusion_matrix = []

        for label in self.distinct_label_name:
            true_tmp_sum = 0.0
            tmp_confusion_matrix = []
            for predict in self.distinct_label_name:

                value = float(label_and_predict.filter(
                    lambda r, l=label, p=predict: r[0] == l and r[1] == p).count())

                cm_dict[str(label) + "_" + str(predict)] = value
                tmp_confusion_matrix.append(value)

                if "predict_all_" + str(predict) not in predict_sum.keys():
                    predict_sum["predict_all_" + str(predict)] = value
                else:
                    predict_sum["predict_all_" + str(predict)] += value
                true_tmp_sum += value

            confusion_matrix.append(tmp_confusion_matrix)
            true_sum["true_all_" + str(label)] = true_tmp_sum

        return cm_dict, true_sum, predict_sum, confusion_matrix

    def _confusionMatrixEvaluation(self, confusion_matrix, true_sum, predict_sum):
        """
        Calculate Precision by label and Recall by label
        Args:
            confusion_matrix: confusion matrix
            true_sum: true label row sum dictionary
            predict_sum: predicted label column sum dictionary

        Returns:
            precision and recall matrix by label

        """
        precision = {}
        recall = {}
        for label in self.distinct_label_name:
            label_str = str(label)

            value = confusion_matrix[label_str + "_" + label_str]
            tmp_true_sum = true_sum["true_all_" + label_str]
            tmp_predict_sum = predict_sum["predict_all_" + label_str]

            precision["precision_"+label_str] = value/tmp_predict_sum \
                if tmp_predict_sum != 0.0 else None
            recall["recall_"+label_str] = value/tmp_true_sum \
                if tmp_true_sum != 0.0 else None

        return precision, recall

    def _setDistinctLabelName(self, data, label_name=None):
        """
        Set distinct value for label column
        Args:
            data: data in DataFrame
            label_name: Label column name, default LABEL_NAME
        Returns: None
        """
        if not label_name:
            label_name = self.label

        distinct_label_name = [u[label_name] for u in data.select(label_name).distinct().collect()]

        distinct_label_name.sort()
        self.distinct_label_name = distinct_label_name
