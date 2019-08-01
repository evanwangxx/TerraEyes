// geohash.js
// geohash job for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


let GEOHASH_JSON;
let STORE_JSON;

window.onload = function () {
    let point = new qq.maps.LatLng(22.5228070000, 113.9353380000);
    loadMap(point, 15);
};

function csvGeohash() {
    $('#geohash_data').change(function () {
        let fileSelector = $('#geohash_data')[0].files;
        let file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        let reader = new FileReader();
        reader.onload = function () {
            GEOHASH_JSON = quickSort(processDataToJSON(this.result, ['geohash', 'score']));
        };
        reader.readAsText(file);
    });
}

function csvStoreLoaderWithPath(header = ["lat", "lng", "path1", "path2", "path3"]) {
    $("#store_data").change(function () {
        let fileSelector = $("#store_data")[0].files;
        let file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        let reader = new FileReader();
        reader.onload = function () {
            STORE_JSON = processDataToJSON(this.result, header, ',');
        };
        reader.readAsText(file);
    });
}

function runGeohash(pointer = false, dataGeohash = GEOHASH_JSON, filter = 30) {
    let dataGeohashFilter = [];
    let scoreArray = [];
    for (let i = 0; i < dataGeohash.length; ++i) {
        let tmpRawGeoData = dataGeohash[i];
        let tmpScore = parseInt(tmpRawGeoData["score"]);
        if (tmpScore >= filter) {
            dataGeohashFilter.push(tmpRawGeoData);
            scoreArray.push(tmpScore);
        }
    }
    let mean = average(scoreArray);
    let std = standardDeviation(scoreArray);

    if (pointer) {
        console.log("INFO | pointer map");
        let latlng = userInputLatLng();
        let point = new qq.maps.LatLng(latlng[0], latlng[1]);
        loadMap(point, 14);
    } else {
        let point = decodeGeoHash(dataGeohashFilter[0]['geohash']);
        let center = new qq.maps.LatLng(point.latitude[1], point.longitude[1]);
        loadMap(center, 13);
    }

    if (STORE_JSON !== undefined) {
        layerOfMarker(MAP, STORE_JSON, [3000], false, null, true, 'other');
    }

    const dataMax = parseInt(dataGeohashFilter[0]["score"] - mean) / std;
    const dataMin = parseInt(dataGeohashFilter[dataGeohashFilter.length - 1]["score"] - mean) / std;
    const radiusMax = 1.00;
    const radiusMin = 0.05;

    for (let i = 0; i < dataGeohashFilter.length; ++i) {
        let geohash = dataGeohashFilter[i]["geohash"];
        let rawScore = dataGeohashFilter[i]["score"];
        let normalScore = ((parseInt(rawScore) - mean) / std);
        let score = ((normalScore - dataMin) / (dataMax - dataMin)) * (radiusMax - radiusMin) + radiusMin;
        layerOfGeohash(MAP, geohash, score, score, rawScore);
    }

}