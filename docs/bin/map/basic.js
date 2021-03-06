// basic.js
// basic-map library for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


const topHeight = 1000;
const midHeight = 500;
const bottHeight = 100;

function addBubble(map, point, radius, level, color = '#FA5858') {
    let option = {
        map: map,
        center: point,
        radius: radius,
        strokeWeight: 0,
        strokeColor: color,
        cursor: 'pointer',
        visible: true,
        fillColor: qq.maps.Color.fromHex(color, 0.5)
    };

    qq.maps.event.addListener(new qq.maps.Circle(option), 'click', function () {
        let info = new qq.maps.InfoWindow({map: MAP});
        info.open();
        info.setContent('<div style="text-align:center;white-space:nowrap;' + 'margin:10px;">' + "量级：" + level + "<br>半径：" + radius.toFixed(2) + '</div>');
        info.setPosition(point);
    });
}

function addCircle(map, center, radius, fillWeight = 0.05, color = '#FA5858', option = "other") {
    if (option === 'dashcircle') {
        option = {
            map: map,
            center: center,
            radius: radius,
            strokeWeight: 1,
            strokeDashStyle: 'dash',
            cursor: 'pointer',
            visible: true,
            fillColor: qq.maps.Color.fromHex(color, fillWeight),
            zIndex: topHeight
        }
    } else {
        option = {
            map: map,
            center: center,
            radius: radius,
            strokeColor: '#5858FA',
            fillColor: null,
            strokeDashStyle: 'dash',
            strokeWeight: 3.0,
        }
    }
    new qq.maps.Circle(option);
}

function addLabel(map, position, text, offsetOrNot, color = "#242424") {
    let label = new qq.maps.Label({
        map: map,
        content: text,
        position: position,
        style: {color: color, fontWeight: "bold"},
        zIndex: topHeight
    });

    let visible = document.getElementById("visible-label");
    qq.maps.event.addDomListener(visible, "click", function () {
        label.setMap(map);
        if (label.getVisible()) {
            label.setVisible(false)
        } else {
            label.setVisible(true)
        }
    });
}

function addMarker(map, center, text, markerImage = "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png") {
    let icon = new qq.maps.MarkerImage(markerImage);
    let marker = new qq.maps.Marker({
        position: center,
        animation: qq.maps.MarkerAnimation.DROP,
        map: map,
        zIndex: topHeight
    });

    marker.setIcon(icon);
    marker.setShadow(null);

    qq.maps.event.addListener(marker, 'click', function () {
        let info = new qq.maps.InfoWindow({map: map});
        info.open();
        info.setContent('<div style="text-align:center;white-space:nowrap;' + 'margin:10px;">' + text + '</div>');
        info.setPosition(marker.getPosition());
    });
}

