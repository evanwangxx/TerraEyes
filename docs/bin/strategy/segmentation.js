// segmentation.js
// segmentation strategy for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


let POLYGON_JSON;
let GEOHASH_JSON;
let STORE_JSON;

window.onload = function() {
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

const marker_drop_down = document.getElementById("marker-dd");
for (let i = 0; i < MARKER_DROP_DOWN.length; i++) {
    marker_drop_down.options.add(new Option(MARKER_DROP_DOWN[i].name, MARKER_DROP_DOWN[i].path));
    if (i === 1) {
        marker_drop_down.options[i].selected = true;
    }
}

function csvPolygon() {
    $('#polygon_data').change(function() {
        let fileSelector = $('#polygon_data')[0].files;
        let file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        let reader = new FileReader();
        reader.onload = function() {
            POLYGON_JSON = quickSort(processDataToJSON(this.result, ['polygon', 'score']));
        };
        reader.readAsText(file);
    });
}

function csvGeohash() {
    $('#geohash_data').change(function() {
        let fileSelector = $('#geohash_data')[0].files;
        let file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        let reader = new FileReader();
        reader.onload = function() {
            GEOHASH_JSON = quickSort(processDataToJSON(this.result, ['geohash', 'score']));
        };
        reader.readAsText(file);
    });
}

function csvStoreLoader(header = ["detail", "lat", "lng", "others"]) {
    $("#store_data").change(function() {
        let fileSelector = $("#store_data")[0].files;
        let file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        let reader = new FileReader();
        reader.onload = function() {
            STORE_JSON = processDataToJSON(this.result, header, ',');
        };
        reader.readAsText(file);
    });
}

function runSegmentation(pointer, geohashData = GEOHASH_JSON, polyData = POLYGON_JSON, filterGeo = 30, filterPoly = 30) {
    const polygonAlpha = parseFloat(document.getElementById("polygon-alpha").value);
    let color = clickColorList("color-dd");
    let markerImage = clickColorList("marker-dd");

    // polygon
    let polyDataFilter = [];
    for (let i = 0; i < polyData.length; i++) {
        let tmpScore = parseInt(polyData[i]["score"]);
        if (tmpScore >= filterPoly) {
            polyDataFilter.push(polyData[i]);
        }
    }

    let polyDataFilterSort = quickSort(polyDataFilter);
    let maxBubbleLocation = polyDataFilterSort[0]["polygon"].split('|')[0].split(';');

    if (pointer) {
        let latlng = userInputLatLng();
        let point = new qq.maps.LatLng(latlng[0], latlng[1]);
        loadMap(point, 14);
    } else {
        let center = new qq.maps.LatLng(maxBubbleLocation[0], maxBubbleLocation[1]);
        loadMap(center, 13);
    }

    for (let i = 0; i < polyDataFilterSort.length; i++) {
        let polyPath = polyDataFilterSort[i]["polygon"].split('|');
        let polyPlot = [];
        for (let j = 0; j < polyPath.length; j++) {
            let point = polyPath[j].split(';');
            let center = new qq.maps.LatLng(parseFloat(point[0]), parseFloat(point[1]));
            polyPlot.push(center);
        }
        layerOfPolygon(MAP, polyPlot, color, polygonAlpha)
    }

    // geohash layer
    let dataGeohashFilter = [];
    let scoreArray = [];
    for (let i = 0; i < geohashData.length; i++) {
        let tmpRawGeoData = geohashData[i];
        let tmpScore = parseInt(tmpRawGeoData["score"]);
        if (tmpScore >= filterGeo) {
            dataGeohashFilter.push(tmpRawGeoData);
            scoreArray.push(tmpScore);
        }
    }
    const mean = average(scoreArray);
    const std = standardDeviation(scoreArray);
    const dataMax = parseInt(dataGeohashFilter[0]["score"] - mean) / std;
    const dataMin = parseInt(dataGeohashFilter[dataGeohashFilter.length - 1]["score"] - mean) / std;
    const radiusMax = 1.0;
    const radiusMin = 0.05;
    const concentMax = parseFloat(document.getElementById("concentration").value);

    for (let i = 0; i < dataGeohashFilter.length; ++i) {
        let geohash = dataGeohashFilter[i]["geohash"];
        let rawScore = dataGeohashFilter[i]["score"];
        let normalScore = ((parseInt(rawScore) - mean) / std);
        let score = ((normalScore - dataMin) / (dataMax - dataMin)) * (radiusMax - radiusMin) + radiusMin;
        let outputConcentration = ((normalScore - dataMin) / (dataMax - dataMin)) * (concentMax - radiusMin) + radiusMin;
        layerOfGeohash(MAP, geohash, score, outputConcentration, rawScore);
    }

    if (STORE_JSON !== undefined) {
        // layerOfMarker(MAP, STORE_JSON, [3000], false, null, false, 'other', markerImage);
        for (let i = 0; i < STORE_JSON.length; i++) {
            let center = new qq.maps.LatLng(STORE_JSON[i].lat, STORE_JSON[i].lng);
            let image = MARKER_DROP_DOWN[0].path
            for (let j = 0; j < MARKER_DROP_DOWN.length; j++){
                if (MARKER_DROP_DOWN[j].name == STORE_JSON[i].others) {
                    image = MARKER_DROP_DOWN[j].path
                }
            }
            addMarker(MAP, center, STORE_JSON[i].detail, image);
        }
    }
    selectArea()
}