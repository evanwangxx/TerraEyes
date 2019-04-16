// arcgis.js
// arcgis func for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


let HEAT_JSON;

window.onload = function () {
    let point = new qq.maps.LatLng(22.5228070000, 113.9353380000);
    loadMap(point, 15);
};

showProvince();

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

function csvHeatLoader() {
    $("#heat_data").change(function() {
        var fileSelector = $("#heat_data")[0].files;
        var file = fileSelector[0];

        $("fileNamesDes").text(fileSelector[0].name);
        var reader = new FileReader();
        reader.onload = function() {
            HEAT_JSON = processDataToJSON(this.result);
        };
        reader.readAsText(file);
    });
}

function runHeat(pointer, data = HEAT_JSON, store = TEXT_DATA) {
    let path = getIconPath();
    const power = parseInt(document.getElementById('heat-power').value);
    const m_name = document.getElementById('marker-name').value;
    let radius = selectCircleRadius();
    const arcgisData = {max: power, data: data};

    if (pointer) {
        console.log('INFO | pointer map');
        let latlng = userInputLatLng();
        let point = new qq.maps.LatLng(latlng[0], latlng[1]);
        loadMap(point, 14);

        addMarker(MAP, point, m_name, path + 'pointer.png');
        for (let j = 0; j < radius.length; j++) {
            addCircle(MAP, point, radius[j], 0.04, '#0040FF', 'circle');
        }
    } else {
        addressToLatLng(LOCATION_SELECT);
        loadMap(ADDRESS_POINT, 10);
    }

    layerOfHeat(MAP, arcgisData);

    if (store !== undefined) {
        layerOfMarker(MAP, store, radius, true);
    }
}