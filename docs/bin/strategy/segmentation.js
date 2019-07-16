// segmentation.js
// segmentation strategy for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

let POLYGON_JSON;
let GEOHASH_JSON;
let STORE_JSON;
let MAP;

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

const marker_drop_down = document.getElementById("marker-dd");
for (let i = 0; i < MARKER_DROP_DOWN.length; i++) {
    marker_drop_down.options.add(new Option(MARKER_DROP_DOWN[i].name, MARKER_DROP_DOWN[i].path));
    if (i === 1) {
        marker_drop_down.options[i].selected = true;
    }
}

function csvPolygon() {
    $('#polygon_data').change(function () {
        let fileSelector = $('#polygon_data')[0].files;
        let file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        let reader = new FileReader();
        reader.onload = function () {
            POLYGON_JSON = quickSort(processDataToJSON(this.result, ['polygon', 'score']));
        };
        reader.readAsText(file);
    });
}

function csvGeohash() {
    $('#geohash_data').change(function () {
        let fileSelector = $('#geohash_data')[0].files;
        let file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        let reader = new FileReader();
        reader.onload = function () {
            GEOHASH_JSON = quickSort(processDataToJSON(this.result, ['geohash', 'score', 'text']));
        };
        reader.readAsText(file);
    });
}

function csvStoreLoader(header = ["detail", "lat", "lng", "others"]) {
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

function runSegmentation(pointer, geohashData = GEOHASH_JSON, polyData = POLYGON_JSON, filterGeo = 30, filterPoly = 30) {
    const polygonAlpha = parseFloat(document.getElementById("polygon-alpha").value);
    const mapZoomLevel = parseInt(document.getElementById("map-zoom-level").value);
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
        loadMap(point, mapZoomLevel);
    } else {
        let center = new qq.maps.LatLng(maxBubbleLocation[0], maxBubbleLocation[1]);
        loadMap(center, mapZoomLevel);
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

    selectArea();

    let startPoint = null, midPoint = null, listener = null, path = [];
    let marker = null;

    let polyline = new qq.maps.Polyline({
        clickable: true,
        cursor: 'crosshair',
        editable: true,
        map: MAP,
        path: path,
        strokeColor: '#FF0080',
        strokeDashStyle: 'dash',
        strokeWeight: 3,
        visible: true,
        zIndex: 100
    });

    let polygon = new qq.maps.Polygon({
        clickable: true,
        cursor: 'crosshair',
        editable: true,
        fillColor: new qq.maps.Color(24, 68, 171, 0.2),
        map: MAP,
        path: path,
        strokeColor: '#FF0080',
        strokeDashStyle: 'dash',
        strokeWeight: 3,
        visible: true,
        zIndex: 100
    });

    function reNewMap() {
        showAdderss();
        console.log(LOCATION_SELECT);
        addressToLatLng(LOCATION_SELECT);
        console.log(ADDRESS_POINT);
        MAP = new qq.maps.Map(document.getElementById('map-canvas'), {
            center: ADDRESS_POINT,
            zoom: 14,
            disableDoubleClickZoom: true,
            scrollwheel: true,
            mapTypeControl: false
        });
        selectArea()
    }

    function selectArea() {
        $("#startDraw").bind("click", function () {
            listener = qq.maps.event.addListener(MAP, 'dblclick', function (event) {
                if (startPoint == null) {
                    path = [];
                    startPoint = event.latLng;
                    path.push(event.latLng);
                    polyline.setPath(path);
                }
            });
        });

        $("#delDraw").bind("click", function () {
            polyline.setPath([]);
            polygon.setPath([]);
            startPoint = midPoint = null;
        });

        $("#resetDraw").bind("click", function () {
            location.reload();
        });

        $("#stopDraw").bind("click", function () {
            if (path) {
                path = [];
                if (polyline.getPath().getLength() > 0) {
                    polyline.getPath().forEach(function (element, index) {
                        path.push(element);
                    });
                    polyline.setPath([]);
                }
                if (polygon.getPath().getLength() > 0) {
                    polygon.getPath().forEach(function (element, index) {
                        path.push(element);
                    })
                }
                polygon.setPath(path);
                console.log(path);
                let jsonPrint = "";
                for (let index in path) {
                    jsonPrint = jsonPrint + path[index] + '\n'
                }
                console.log(jsonPrint);
                document.getElementById('out_pre').innerText = jsonPrint;
                startPoint = midPoint = null;
                qq.maps.event.removeListener(listener);

                let sumOfGeohashInBound = 0;
                for (let i = 0; i < dataGeohashFilter.length; ++i) {
                    let geohash = dataGeohashFilter[i]["geohash"];
                    let rawScore = dataGeohashFilter[i]["score"];

                    this.box = decodeGeoHash(geohash);
                    let center = new qq.maps.LatLng(
                        (this.box.latitude[1] + this.box.latitude[0]) / 2.0, (this.box.longitude[1] + this.box.longitude[0]) / 2);

                    if (path.length !== 0) {
                        let containOrNot = polygon.getBounds().contains(center);
                        console.log(containOrNot, typeof containOrNot);
                        if (containOrNot == true) {
                            sumOfGeohashInBound = sumOfGeohashInBound + parseInt(rawScore);
                            console.log(sumOfGeohashInBound, rawScore, containOrNot)
                        }
                    }
                }
                console.log(sumOfGeohashInBound);
                document.getElementById('out_sumOfGeohashInBound').innerText = sumOfGeohashInBound.toString();
            }
        });

        qq.maps.event.addListener(MAP, 'click', function (event) {
            if (startPoint != null) {
                path = [];
                polyline.getPath().forEach(function (element, index) {
                    path.push(element);
                });
                path.push(event.latLng);
                midPoint = event.latLng;
                polyline.setPath(path);
            }
        });
    }


    for (let i = 0; i < dataGeohashFilter.length; ++i) {
        let geohash = dataGeohashFilter[i]["geohash"];
        let rawScore = dataGeohashFilter[i]["score"];
        let textShow = dataGeohashFilter[i]["text"];
        let normalScore = ((parseInt(rawScore) - mean) / std);
        let score = ((normalScore - dataMin) / (dataMax - dataMin)) * (radiusMax - radiusMin) + radiusMin;
        let outputConcentration = ((normalScore - dataMin) / (dataMax - dataMin)) * (concentMax - radiusMin) + radiusMin;
        layerOfGeohash(MAP, geohash, score, outputConcentration, rawScore, textShow);
    }


    if (STORE_JSON !== undefined) {
        // layerOfMarker(MAP, STORE_JSON, [3000], false, null, false, 'other', markerImage);
        for (let i = 0; i < STORE_JSON.length; i++) {
            let center = new qq.maps.LatLng(STORE_JSON[i].lat, STORE_JSON[i].lng);
            let image = MARKER_DROP_DOWN[0].path;
            for (let j = 0; j < MARKER_DROP_DOWN.length; j++) {
                if (MARKER_DROP_DOWN[j].name === STORE_JSON[i].others) {
                    image = MARKER_DROP_DOWN[j].path
                }
            }
            addMarker(MAP, center, STORE_JSON[i].detail, image);
        }
    }
}

