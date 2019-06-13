// utilcommon.js
// common utility file for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


function getIconPath() {
    const js = document.scripts;
    let path = js[js.length - 1].src.substring(0, js[js.length - 1].src.lastIndexOf("/"));
    path = path.substring(0, path.lastIndexOf("bin")) + "/css/icon/";

    return path
}

// Data statistics and sort
function average(data) {
    let sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);
    return sum / data.length
}

function standardDeviation(values) {
    let avg = average(values);
    let squareDiffs = values.map(function (value) {
        let diff = value - avg;
        return diff * diff
    });
    let avgSquareDiff = average(squareDiffs);
    return Math.sqrt(avgSquareDiff)
}

function quickSort(data, by = 'score') {
    if (data.length <= 1) {
        return data;
    }
    let pivotIndex = Math.floor(data.length / 2);
    let pivot = data.splice(pivotIndex, 1)[0];
    let left = [];
    let right = [];

    for (let i = 0; i < data.length; ++i) {
        if (parseInt(data[i][by]) >= parseInt(pivot[by])) {
            left.push(data[i]);
        } else {
            right.push(data[i]);
        }
    }

    return quickSort(left).concat([pivot], quickSort(right));
}


// data interaction
let TEXT_DATA;

function getPasteText(table_id = "#trans_data") {
    $("text-input").ready(function () {
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
                    // json[i].transfer_paste = latLng[0] + "," + latLng[1];
                }
                console.log("INFO: To Tencent/Gaode Map");
            } else {
                console.log("INFO: Stay");
            }
            jsonToTable(json, table_id, json.length);
            TEXT_DATA = json;
        } else {
            alert("输入的字符是空的~~")
        }
    });
}

function processDataToJSON(csv, header = ['lat', "lng", "score", "detail"], split = ',') {
    let allTextLines = csv.split(/\r\n|\n/);
    let lines = [];

    for (let i = 0; i < allTextLines.length; i++) {
        let data = allTextLines[i].split(split);
        let tmp_dict = {};

        for (let j = 0; j < data.length; j++) {
            tmp_dict[header[j]] = data[j];
        }
        lines.push(tmp_dict);
    }
    return lines;
}

function jsonToTable(json, id, num = 10, sub = false) {
    let html = "";
    let json_headLine = json.slice(0, num);

    $.each(json_headLine, function (index, item) {

        if (index === 0) {
            html += "<tr>";
            $.each(item, function (vlaIndex) {
                html += "<td><font face=\"Arial\" size=3>";
                html += vlaIndex;
                html += "</font></td>";
            });
            html += "</tr>";
        }

        html += "<tr>";
        $.each(item, function (vlaIndex, valItem) {
            html += "<td><font face=\"Arial\" size=2>";
            if (sub) {
                valItem = valItem.substring(0, 30) + " ... "
            }
            html += valItem;
            html += "</td>";
        });

        html += "</font></tr>";
    });

    $(id).html(html);
}


// user interaction
function userInputLatLng() {
    let lat = prompt("Please enter latitude: ", "22.627453");
    let lng = prompt("Please enter longtitude: ", "114.030207");

    if (lat != null && lng != null) {
        alert("latitude: " + lat + " | longtitude: " + lng);
    } else if (lat == null) {
        alert("latitude is null !");
    } else if (lng == null) {
        alert("longtitude is null !");
    } else {
        alert("cancel");
    }

    return [Number(lat), Number(lng)];
}

function $$(str) {
    return document.getElementById(str);
}

let ADDRESS_PROV_CITY_COUN = $$("pcc_show"); // selected area
let BTN = document.getElementsByClassName('met1')[0];
let PROV_DROPDOWN = $$("province_dropdown");
let CITY_DROPDOWN = $$("city_dropdown");
let COUN_DROPDOWN = $$("country_dropdown");

let CURRENT_PCC = {prov: "", city: "", country: ""};

function showProvince() {
    // BTN.disabled = false;
    for (let i = 0; i < PROVINCE_CITY_COUNTRY.length; i++) {
        let province_option = document.createElement("option");
        province_option.innerText = PROVINCE_CITY_COUNTRY[i]["name"];
        province_option.value = i;

        PROV_DROPDOWN.appendChild(province_option);
    }
}

function showCity(object) {
    let value = object.options[object.selectedIndex].value;

    if (value !== CURRENT_PCC.prov) {
        CURRENT_PCC.prov = value;
        ADDRESS_PROV_CITY_COUN.value = "";
    }
    if (value != null) {
        CITY_DROPDOWN.length = 1;

        for (let i = 0; i < PROVINCE_CITY_COUNTRY[value]["city"].length; i++) {
            let city_option = document.createElement("option");
            city_option.innerText = PROVINCE_CITY_COUNTRY[value]["city"][i].name;
            city_option.value = i;
            CITY_DROPDOWN.appendChild(city_option);
        }
    }
}

function showCountry(object) {
    let value = object.options[object.selectedIndex].value;
    CURRENT_PCC.city = value;

    if (value != null) {
        // COUN_DROPDOWN.length = 1; // leave 1 item - default selection
        let length = PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov]["city"][value].districtAndCounty.length;

        if (length === 0) {
            ADDRESS_PROV_CITY_COUN.value = PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov].name +
                PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov]["city"][CURRENT_PCC.city].name;
            return;
        }
        for (let i = 0; i < length; i++) {
            let country_option = document.createElement("option");
            country_option.innerText = PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov]["city"][value].districtAndCounty[i];
            country_option.value = i;
            // COUN_DROPDOWN.appendChild(country_option);
        }
    }
}

function selectCountry(object) {
    CURRENT_PCC.country = object.options[object.selectedIndex].value;
    if ((CURRENT_PCC.city != null)) {
        BTN.disabled = false;
    }
}

function showAdderss() {
    ADDRESS_PROV_CITY_COUN.value = PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov].name +
        PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov]["city"][CURRENT_PCC.city].name;
    LOCATION_SELECT = ADDRESS_PROV_CITY_COUN.value;
}

function clickColorList(id) {
    const myselect = document.getElementById(id);
    let index = myselect.selectedIndex;
    return myselect.options[index].value
}

function selectCircleRadius() {
    let circle_length_1 = clickCircleList("circle_1");
    let circle_length_2 = clickCircleList("circle_2");
    let circle_length_3 = clickCircleList("circle_3");
    return [circle_length_1, circle_length_2, circle_length_3]
}

function clickCircleList(id) {
    const myselect = document.getElementById(id);
    let index = myselect.selectedIndex;
    let distance = myselect.options[index].value;
    return Number(distance);
}

function clickMarkerList(id) {
    const myselect = document.getElementById(id);
    let index = myselect.selectedIndex;
    let marker = myselect.options[index].value;
    return Number(marker);
}
