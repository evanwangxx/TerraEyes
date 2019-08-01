// polygon.js
// polygon job for TerraEyes
// (c) 2019 Hongbo Wang, Xipeng Liu
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


let POLYGON_JSON;
let STORE_JSON;

window.onload = function () {
    let point = new qq.maps.LatLng(22.5228070000, 113.9353380000);
    loadMap(point, 15);
};

const color_drop_down = document.getElementById("color-dd");
for (let i = 0; i < CORLOR_DROP_DOWN.length; i++) {
    color_drop_down.options.add(new Option(CORLOR_DROP_DOWN[i].name, CORLOR_DROP_DOWN[i].length));
    if (i === 6) {
        color_drop_down.options[i].selected = true;
    }
}

function csvPolygon() {
    $('#polygon_data').change(function () {
        var fileSelector = $('#polygon_data')[0].files;
        var file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        var reader = new FileReader();
        reader.onload = function () {
            POLYGON_JSON = quickSort(processDataToJSON(this.result, ['polygon', 'score']));
        };
        reader.readAsText(file);
    });
}

function csvStoreLoader(header = ["store", "lat", "lng", "detail"]) {
    $("#store_data").change(function () {
        var fileSelector = $("#store_data")[0].files;
        var file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        var reader = new FileReader();
        reader.onload = function () {
            STORE_JSON = processDataToJSON(this.result, header, ',');
        };
        reader.readAsText(file);
    });
}

function runPolygon(pointer, polyData = POLYGON_JSON, filter = 30) {
    const polygonAlpha = parseFloat(document.getElementById("polygon-alpha").value);
    let color = clickColorList("color-dd");

    let data = [];
    for (let i = 0; i < polyData.length; ++i) {
        let tmpScore = parseInt(polyData[i]["score"]);
        if (tmpScore >= filter) {
            data.push(polyData[i]);
        }
    }

    let dataSort = quickSort(data);
    let maxBubbleLocation = dataSort[0]["polygon"].split('|')[0].split(';');
    if (pointer) {
        let latlng = userInputLatLng();
        let point = new qq.maps.LatLng(latlng[0], latlng[1]);
        loadMap(point, 14);
    } else {
        let center = new qq.maps.LatLng(maxBubbleLocation[0], maxBubbleLocation[1]);
        loadMap(center, 13);
    }

    if (STORE_JSON !== undefined) {
        layerOfMarker(MAP, STORE_JSON, [3000], false, null, false, 'other');
    }

    for (let i = 0; i < dataSort.length; i++) {
        let polyPath = dataSort[i]["polygon"].split('|');
        let polyPlot = [];
        for (let j = 0; j < polyPath.length; j++) {
            let point = polyPath[j].split(';');
            let center = new qq.maps.LatLng(parseFloat(point[0]), parseFloat(point[1]));
            polyPlot.push(center);
        }
        layerOfPolygon(MAP, polyPlot, color, polygonAlpha)
    }
}