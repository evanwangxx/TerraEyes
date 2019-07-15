// pointer.js
// point func for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

let text_parse;

const color_drop_down = document.getElementById("pointer-map-dropdown-color");
for (let i = 0; i < CORLOR_DROP_DOWN.length; i++) {
    color_drop_down.options.add(new Option(CORLOR_DROP_DOWN[i].name, CORLOR_DROP_DOWN[i].length));
    if (i === 6) {
        color_drop_down.options[i].selected = true;
    }
}

let circleDropDownA = document.getElementById("pointer-map-dropdown-circle-a");
let circleDropDownB = document.getElementById("pointer-map-dropdown-circle-b");
let circleDropDownC = document.getElementById("pointer-map-dropdown-circle-c");

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

$('#pointer-map-parse-data').bind("click", function () {
        let text = $.trim($("textarea").val());
        if (text !== "") {
            let json = processDataToJSON(text, ['lat', "lng", 'detail'], ',');
            let myselect = document.getElementById("lat-lng-convert").selectedIndex;
            console.log(myselect);

            if (myselect === 2) {
                for (let i = 0; i < json.length; i++) {
                    let latLng = convertGcj02Bd09(json[i].lat, json[i].lng);
                    json[i].lat = latLng[0];
                    json[i].lng = latLng[1];
                    // json[i].transfer_paste = latLng[0] + "," + latLng[1];
                }
                console.log("INFO: To Baidu Map");
            } else if (myselect === 1) {
                for (let i = 0; i < json.length; i++) {
                    let latLng = convertBd09Gcj02(json[i].lat, json[i].lng);
                    json[i].lat = latLng[0];
                    json[i].lng = latLng[1];
                }
                console.log("INFO: To Tencent/Gaode Map");
            } else {
                console.log("INFO: Stay");
            }
            jsonToTable(json, "#trans_data", json.length);
            text_parse = json;
        } else {
            alert("输入的字符是空的~~")
        }
    }
);

$('#pointer-map-draw-map').bind("click", function () {
    console.log(text_parse);
    var point = new qq.maps.LatLng(text_parse[0].lat, text_parse[0].lng);
    var color = clickColorList("pointer-map-dropdown-color");
    var radius = [clickCircleList("pointer-map-dropdown-circle-a"),
        clickCircleList("pointer-map-dropdown-circle-b"),
        clickCircleList("pointer-map-dropdown-circle-c")];

    loadMap(point, zoom = 14);
    layerOfMarker(MAP, text_parse, radius, true, color);
});