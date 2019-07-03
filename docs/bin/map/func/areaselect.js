// areaselect.js
// areaselect func for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

let startPoint = null, midPoint = null, listener = null, path = [];
let map, marker = null;
const center = new qq.maps.LatLng(39.916527, 116.397128);
map = new qq.maps.Map(document.getElementById('map-canvas'), {
    center: center,
    zoom: 14,
    disableDoubleClickZoom: true,
    scrollwheel: false,
    mapTypeControl: false
});
selectArea();
showProvince();

function reNewMap() {
    showAdderss();
    console.log(LOCATION_SELECT);
    addressToLatLng(LOCATION_SELECT);
    console.log(ADDRESS_POINT);
    map = new qq.maps.Map(document.getElementById('map-canvas'), {
        center: ADDRESS_POINT,
        zoom: 14,
        disableDoubleClickZoom: true,
        scrollwheel: true,
        mapTypeControl: false
    });
    selectArea()
}

function selectArea() {
    let polyline = new qq.maps.Polyline({
        clickable: true,
        cursor: 'crosshair',
        editable: true,
        map: map,
        path: path,
        strokeColor: '#1844ab',
        strokeDashStyle: 'dash',
        strokeWeight: 3,
        visible: true,
        zIndex: 1000
    });

    let polygon = new qq.maps.Polygon({
        clickable: true,
        cursor: 'crosshair',
        editable: true,
        fillColor: new qq.maps.Color(24, 68, 171, 0.4),
        map: map,
        path: path,
        strokeColor: '#1844ab',
        strokeDashStyle: 'dash',
        strokeWeight: 3,
        visible: true,
        zIndex: 1000
    });

    $("#startDraw").bind("click", function () {
        listener = qq.maps.event.addListener(map, 'dblclick', function (event) {
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
        }
    });

    qq.maps.event.addListener(map, 'click', function (event) {
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
    showProvince();
}

