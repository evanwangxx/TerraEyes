// layer.js
// map-layer library for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


function layerOfBubble(map, dataSort, color, maxBubble = 500, radiusMin = 50, radiusMax = 800) {
    const dataMax = dataSort[0]['score'];
    const dataMin = dataSort[dataSort.length - 3]['score'];

    for (let i = 0; i < dataSort.length - 1 && i < maxBubble; i++) {
        let point = new qq.maps.LatLng(dataSort[i]['lat'], dataSort[i]['lng']);
        let level = dataSort[i]['score'];
        let radius = ((parseInt(level) - dataMin) / (dataMax - dataMin)) * (radiusMax - radiusMin) + radiusMin;

        if (!isNaN(radius)) {
            let rank = i + 1;
            addBubble(map, point, radius, level, color);
            addLabel(map, point, rank + '. ' + dataSort[i]['score'], '#242424');
        }
    }
}

function layerOfHeat(map, heatData, valueField = 'score', radius = 1, maxOpacity = 0.8) {
    qq.maps.event.addListenerOnce(map, 'idle', function () {
        if (QQMapPlugin.isSupportCanvas) {
            let options = {
                'radius': radius,
                'maxOpacity': maxOpacity,
                'useLocalExtrema': false,
                'valueField': valueField
            };

            const heatmap = new QQMapPlugin.HeatmapOverlay(map, options);
            heatmap.setData(heatData);
        } else {
            alert('您的浏览器不支持canvas，无法绘制热力图！');
        }
    });
}

function layerOfGeohash(map, geohash, score, listenerScore, rawScore) {
    this.box = decodeGeoHash(geohash);
    let color = getColr(0.92);

    const polygonArr = [new qq.maps.LatLng(this.box.latitude[1] * 1.0, this.box.longitude[0] * 1.0),
        new qq.maps.LatLng(this.box.latitude[1] * 1.0, this.box.longitude[1] * 1.0),
        new qq.maps.LatLng(this.box.latitude[0] * 1.0, this.box.longitude[1] * 1.0),
        new qq.maps.LatLng(this.box.latitude[0] * 1.0, this.box.longitude[0] * 1.0)];

    let centerOfPoly = new qq.maps.LatLng(
        (this.box.latitude[1] + this.box.latitude[0]) / 2.0, (this.box.longitude[1] + this.box.longitude[0]) / 2);
    addGeohash(map, polygonArr, color, score, listenerScore, rawScore, centerOfPoly);
    return centerOfPoly;
}

function layerOfPolygon(map, polygon_array, color, alpha) {
    addPolygon(map, polygon_array, color, alpha)
}

function layerOfMarker(map, markerData, radius = [3000], isCircle = false, color = '#FA5858', reachRadius = false, circleOption = 'dashcircle', image = null) {
    for (let i = 0; i < markerData.length; i++) {
        let center = new qq.maps.LatLng(markerData[i].lat, markerData[i].lng);
        if (image === null) {
            addMarker(map, center, markerData[i].detail);
        } else {
            addMarker(map, center, markerData[i].detail, image);
        }

        if (isCircle) {
            for (let j = 0; j < radius.length; ++j) {
                addCircle(map, center, radius[j], fillWeight = 0.04, color = color, option = circleOption);
            }
        }

        if (reachRadius) {
            let path1 = covertPointListToPath(markerData[i].path1);
            let path2 = covertPointListToPath(markerData[i].path2);
            let path3 = covertPointListToPath(markerData[i].path3);
            addPolyline(map, path1, strokeColor = '#610206', strokeWeight = 3);
            addPolyline(map, path2, strokeColor = '#611300', strokeWeight = 2);
            addPolyline(map, path3, strokeColor = '#8a2200', strokeWeight = 1);
        }
    }
}
