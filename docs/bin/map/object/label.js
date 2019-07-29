// bubble.js
// map-bubble library for TerraEyes
// (c) 2019 Hongbo Wang
// (c) 2019 Lynxchen
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

const Label = class {
    constructor(map, elementId="visible-label") {
        this.map = map;
        this.height = 1000;
        this.style = {color: "#242424", fontWeight: "bold"};
        this.elementId = elementId
    }

    setLabel(center, text) {
        let label = new qq.maps.Label({
            map: this.map,
            position: center,
            zIndex: this.height,
            content: text,
            style: this.style
        });

        let visible = document.getElementById(this.elementId);
        qq.maps.event.addDomListener(visible, "click", function () {
            label.setMap(map);
            if (label.getVisible()) {
                label.setVisible(false)
            } else {
                label.setVisible(true)
            }
        });
    }

    setLabelLayer(data) {
        for (var i = 0; i < data.length; i++) {
            let row = data[i];
            let center = new qq.maps.LatLng(row.lat, row.lng);
            let text = row.text;
            this.setLabel(center, text);
        }
    }
};