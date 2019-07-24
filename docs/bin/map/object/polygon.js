// polygon.js
// map-polygon library for TerraEyes
// (c) 2019 Xipeng Liu
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

const Polygon = class {
    constructor(map) {
        this.map = map;
        this.height = 900;
        this.strokeWeight = 2;
        this.zIndex = 100;
        this.elementId = "visible-polygon";
    };

    setStrokeWeight(strokeWeight) {
        this.strokeWeight = parseInt(strokeWeight);
    };

    setElementId(elementId) {
        this.elementId = elementId;
    };

    setZIndex(zIndex) {
        this.zIndex = parseInt(zIndex);
    };

    /**
     * 绘制多边形
     *
     * @param {Array} polygonArray 多边形经纬度点组成的数组
     * @param {string} color 边框和区域的填充颜色
     * @param {number} fillOpacity 区域填充的不透明度，取值[0, 1]，1表示完全不透明
     */
    addPolygon(polygonArray, color, fillOpacity) {
        let polygon = new qq.maps.Polygon({
            map: this.map,
            path: polygonArray,
            strokeColor: color,
            strokeWeight: this.strokeWeight,
            fillColor: qq.maps.Color.fromHex(color, fillOpacity),
            zIndex: this.zIndex
        });

        try {
            let visible = document.getElementById(this.elementId);
            qq.maps.event.addDomListener(visible, "click", function () {
                polygon.setMap(map);
                if (polygon.getVisible()) {
                    polygon.setVisible(false)
                } else {
                    polygon.setVisible(true)
                }
            });
        } catch (err) {
            console.log(err.message);
        }
    }
};