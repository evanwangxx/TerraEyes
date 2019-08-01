// label.js
// map-bubble library for TerraEyes
// (c) 2019 Hongbo Wang, Lixin Chen, Xipeng Liu
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

const Label = class {
    constructor(map) {
        this.map = map;
        this.height = 1000;
        this.style = {color: "#242424", fontWeight: "bold"};
        this.visibleElementId = "visible-label"
    }

    setVisibleElementId(elementId) {
        this.visibleElementId = elementId;
    };

    /**
     * @param style: json {color: "#242424", fontWeight: "bold"}
     */
    setStyle(style) {
        this.style = style;
    };

    addLabel(center, text) {
        let label = new qq.maps.Label({
            map: this.map,
            position: center,
            zIndex: this.height,
            content: text,
            style: this.style
        });

        try {
            let visible = document.getElementById(this.visibleElementId);
            setVisibleOption(visible, label, "click");
        } catch (err) {
            console.log(err.message);
        }

        return label
    }

    /**
     * @param data: {lat: 23.123, lng: 123.12, text: "haha" }
     */
    addLabelLayer(data) {
        for (let i = 0; i < data.length; i++) {
            let row = data[i];
            let center = new qq.maps.LatLng(row.lat, row.lng);
            this.addLabel(center, row.text);
        }
    }
};

const Text = class {
    constructor() {
        this.map = map;
        this.height = 1000;
        this.color = "#000";
        this.fontWeight = "dash";
        this.fontSize = "4";
        this.backgroundColor = null;
        this.elementId = "visible-text"
    };

    setFontSize(size) {
        this.fontSize = size.toString();
    };

    /**
     * @param {Object} center 需添加文案的位置，经纬度点qq.maps.LatLng
     * @param {string} text 具体文案
     */
    addText(center, text) {
        let cssP = {
            position: center,
            map: this.map,
            content: text,
            zIndex: this.height,
            color: this.color,
            fontSize: this.fontSize + "px",
            fontWeight: this.fontWeight,
            backgroundColor: this.backgroundColor
        };

        let textBlock = new qq.maps.Label(cssP);

        textBlock.setStyle(cssP);

        try {
            let visible = document.getElementById(this.elementId);
            setVisibleOption(visible, textBlock, "click");
        } catch (err) {
            console.log(err.message);
        }

        return textBlock
    }
};