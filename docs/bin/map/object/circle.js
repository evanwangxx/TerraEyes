// circle.js
// map-circle library for TerraEyes
// (c) 2019 Hongbo Wang
// (c) 2019 Lynx Chen
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

const Circle = class {
    constructor(map, option = "other") {
        this.map = map;
        this.height = 1000;
        this.strokeWeight = 1;
        this.fillWeight = 0.05;
        this.option = option
    }

    setFillWeight(fillWeight){
        this.fillWeight = parseInt(fillWeight)
    }

    setStrokeWeight(strokeWeight){
        this.strokeWeight = parseInt(strokeWeight)
    }


    setCircle(center, radius, color = '#FA5858') {
        if (this.option === 'dashcircle') {
            this.option = {
                map: this.map,
                center: center,
                radius: radius,
                strokeWeight: this.strokeWeight,
                strokeDashStyle: 'dash',
                cursor: 'pointer',
                visible: true,
                fillColor: qq.maps.Color.fromHex(color, this.fillWeight),
                zIndex: this.height
            }
        } else {
            this.option = {
                map: this.map,
                center: center,
                radius: radius,
                strokeColor: color,
                fillColor: null,
                strokeDashStyle: 'dash',
                strokeWeight: this.strokeWeight
            }
        };
        new qq.maps.Circle(this.option)
    }

    setCircleLayer(data) {
        for (var i = 0; i < data.length; i++) {
            let row = data[i];
            let center = new qq.maps.LatLng(row.lat, row.lng);
            let radius = row.radius;
            this.setCircle(center, radius);
        }
    }
};