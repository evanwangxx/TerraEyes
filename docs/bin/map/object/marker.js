// marker.js
// map-marker library for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


const Marker = class {
    constructor(map, iconImage = "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png") {
        this.map = map;
        this.icon = new qq.maps.MarkerImage(iconImage);
        this.height = 1000
    }

    setMarker(center, text) {
        let marker = new qq.maps.Marker({
            map: this.map,
            position: center,
            animation: qq.maps.MarkerAnimation.DROP,
            zIndex: this.height,
            icon: this.icon,
            // shadow: null
        });

        qq.maps.event.addListener(marker, 'click', function () {
            let info = new qq.maps.InfoWindow({map: map});
            info.open();
            info.setContent('<div style="text-align:center;white-space:nowrap;' + 'margin:10px;">' + text + '</div>');
            info.setPosition(marker.getPosition());
        });
    }

    setMarkerLayer(data) {
        for (var i = 0; i < data.length; i++) {
            let row = data[i];
            let center = new qq.maps.LatLng(row.lat, row.lng);
            let text = row.text;
            this.setMarker(center, text);
        }

        // $('#isCircleChecked').click(function () {
        //     let radius = [3000];
        //     for (let j = 0; j < radius.length; j++) {
        //         // TODO: addCircle(****);
        //     }
        // });
        //
        // $('#isReachRadiusChecked').click(function () {
        //     /* TODO
        // let path1 = covertPointListToPath(markerData[i].path1);
        // let path2 = covertPointListToPath(markerData[i].path2);
        // let path3 = covertPointListToPath(markerData[i].path3);
        // addPolyline(map, path1, strokeColor = '#610206', strokeWeight = 3);
        // addPolyline(map, path2, strokeColor = '#611300', strokeWeight = 2);
        // addPolyline(map, path3, strokeColor = '#8a2200', strokeWeight = 1);
        //  */
        // });
    }
};