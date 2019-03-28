var TEXT_DATA;

function loadDataFromCvs() {
    $("#word-cloud-data").change(function() {
        var fileSelector = $("#word-cloud-data")[0].files;
        var file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        var reader = new FileReader();
        reader.onload = function() {
            TEXT_DATA = processDataToJSON(this.result, header = ["name", "value"], split = ',');
            jsonToTable(quickSort(TEXT_DATA), "#word-cloud-table", 15)
        };
        reader.readAsText(file);
    });
}

function getPasteText() {
    $("word-input").ready(function() {
        var text = $.trim($("textarea").val());
        if (text != "") {
            TEXT_DATA = processDataToJSON(text, header = ['name', "value"], split = ',');
            jsonToTable(quickSort(TEXT_DATA), "#word-cloud-table", 15)
        } else {
            alert("输入的字符是空的~~")
        }
    });
}

function quickSort(data, by = 'value') {
    if (data.length <= 1) {
        return data;
    }
    var pivotIndex = Math.floor(data.length / 2);
    var pivot = data.splice(pivotIndex, 1)[0]
    var left = [];
    var right = [];

    for (var i = 0; i < data.length; i++) {
        if (parseInt(data[i][by]) >= parseInt(pivot[by])) {
            left.push(data[i]);
        } else {
            right.push(data[i]);
        }
    }

    return quickSort(left).concat([pivot], quickSort(right));
}

function jsonToTable(json, id, num = 10) {
    var html = "";
    var json_headLine = json.slice(0, num);

    $.each(json_headLine, function(index, item) {

        if (index === 0) {
            html += "<tr>";
            $.each(item, function(vlaIndex) {
                html += "<td><font face=\"Arial\" size=3>";
                html += vlaIndex;
                html += "</font></td>";
            });
            html += "</tr>";
        }

        html += "<tr>";
        $.each(item, function(vlaIndex, valItem) {
            html += "<td><font face=\"Arial\" size=2>";
            html += valItem;
            html += "</td>";
        });

        html += "</font></tr>";
    });

    $(id).html(html);
}

function processDataToJSON(csv, header, split = ',') {
    csv = csv.replace(/^\n+|\n+$/g,"")
    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
    for (var i = 0; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(split);
        var tmp_dict = {};

        for (var j = 0; j < data.length; j++) {
            tmp_dict[header[j]] = data[j];
        }
        lines.push(tmp_dict);
    }
    return lines;
}

function generateWordCloud(JosnList, text = null) {
    var worldCloudcharts = echarts.init(document.getElementById('word-cloud'));
    var worldCloudoption = {
        title: {
            text: text,
            x: 'center',
            textStyle: {
                fontSize: 23,
                color: '#FFFFFF'
            }
        },
        tooltip: {
            show: true
        },
        series: [{
            name: text,
            type: 'wordCloud',
            sizeRange: [6, 66],
            rotationRange: [-45, 90],
            textPadding: 0,
            autoSize: {
                enable: true,
                minSize: 6
            },
            textStyle: {
                normal: {
                    color: function() {
                        return 'rgb(' + [
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160)
                        ].join(',') + ')';
                    }
                },
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            data: JosnList
        }]
    };
    worldCloudcharts.setOption(worldCloudoption);
}

function main() {
    console.log(TEXT_DATA);
    generateWordCloud(TEXT_DATA);
}