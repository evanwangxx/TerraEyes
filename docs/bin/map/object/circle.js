// circle.js
// map-circle library for TerraEyes
// (c) 2019 Hongbo Wang
// (c) 2019 Lynx Chen
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

const Circle = class {
    constructor(map) {
        this.map = map;
        this.height = 700;
        this.strokeWeight = 1;
        this.color = "FA5858";
        this.fillWeight = 0.5;
        this.visibleElementId = "visible-circle";
    }

    setFillWeight(fillWeight) {
        this.fillWeight = parseInt(fillWeight)
    }

    setStrokeWeight(strokeWeight) {
        this.strokeWeight = parseInt(strokeWeight)
    }

    setColor(color) {
        this.color = color
    }

    addCircle(center, radius) {
        let option = {
            map: this.map,
            center: center,
            radius: radius,
            strokeColor: this.color,
            fillColor: null,
            strokeWeight: this.strokeWeight,
            zIndex: this.height
        };
        let circle = new qq.maps.Circle(option);

        try {
            let visible = document.getElementById(this.visibleElementId);
            setVisibleOption(visible, circle, "click");
        } catch (err) {
            console.log(err.message);
        }

        return circle
    }

    addDashCircle(center, radius) {
        let option = {
            map: this.map,
            center: center,
            radius: radius,
            strokeWeight: this.strokeWeight,
            strokeDashStyle: 'dash',
            cursor: 'pointer',
            fillColor: qq.maps.Color.fromHex(this.color, this.fillWeight),
            zIndex: this.height
        };
        let dashCircle = new qq.maps.Circle(option);

        try {
            let visible = document.getElementById(this.visibleElementId);
            setVisibleOption(visible, dashCircle, "click");
        } catch (err) {
            console.log(err.message);
        }

        return dashCircle
    }

    addCircleLayer(data, option = "other") {
        for (let i = 0; i < data.length; i++) {
            let row = data[i];
            let center = new qq.maps.LatLng(row.lat, row.lng);
            let radius = row.radius;

            if (option === "dashCircle") {
                this.addDashCircle(center, radius)
            } else {
                this.addCircle(center, radius)
            }
        }
    }
};