function addGeohash(map, polygonArray, fillColor, score, listenerScore, rawScore = null, centerOfPoly = null, text = null) {
    let polygon = new qq.maps.Polygon({
        map: map,
        path: polygonArray,
        strokeColor: fillColor,
        strokeWeight: 0,
        fillColor: qq.maps.Color.fromHex(fillColor, score),
        zIndex: midHeight
    });

    // TODO: check sugar
    if (rawScore != null && centerOfPoly != null) {
        // qq.maps.event.addListener(polygon, 'click', function () {
        //     let info = new qq.maps.InfoWindow({map: map});
        //     info.open();
        //     info.setContent('<div style="text-align:center;white-space:nowrap;' + 'margin:10px;">' + '量级：' + rawScore + '<br>浓度：' + listenerScore.toFixed(2) + '</div>');
        //     info.setPosition(centerOfPoly);
        // });

        var textShow = "量级：" + rawScore + "<br>浓度：" + listenerScore.toFixed(2);
        var textWithinGeohash;
        if (text) {
            textWithinGeohash = text.replace(" ", "<br>");

            var label = addText(map, textWithinGeohash, polygonArray[0]);
            var labelInfo = addText(map, textWithinGeohash, polygonArray[0]);

            qq.maps.event.addDomListener(polygon, 'click', function (event) {
                if (labelInfo.getVisible()) {
                    labelInfo.setVisible(false);
                } else {
                    labelInfo.setVisible(true);
                }
            });

            qq.maps.event.addDomListener(label, "click", function(event) {
                // label.setMap(map);
                if (labelInfo.getVisible()) {
                    labelInfo.setVisible(false);
                } else {
                    labelInfo.setVisible(true);
                }
            });

            qq.maps.event.addDomListener(labelInfo, "click", function(event) {
                // label.setMap(map);
                if (labelInfo.getVisible()) {
                    labelInfo.setVisible(false);
                } else {
                    labelInfo.setVisible(true);
                }
            });

            qq.maps.event.addDomListener(polygon, 'mouseover', function (event) {
                label.setVisible(true);
                qq.maps.event.addDomListener(label, "click", function(event) {
                    label.setVisible(false)
                });
                qq.maps.event.addDomListener(polygon, 'mouseout', function (event) {
                    label.setVisible(false);
                });
            });
        }

        qq.maps.event.addListener(polygon, 'mouseover', function (event) {
            document.getElementById("polyinfo").innerHTML = textShow;
        });

        let visible = document.getElementById("visible-geohash");
        qq.maps.event.addDomListener(visible, "click", function () {
            polygon.setMap(map);
            if (polygon.getVisible()) {
                polygon.setVisible(false)
            } else {
                polygon.setVisible(true)
            }
        });
    }
}

function addPolygon(map, polygonArray, fillColor, alpha) {
    let polygon = new qq.maps.Polygon({
        map: map,
        path: polygonArray,
        strokeColor: fillColor,
        strokeWeight: 2,
        fillColor: qq.maps.Color.fromHex(fillColor, alpha),
        zIndex: bottHeight
    });

    let visible = document.getElementById("visible-polygon");
    qq.maps.event.addDomListener(visible, "click", function () {
        polygon.setMap(map);
        if (polygon.getVisible()) {
            polygon.setVisible(false)
        } else {
            polygon.setVisible(true)
        }
    });
}

function addPolyline(map, path, strokeColor = '#610B21', strokeWeight = 3) {
    let polyline = new qq.maps.Polyline({
        map: map,
        path: path,
        strokeColor: strokeColor,
        strokeWeight: strokeWeight,
        editable: false,
        zIndex: topHeight
    });

    let visible = document.getElementById("visible-polyline");
    qq.maps.event.addDomListener(visible, "click", function () {
        polyline.setMap(map);
        if (polyline.getVisible()) {
            polyline.setVisible(false)
        } else {
            polyline.setVisible(true)
        }
    });
}

function addText(map, text, center) {
    let cssP = {
        color: "#000",
        fontSize: document.getElementById("text-size").value + "px",
        fontWeight: "dash",
        backgroundColor: null
    };

    let textBlock = new qq.maps.Label({
        position: center,
        map: map,
        content: text,
        zIndex: bottHeight
    });

    textBlock.setStyle(cssP);

    let visibleF = document.getElementById("visible-text");
    qq.maps.event.addDomListener(visibleF, "click", function() {
        // textBlock.setMap(map);
        if (textBlock.getVisible()) {
            textBlock.setVisible(false);
        } else {
            textBlock.setVisible(true);
        }
    });

    return textBlock;
}

function loadMap(point, zoom = 3, mapTypeId = qq.maps.MapTypeId.ROADMAP) {
    let mapContainer = document.getElementById("map-canvas");
    let options = {
        center: point,
        zoom: zoom,
        noClear: true,
        mapStyleId: 'style1',
        mapTypeId: mapTypeId,
        zoomControl: true,
        zoomControlOptions: {position: qq.maps.ControlPosition.TOP_LEFT},
        scaleControl: true,
        scaleControlOptions: {position: qq.maps.ControlPosition.BOTTOM_RIGHT},
        disableDoubleClickZoom: true
    };
    MAP = new qq.maps.Map(mapContainer, options);
}