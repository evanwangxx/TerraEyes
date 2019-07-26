// bubble.js
// map-bubble library for TerraEyes
// (c) 2019 Hongbo Wang
// (c) 2019 Lynxchen
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

const Bubble = class {
    constructor(map, level) {
        this.map = map;
        this.height = 700;
        this.strokeWeight = 0;
        this.strokColor = "#FA5858";
        this.alpha = 0.5
    }

    setAlpha(alpha){
        this.alpha = parseFloat(alpha)
    }

    setStrokeWeight(strokeWeight){
        this.strokeWeight = parseFloat(strokeWeight)
    }

    setStrokColor(strokColor){
        this.strokColor = strokColor
    }

    /**
     * 绘制气泡图
     *
     * @param {object} point 经纬度点 
     * @param {number} radius 气泡的半径 
     */
    setBubble(point, radius) {
        let level = this.level;
        let option = {
            map: this.map,
            center: point,
            radius: radius,
            strokColor: qq.maps.Color.fromHex(this.strokColor, this.alpha),
            strokWeight: this.strokeWeight,
            visible: true,
            fillColor: qq.maps.Color.fromHex(this.strokColor, this.alpha)
        };

        qq.maps.event.addListener(new qq.maps.Circle(option), 'click', function () {
            let info = new qq.maps.InfoWindow({map: this.map});
            info.open();
            info.setContent('<div style="text-align:center;white-space:nowrap;' + 'margin:10px;">' + "<br>半径：" + radius.toFixed(2) + '</div>');
            info.setPosition(point);
        });
    }

    /**
     * 绘制多个气泡图
     *
     * @param {array} data 例子:[{lat:31, lng:32, radius:100}]
     */
    setBubbleLayer(data){
        for (var i = 0; i < data.length; i++) {
            let row = data[i];
            let point = new qq.maps.LatLng(row.lat, row.lng);
            let radius = row.radius;
            this.setBubble(point, radius);
        }
    }
};   