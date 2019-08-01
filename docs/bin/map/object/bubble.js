// bubble.js
// map-bubble library for TerraEyes
// (c) 2019 Hongbo Wang, Lixin Chen
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

const Bubble = class {
    constructor(map) {
        this.map = map;
        this.height = 700;
        this.strokeWeight = 0;
        this.strokeColor = "#FA5858";
        this.alpha = 0.5;
        this.visibleElementId = "visible-bubble"
    }

    setAlpha(alpha){
        this.alpha = parseFloat(alpha)
    }

    setStrokeWeight(strokeWeight){
        this.strokeWeight = parseFloat(strokeWeight)
    }

    setStrokeColor(strokeColor){
        this.strokeColor = strokeColor
    }

    setVisibleElementId(elementId) {
        this.visibleElementId = elementId;
    };

    /**
     * @param {object} center 经纬度点
     * @param {number} radius 气泡的半径 
     */
    addBubble(center, radius) {
        let option = {
            map: this.map,
            center: center,
            radius: radius,
            strokeColor: qq.maps.Color.fromHex(this.strokeColor, this.alpha),
            strokeWeight: this.strokeWeight,
            visible: true,
            fillColor: qq.maps.Color.fromHex(this.strokeColor, this.alpha)
        };
        let bubble = new qq.maps.Circle(option);

        try {
            let visible = document.getElementById(this.visibleElementId);
            setVisibleOption(visible, bubble, "click");
        } catch (err) {
            console.log(err.message);
        }

        qq.maps.event.addListener(bubble, 'click', function () {
            let info = new qq.maps.InfoWindow({map: this.map});
            info.open();
            info.setContent('<div style="text-align:center;white-space:nowrap;' + 'margin:10px;">' +
                "<br>半径：" + radius.toFixed(2) + '</div>');
            info.setPosition(center);
        });

        return bubble
    }

    /**
     * @param {array} data 例子:[{lat:31, lng:32, radius:100}]
     */
    addBubbleLayer(data){
        for (let i = 0; i < data.length; i++) {
            let row = data[i];
            let point = new qq.maps.LatLng(row.lat, row.lng);
            let radius = row.radius;
            this.addBubble(point, radius);
        }
    }
};   