// Interaction.js
// user interaction library for Terra Eyes
// (c) 2018 Hongbo Wang
// Copyright © 1998 - 2018 Tencent. All Rights Reserved.

var HEAT_JSON;
var STORE_JSON;
var COMPA_JSON;
var COMPA_JSON2;
var LOCATION_SELECT;
let GEOHASH_JSON;

let STORE_HEADER = ["详细", "lat", "lng"];


// ************************* basic data loader/decoder *****************************

function userInputLatLng() {
	var lat = prompt("Please enter latitude: ", "22.627453");
	var lng = prompt("Please enter longtitude: ", "114.030207");

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

// TODO: Combine csvLoader to one general
function csvStoreLoader(header = ["store", "lng", "lat", "省份", "城市", "具体地址"]) {
	$("#store_data").change(function() {
		var fileSelector = $("#store_data")[0].files;
		var file = fileSelector[0];

		$("fileNamesDes").text(fileSelector[0].name);
		var reader = new FileReader();
		reader.onload = function() {
			STORE_JSON = processDataToJSON(this.result, header = header, split = ',');
		};
		reader.readAsText(file);
	});
}


function csvCompaLoader() {
	$("#compa_data").change(function() {
		var fileSelector = $("#compa_data")[0].files;
		var file = fileSelector[0];

		$("fileNamesDes").text(fileSelector[0].name);
		var reader = new FileReader();
		reader.onload = function() {
			COMPA_JSON = processDataToJSON(this.result, header = ["省份", "城市", "lng", "lat", "store"], split = ',');
		};
		reader.readAsText(file);
	});
}


function csvCompaLoader2() {
	$("#compa_data2").change(function() {
		var fileSelector = $("#compa_data2")[0].files;
		var file = fileSelector[0];

		$("fileNamesDes").text(fileSelector[0].name);
		var reader = new FileReader();
		reader.onload = function() {
			COMPA_JSON2 = processDataToJSON(this.result, header = ["省份", "城市", "lng", "lat", "store", "具体地址"], split = ',');
		};

		reader.readAsText(file);
	});
}


function csvGeohash() {
	$("#geohash_data").change(function() {
		var fileSelector = $("#geohash_data")[0].files;
		var file = fileSelector[0];

		$("fileNamesDes").text(fileSelector[0].name);
		var reader = new FileReader();
		reader.onload = function() {
			GEOHASH_JSON = quickSort(processDataToJSON(this.result, header = ["geohash", "分数"], split = ','));
		};

		reader.readAsText(file);
	});
}


function processDataToJSON(csv, header = ['lat', "lng", "分数"], split = ',') {
	var allTextLines = csv.split(/\r\n|\n/);
	var lines = [];

	for (var i = 0; i < allTextLines.length; i++) {
		var data = allTextLines[i].split(split);
		var tmp_dict = {};

		for (var j = 0; j < data.length; j++) {
			tmp_dict[header[j]] = data[j];
		}
		lines.push(tmp_dict);
	}
	return lines;
}


function jsonToTable(json, id, num = 10) {
	var html = "";
	var json_headLine = json.slice(0, num);

	$.each(json_headLine, function(index, item) {

		if (index === 0) {
			html += "<tr>";
			$.each(item, function(vlaIndex) {
				html += "<td><font face=\"Arial\" size=3>";
				html += vlaIndex;
				html += "</font></td>";
			});
			html += "</tr>";
		}

		html += "<tr>";
		$.each(item, function(vlaIndex, valItem) {
			html += "<td><font face=\"Arial\" size=2>";
			html += valItem;
			html += "</td>";
		});

		html += "</font></tr>";
	});

	$(id).html(html);
}


function clickCityList() {
	var myselect = document.getElementById("province_dropdown");
	var index = myselect.selectedIndex;

	var city_list = myselect.options[index];
	var province = myselect.options[index].text;

	console.log(province);
	console.log(city_list);

	return [Number(lat_lng[0]), Number(lat_lng[1]), city];
}


function clickCircleList(id) {
	var myselect = document.getElementById(id);
	var index = myselect.selectedIndex;
	var distance = myselect.options[index].value;

	return Number(distance);
}


// ************************* Dropdown Province-City-Country *****************************

function $$(str) {
	return document.getElementById(str);
}

var ADDRESS_PROV_CITY_COUN = $$("pcc_show"); // selected area
var BTN = document.getElementsByClassName('met1')[0];
var PROV_DROPDOWN = $$("province_dropdown1");
var CITY_DROPDOWN = $$("city_dropdown");
var COUN_DROPDOWN = $$("country_dropdown");

var CURRENT_PCC = {
	prov: "",
	city: "",
	country: ""
};


function showProvince() {
	// BTN.disabled = false;
	for (var i = 0; i < PROVINCE_CITY_COUNTRY.length; i++) {
		var province_option = document.createElement("option");
		province_option.innerText = PROVINCE_CITY_COUNTRY[i]["name"];
		province_option.value = i;

		PROV_DROPDOWN.appendChild(province_option);
	}
}


function showCity(object) {
	var value = object.options[object.selectedIndex].value;

	if (value != CURRENT_PCC.prov) {
		CURRENT_PCC.prov = value;
		ADDRESS_PROV_CITY_COUN.value = "";
		BTN.disabled = false;
	}
	if (value != null) {
		CITY_DROPDOWN.length = 1;

		for (var i = 0; i < PROVINCE_CITY_COUNTRY[value]["city"].length; i++) {
			var city_option = document.createElement("option");
			city_option.innerText = PROVINCE_CITY_COUNTRY[value]["city"][i].name;
			city_option.value = i;

			CITY_DROPDOWN.appendChild(city_option);
		}
	}
}


function showCountry(object) {
	var value = object.options[object.selectedIndex].value;
	CURRENT_PCC.city = value;

	if (value != null) {
		COUN_DROPDOWN.length = 1; // leave 1 item - default selection
		var length = PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov]["city"][value].districtAndCounty.length;

		if (length == 0) {
			ADDRESS_PROV_CITY_COUN.value = PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov].name +
				PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov]["city"][CURRENT_PCC.city].name
			return;
		}
		for (var i = 0; i < length; i++) {
			var country_option = document.createElement("option");
			country_option.innerText = PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov]["city"][value].districtAndCounty[i];
			country_option.value = i;

			COUN_DROPDOWN.appendChild(country_option);
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
	ADDRESS_PROV_CITY_COUN.value = PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov].name;
	LOCATION_SELECT = ADDRESS_PROV_CITY_COUN.value +
		PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov]["city"][0].name;
}


