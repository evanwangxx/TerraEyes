#! /usr/bin/env python
# -*- coding: utf-8 -*-
#
# Author: Neptunewang
# Create: 2018/08/16
#
# Data transformer for pipeline building
#

from pyspark.ml.pipeline import Pipeline as SparkPipeline
from pyspark.ml.feature import OneHotEncoder, StandardScaler, MinMaxScaler
from pyspark.ml.feature import PCA, Imputer
from pyspark.ml.feature import VectorAssembler, StringIndexer


class Transformer:

    def __init__(self):
        self.ONE_HOT_FOOTER = "_one_hot"
        self.Z_SCORE_FOOTER = "_z_score"
        self.Max_Min_FOOTER = "_max_min"

    # def one_hot_encoder(input_one_hot_feature_names):
    #     """ Attention: this function only available for Spark version over 2.3.0
    #         args:
    #              input_one_hot_feature_names: List(String), feature names
    #         returns:
    #              one_hot_pipeline_stage: List(PipelineStage),one hot pipeline stages
    #                                      and modified one hot column names
    #              feature_name: List(String), feature names
    #     """
    #
    #     output_name = [name + "_one_hot" for name in input_one_hot_feature_names]
    #     encoder = OneHotEncoderEstimator(inputCols=input_one_hot_feature_names,
    #                                      outputCols=output_name)
    #
    #     one_hot_pipeline_stage = Pipeline().setStages(encoder)
    #
    #     return one_hot_pipeline_stage, output_name

    def oneHotEncoder(self, column_names, footer=None, invalid="keep"):
        """
        Attention: OneHotEncoder has been deprecated in 2.3.0 and will be removed in 3.0.0
        Args:
            column_names: List(String), feature names
            footer: String, footnote for modified column names

        Returns:
            list of pipeline stage
        """
        stages = list()
        footer = self.ONE_HOT_FOOTER if not footer else footer

        for name in column_names:
            stages.append(StringIndexer()
                          .setInputCol(name)
                          .setOutputCol(name + "_indexed")
                          .setHandleInvalid(invalid))

            stages.append(OneHotEncoder()
                          .setInputCol(name + "_indexed")
                          .setOutputCol(name + footer))
        return stages

    def zScoreEncoder(self, column_names, mean=True, sd=True, footer=None):
        """
        Normalize features in column_names
        Args:
            column_names: List(String), feature names for scale columns
            mean: Boolean, default True
            sd: Boolean, default True
            footer: String, footnote for modified column names

        Returns:
            list of pipeline stage
        """

        stages = list()
        footer = self.Z_SCORE_FOOTER if not footer else footer
        feature_name = [(name, name + footer) for name in column_names]

        for name in feature_name:
            inner_name = name[0]
            output_name = name[1]

            vector = VectorAssembler().setInputCols([inner_name])\
                .setOutputCol(inner_name + "_vector")

            z_score = StandardScaler().setInputCol(inner_name+"_vector")\
                .setOutputCol(output_name)\
                .setWithMean(mean)\
                .setWithStd(sd)

            stages.extend([vector, z_score])

        return stages

    @ staticmethod
    def StandardEncoder(column_name, mean=True, sd=True, footer=None):
        """
        Normalize a single feature
        Args:
            column_name: List(String), feature names for scale columns
            mean: Boolean, default True
            sd: Boolean, default True
            footer: String, footnote for modified column names

        Returns:
            pipeline model
        """
        footer = "standardized" if not footer else footer

        vector = VectorAssembler()\
            .setInputCols(column_name)\
            .setOutputCol(column_name[0] + "_vector")

        z_score = StandardScaler().setInputCol(column_name[0] + "_vector")\
            .setOutputCol(column_name[0] + footer)\
            .setWithMean(mean).setWithStd(sd)

        pipe = SparkPipeline().setStages([vector, z_score])

        return pipe

    def minMaxEncoder(self, column_names, _max=1.0, _min=0.0, footer=None):
        """
        Scale features by max-min
        Args:
            column_names: List(String), feature names for max-min scale columns
            _max: float, default 1.0
            _min: float, default 0.0
            footer: String, footnote for modified column names

        Returns:
            list of pipeline stage
        """
        stages = list()
        footer = self.Max_Min_FOOTER if not footer else footer
        feature_name = [(name, name + footer) for name in column_names]

        for name in feature_name:
            inner_name = name[0]
            output_name = name[1]

            vector = VectorAssembler().setInputCols([inner_name])\
                .setOutputCol(inner_name + "_vector")

            max_min = MinMaxScaler().setInputCol(inner_name+"_vector")\
                .setOutputCol(output_name).setMax(_max).setMin(_min)

            stages.extend([vector, max_min])

        return stages

    def pcaEncoder(self, k, features_name, output_name):

        pca_model = PCA()\
            .setK(k)\
            .setInputCol(features_name)\
            .setOutputCol(output_name)

        return [pca_model]

    @ staticmethod
    def pca(data, k, features_name, output_name):

        pca_model = Transformer().pcaEncoder(k, features_name, output_name)

        return pca_model[0].fit(data)

    @ staticmethod
    def imputer(features_name, strategy="mean", missing_value=None, footer="_imputer"):
        """
        Spark experiment method
        Args:
            features_name:
            strategy:
            missing_value:
            footer:

        Returns:
            imputer model

        """
        output_names = [name+footer for name in features_name]

        imputer = Imputer() \
            .setInputCols(features_name) \
            .setOutputCols(output_names)\
            .setStrategy(strategy)

        if missing_value:
            imputer.setMissingValue(missing_value)

        return imputer

    def featureColumnName(self, feature_list,
                          one_hot_list, z_score_list, max_min_list,
                          footer_one_hot=None, footer_z_score=None, footer_max_min=None):
        """
        collect feature names for VectorAssembler
        Args:
            feature_list: feature_list: List(String), original feature names
            one_hot_list: List(String), features needs to do one hot
            z_score_list: List(String), features needs to do z-score scale
            max_min_list: List(String), features needs to do max-min scale
            footer_one_hot: String, footnote for modified column names
            footer_z_score: String, footnote for modified column names
            footer_max_min: String, footnote for modified column names

        Returns:
            feature names
        """
        footer_one_hot = self.ONE_HOT_FOOTER if not footer_one_hot else footer_one_hot
        footer_z_score = self.Z_SCORE_FOOTER if not footer_z_score else footer_z_score
        footer_max_min = self.Max_Min_FOOTER if not footer_max_min else footer_max_min

        output_name = [name for name in feature_list if name not in one_hot_list
                       and name not in z_score_list]

        if one_hot_list:
            output_name.extend([name + footer_one_hot for name in one_hot_list])

        if z_score_list:
            output_name.extend([name + footer_z_score for name in z_score_list])

        if max_min_list:
            output_name.extend([name + footer_max_min for name in max_min_list])

        return output_name


