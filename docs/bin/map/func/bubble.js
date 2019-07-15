// bubble.js
// bubble func for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


let BUBBLE_JSON;

window.onload = function () {
    let point = new qq.maps.LatLng(22.5228070000, 113.9353380000);
    loadMap(point, 15);
};

showProvince();

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

function csvBubbleLoader() {
    $("#bubble_data").change(function () {
        var fileSelector = $("#bubble_data")[0].files;
        var file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        var reader = new FileReader();
        reader.onload = function () {
            BUBBLE_JSON = processDataToJSON(this.result);
        };
        reader.readAsText(file);
    });
}

function runBubble(pointer, data = BUBBLE_JSON, store = TEXT_DATA) {
    let iconPath = getIconPath();
    let maxBubbleNumber = parseInt(document.getElementById("max-bubble").value);
    let markerName = document.getElementById("marker-name").value;
    let radius = selectCircleRadius();
    let color = clickColorList("color-dd");

    let radiusMax = parseInt(document.getElementById("r-max").value);
    let radiusMin = parseInt(document.getElementById("r-min").value);

    Object.freeze(BUBBLE_JSON);
    let dataSort = quickSort([...data]);
    console.log(dataSort);

    if (pointer) {
        console.log("pointer map");
        let latlng = userInputLatLng();
        let point = new qq.maps.LatLng(latlng[0], latlng[1]);
        loadMap(point, 14);
        addMarker(MAP, point, markerName, iconPath + "pointer.png");
        for (let j = 0; j < radius.length; ++j) {
            addCircle(MAP, point, radius[j], fillWeight = 0.04, color = "#0040FF", option = "circle");
        }

    } else {
        addressToLatLng(LOCATION_SELECT);
        console.log(ADDRESS_POINT);
        loadMap(ADDRESS_POINT, 10);
    }

    layerOfBubble(MAP, dataSort, color, maxBubbleNumber, radiusMin, radiusMax);

    if (store !== undefined) {
        layerOfMarker(MAP, store, radius, true);
    }
}