// ************************* txt/csv decode *****************************

var TEXT_DATA;


function getPasteText() {
	$("text-input").ready(function() {
		var text = $.trim($("textarea").val());

		if (text != "") {
			let json = processDataToJSON(text, header = ['lat', "lng", '详细'], split = ',');
			var myselect = document.getElementById("lat-lng-convert").selectedIndex;
			console.log(myselect);

			if (myselect == 2) {
				for (var i = 0; i < json.length; i++) {
					var lat_lng = convert_gcj02_bd09(json[i].lat, json[i].lng);
					json[i].lat = lat_lng[0];
					json[i].lng = lat_lng[1];
				}
				console.log("INFO: To Baidu Map");
			} else if (myselect == 1) {
				for (var i = 0; i < json.length; i++) {
					var lat_lng = convert_bd09_gcj02(json[i].lat, json[i].lng);
					json[i].lat = lat_lng[0];
					json[i].lng = lat_lng[1];
				}
				console.log("INFO: To Tencent/Gaode Map");
			} else {
				console.log("INFO: Stay");
			}
			jsonToTable(json, "#trans_data", 10);
			TEXT_DATA = json;
		} else {
			alert("输入的字符是空的哦~~")
		}
	});
}


function quickSort(data, by = '分数') {
	if (data.length <= 1) {
		return data;
	}
	var pivotIndex = Math.floor(data.length / 2);
	var pivot = data.splice(pivotIndex, 1)[0]
	var left = [];
	var right = [];

	for (var i = 0; i < data.length; ++i) {
		if (parseInt(data[i][by]) >= parseInt(pivot[by])) {
			left.push(data[i]);
		} else {
			right.push(data[i]);
		}
	}

	return quickSort(left).concat([pivot], quickSort(right));
}


function standardDeviation(values) {
	var avg = average(values);
	var squareDiffs = values.map(function(value) {
		var diff = value - avg;
		var sqrDiff = diff * diff;
		return sqrDiff;
	});

	var avgSquareDiff = average(squareDiffs);
	var stdDev = Math.sqrt(avgSquareDiff);
	return stdDev;
}


function average(data) {
	var sum = data.reduce(function(sum, value) {
		return sum + value;
	}, 0);

	var avg = sum / data.length;
	return avg;
}