class Pipeline:

    def __init__(self):

        self.label = "label_index"
        self.features = "features"

    @ property
    def label(self):
        return self.label

    @ label.setter
    def label(self, name):
        self.label = name

    @ property
    def features(self):
        return self.label

    @ features.setter
    def features(self, name):
        self.features = name

    def pipelineBuilder(self, feature_name, label_name=None,
                        one_hot_name=None,
                        z_score_column_name=None,
                        max_min_column_name=None):
        """
        Build a Pipeline Stage
        Args:
            label_name: label column name in data
            feature_name: all features' name
            one_hot_name: features need to be transformed to one-hot
            z_score_column_name: features need to be transformed to z-score
            max_min_column_name: features need to be transformed by max-min scale

        Returns:
            pipeline: pipeline for data transformation
            feature_column: modified feature columns' name
        """
        stage = list()
        features = [self.features]

        if one_hot_name:
            one_hot_stage = Transformer().oneHotEncoder(one_hot_name)
            stage.extend(one_hot_stage)
        else:
            one_hot_name = []

        if z_score_column_name:
            z_score_stage = Transformer().zScoreEncoder(z_score_column_name)
            stage.append(z_score_stage)
        else:
            z_score_column_name = []

        if max_min_column_name:
            max_min_stage = Transformer().minMaxEncoder(max_min_column_name)
            stage.append(max_min_stage)
        else:
            max_min_column_name = []

        feature_column = Transformer()\
            .featureColumnName(feature_name,
                               one_hot_name,
                               z_score_column_name,
                               max_min_column_name)
        if label_name:
            label_index_stage = StringIndexer()\
                .setInputCol(label_name)\
                .setOutputCol(self.label)
            stage.append(label_index_stage)
            features.extend([label_name, self.label])

        vector_assembler = VectorAssembler()\
            .setInputCols(feature_column)\
            .setOutputCol(self.features)
        stage.append(vector_assembler)

        pipeline = SparkPipeline().setStages(stage)
        features.extend(feature_column)

        return pipeline, features
