/**
 * common.js
 * common file for TerraEyes
 * (c) 2019 Hongbo Wang
 * Copyright © 1998 - 2019 Tencent. All Rights Reserved.
 */
// common.js
// common file for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


/**
 * Statistic analysis package
 * @type {DataParser}
 */
const StatisticCommon = class {
    average(data) {
        let sum = data.reduce(function (sum, value) {
            return sum + value;
        }, 0);
        return sum / data.length
    }

    standardDeviation(values) {
        let avg = average(values);
        let squareDiffs = values.map(function (value) {
            let diff = value - avg;
            return diff * diff
        });
        let avgSquareDiff = average(squareDiffs);
        return Math.sqrt(avgSquareDiff)
    };
};


/**
 * Sort package
 * @type {DataParser}
 */
const Sort = class {
    quickSort(data, by = 'score') {
        if (data.length <= 1) {
            return data;
        }
        let pivotIndex = Math.floor(data.length / 2);
        let pivot = data.splice(pivotIndex, 1)[0];
        let left = [];
        let right = [];

        for (let i = 0; i < data.length; ++i) {
            if (parseInt(data[i][by]) >= parseInt(pivot[by])) {
                left.push(data[i]);
            } else {
                right.push(data[i]);
            }
        }

        return quickSort(left).concat([pivot], quickSort(right));
    };
};


/**
 * Data Interactions
 * @type {DataParser}
 */
const DataParser = class {
    getIconPath() {
        const js = document.scripts;
        let path = js[js.length - 1].src.substring(0, js[js.length - 1].src.lastIndexOf("/"));
        path = path.substring(0, path.lastIndexOf("bin")) + "/css/icon/";

        return path
    };

    processDataToJSON(csv, header = ['lat', "lng", "score", "detail"], split = ',') {
        let allTextLines = csv.split(/\r\n|\n/);
        let lines = [];

        for (let i = 0; i < allTextLines.length; i++) {
            let data = allTextLines[i].split(split);
            let jsonFile = {};

            for (let j = 0; j < data.length; j++) {
                jsonFile[header[j]] = data[j];
            }
            lines.push(jsonFile);
        }
        return lines;
    }

    getGeoPasteText(pasteId, tableId) {
        let text = $.trim($(pasteId).val());
        if (text !== "") {
            let json = this.processDataToJSON(text, ['lat', "lng", 'detail'], ',');
            let myselect = document.getElementById("lat-lng-convert").selectedIndex;
            console.log(myselect);

            if (myselect === 2) {
                for (let i = 0; i < json.length; i++) {
                    let latLng = new LatLngSystemConverter().gcj0ToBd09(json[i].lat, json[i].lng);
                    json[i].lat = latLng[0];
                    json[i].lng = latLng[1];
                }
                console.log("INFO: To Baidu Map");
            } else if (myselect === 1) {
                for (let i = 0; i < json.length; i++) {
                    let latLng = new LatLngSystemConverter().Bd09Gcj02(json[i].lat, json[i].lng);
                    json[i].lat = latLng[0];
                    json[i].lng = latLng[1];
                }
                console.log("INFO: To Tencent/Gaode Map");
            } else {
                console.log("INFO: Do Not Convert GeoSystem");
            }
            this.jsonToTable(json, tableId, json.length);   // print on Page
            return json
        } else {
            console.log("WARN: text-paste-in is empty");
            alert("注意：输入的字符是空的")
        }
    }

    jsonToTable(json, id, num = 10, sub = false) {
        let html = "";
        let json_headLine = json.slice(0, num);

        $.each(json_headLine, function (index, item) {

            if (index === 0) {
                html += "<tr>";
                $.each(item, function (vlaIndex) {
                    html += "<td><font face=\"Arial\" size=3>";
                    html += vlaIndex;
                    html += "</font></td>";
                });
                html += "</tr>";
            }

            html += "<tr>";
            $.each(item, function (vlaIndex, valItem) {
                html += "<td><font face=\"Arial\" size=2>";
                if (sub) {
                    valItem = valItem.substring(0, 30) + " ... "
                }
                html += valItem;
                html += "</td>";
            });

            html += "</font></tr>";
        });

        $(id).html(html);
    }

    userInputLatLng() {
        let lat = prompt("Please enter latitude: ", "22.627453");
        let lng = prompt("Please enter longtitude: ", "114.030207");

        if (lat != null && lng != null) {
            alert("latitude: " + lat + " | longtitude: " + lng);
        } else if (lat == null) {
            alert("latitude is null !");
        } else if (lng == null) {
            alert("longtitude is null !");
        } else {
            alert("cancel");
        }

        return [Number(lat), Number(lng)];
    }
};

