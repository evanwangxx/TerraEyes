// Interaction.js
// user interaction library for Terra Eyes
// (c) 2018 Hongbo Wang
// Copyright © 1998 - 2018 Tencent. All Rights Reserved.

var HEAT_JSON;
var STORE_JSON;
var COMPA_JSON;
var COMPA_JSON2;
var LOCATION_SELECT;
var GEOHASH_JSON;

var STORE_HEADER = ["详细", "lat", "lng"];
var CSV_DATA;


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


function csvStoreLoaderWithPath(header = ["lat", "lng", "path1", "path2", "path3"]) {
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
	$('#geohash_data').change(function() {
		var fileSelector = $('#geohash_data')[0].files;
		var file = fileSelector[0];

		$("fileNamesDes").text(fileSelector[0].name);
		var reader = new FileReader();
		reader.onload = function() {
			GEOHASH_JSON = quickSort(processDataToJSON(this.result, ['geohash', '分数']));
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


var TEXT_DATA;

function getPasteText(table_id = "#trans_data") {
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
			jsonToTable(json, table_id, 10);
			TEXT_DATA = json;
		} else {
			alert("输入的字符是空的~~")
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