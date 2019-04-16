// pointer.js
// point func for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


const color_drop_down = document.getElementById("color-dd");
for (let i = 0; i < CORLOR_DROP_DOWN.length; i++) {
    color_drop_down.options.add(new Option(CORLOR_DROP_DOWN[i].name, CORLOR_DROP_DOWN[i].length));
    if (i === 6) {
        color_drop_down.options[i].selected = true;
    }
}

let circleDropDownA = document.getElementById("circle_1");
let circleDropDownB = document.getElementById("circle_2");
let circleDropDownC = document.getElementById("circle_3");

for (let i = 0; i < CIRCLE_DROP_DOWN.length; i++) {
    circleDropDownA.options.add(new Option(CIRCLE_DROP_DOWN[i].name, CIRCLE_DROP_DOWN[i].length));
    circleDropDownB.options.add(new Option(CIRCLE_DROP_DOWN[i].name, CIRCLE_DROP_DOWN[i].length));
    circleDropDownC.options.add(new Option(CIRCLE_DROP_DOWN[i].name, CIRCLE_DROP_DOWN[i].length));

    if (i === 3) {
        circleDropDownA.options[i].selected = true;
    } else if (i === 5) {
        circleDropDownB.options[i].selected = true;
    } else if (i === 7) {
        circleDropDownC.options[i].selected = true;
    }
}

function runPoint(data = TEXT_DATA) {
    var point = new qq.maps.LatLng(data[0].lat, data[0].lng);

    let color = clickColorList("color-dd");
    let radius = selectCircleRadius();

    loadMap(point, zoom = 14);
    layerOfMarker(MAP, data, radius = radius, circle = true, color = color);
}