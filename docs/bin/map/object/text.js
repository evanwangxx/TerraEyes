// text.js
// map-text library for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

const Text = class {
	constructor(map, elementId="visible-text") {
		this.map = map;
		this.height = 900;
		this.color = "#000";
		this.fontWeight = "dash";
		this.backgroundColor = null;
		this.elementId = elementId
	};

	setText(center, text, fontSize="4") {
		let cssP = {
			color: this.color,
			fontSize: fontSize + "px",
			fontWeight: this.fontWeight,
			backgroundColor: this.backgroundColor
		};

		let textBlock = new qq.maps.Label({
			position: center,
			map: this.map,
			content: text,
			zIndex: this.height
		});

		textBlock.setStyle(cssP);

		try{
			let visibleF = document.getElementById(this.elementId);
			qq.maps.event.addDomListener(visibleF, "click", function() {
				if (textBlock.getVisible()) {
					textBlock.setVisible(false);
				} else {
					textBlock.setVisible(true);
				}
			});
		}
		catch (err) {
			console.log(err.message)
		}
	}
};