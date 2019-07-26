// circle.js
// map-circle library for TerraEyes
// (c) 2019 Hongbo Wang
// (c) 2019 Lynx Chen
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

const Circle = class {
    constructor(map) {
        this.map = map;
        this.height = 1000;
        this.strokeWeight = 1;
        this.fillWeight = 0.05;
        this.color = "FA5858"
    }

    setFillWeight(fillWeight) {
        this.fillWeight = parseInt(fillWeight)
    }

    setStrokeWeight(strokeWeight) {
        this.strokeWeight = parseInt(strokeWeight)
    }

    setColor(color){
        this.color = color
    }

    addDashCircle(center, radius) {
        let option = {
                map: this.map,
                center: center,
                radius: radius,
                strokeWeight: this.strokeWeight,
                strokeDashStyle: 'dash',
                cursor: 'pointer',
                visible: true,
                fillColor: qq.maps.Color.fromHex(this.color, this.fillWeight),
                zIndex: this.height
            };
        new qq.maps.Circle(option)

    }

    addCircle(center, radius) {
        let option = {
            map: this.map,
            center: center,
            radius: radius,
            strokeColor: this.color,
            fillColor: null,
            strokeDashStyle: 'dash',
            strokeWeight: this.strokeWeight
        };
        new qq.maps.Circle(option)
    }

    addCircleLayer(data, option="other") {
        for (var i = 0; i < data.length; i++) {
            let row = data[i];
            let center = new qq.maps.LatLng(row.lat, row.lng);
            let radius = row.radius;
            if (option === "dashcircle") {
                this.addDashCircle(center, radius)
            } else {
                this.addCircle(center, radius)
            }
        }
    }
};