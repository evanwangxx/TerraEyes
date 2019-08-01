// pointer.js
// point job for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


// init circle-dropdown and color-dropdown
new CircleDropDown().initialCircleMenu();
new ColorDropDown().initialColorMenu();

let textParse;
const dataParser = new DataParser();

// parse data to json
$('#pointer-map-parse-data').bind("click", function () {
    textParse = dataParser.getGeoPasteText("textarea", "#trans_data")
});


// draw map
$('#pointer-map-draw-map').bind("click", function () {
    var point = new qq.maps.LatLng(textParse[0].lat, textParse[0].lng);
    var color = getMenuValue("color-dd-menu");
    var radius = [
        getMenuValue("circle-dd-menu-1"),
        getMenuValue("circle-dd-menu-2"),
        getMenuValue("circle-dd-menu-3")
    ];

    let mapContainer = document.getElementById("map-canvas");
    let options = {
        center: point,
        zoom: 12,
        noClear: true,
        mapStyleId: 'style1',
        zoomControl: true,
        zoomControlOptions: {position: qq.maps.ControlPosition.TOP_LEFT},
        scaleControl: true,
        scaleControlOptions: {position: qq.maps.ControlPosition.BOTTOM_RIGHT},
        disableDoubleClickZoom: true
    };
    let map = new qq.maps.Map(mapContainer, options);
    new Marker(map).addMarkerLayer(textParse)
});