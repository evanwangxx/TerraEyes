// MapLoader.js
// Map library for Terra Eyes
// (c) 2018 Hongbo Wang
// Copyright © 1998 - 2018 Tencent. All Rights Reserved.

var MAP;
var ZOOM;

var ADDRESS_POINT;
var ADDRESS;


function addCircle(map, point, radius, fillWeight = 0.05, color = '#FA5858', option = "other", level) {
	if (option == "circle") {
		var option = {
			map: map,
			center: point,
			radius: radius,
			strokeWeight: 1,
			strokeDashStyle: 'dash',
			cursor: 'pointer',
			visible: true,
			fillColor: qq.maps.Color.fromHex(color, 0.05),
			zIndex: 1000
		}
	} else {
		var option = {
			map: map,
			center: point,
			radius: radius,
			strokeColor: '#5858FA',
			fillColor: null,
			strokeDashStyle: 'dash',
			strokeWeight: 3.0,
		}
	}
	var circle = new qq.maps.Circle(option);
	return circle;
}

function addBubble(map, point, radius, level, color = '#FA5858') {
	var option = {
		map: map,
		center: point,
		radius: radius,
		strokeWeight: 0,
		strokeColor: color,
		cursor: 'pointer',
		visible: true,
		fillColor: qq.maps.Color.fromHex(color, 0.5)
	}
	var circle = new qq.maps.Circle(option);

	qq.maps.event.addListener(circle, 'click', function() {
		var info = new qq.maps.InfoWindow({
			map: MAP
		});
		info.open();
		info.setContent('<div style="text-align:center;white-space:nowrap;' +
			'margin:10px;">' + "量级：" + level +
			"<br>半径：" + radius.toFixed(2) + '</div>');
		info.setPosition(point);
	});
}


function addLabel(map, point, text, offsetOrNot, color = "#242424", backgroundColor = "") {
	var cssC = {
		color: color,
		fontWeight: "bold",
	}
	if (offsetOrNot) {
		var label = new qq.maps.Label({
			map: map,
			content: text,
			position: point,
			style: cssC,
			zIndex: 1000
		});
	} else {
		var label = new qq.maps.Label({
			map: map,
			content: text,
			position: point,
			style: cssC,
			offset: new qq.maps.Size(0, 10),
			zIndex: 1000
		});
	}

	var visibleF = document.getElementById("visible-label");
	qq.maps.event.addDomListener(visibleF, "click", function() {
		label.setMap(map);
		if (label.getVisible()) {
			label.setVisible(false);
		} else {
			label.setVisible(true);
		}
	});

	return label;
}


function addMarker(map, point, text, color = "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png") {
	var icon = new qq.maps.MarkerImage(color);
	var marker = new qq.maps.Marker({
		position: point,
		animation: qq.maps.MarkerAnimation.DROP,
		map: map,
		zIndex: 1000
	});

	marker.setIcon(icon);
	marker.setShadow(null);

	qq.maps.event.addListener(marker, 'click', function() {
		var info = new qq.maps.InfoWindow({
			map: map
		});
		info.open();
		info.setContent('<div style="text-align:center;white-space:nowrap;' +
			'margin:10px;">' + text + '</div>');
		info.setPosition(marker.getPosition());
	});
}


function addPolygon(map, polygon_array, color, score, raw_score, center) {
	var polygon = new qq.maps.Polygon({
		map: map,
		path: polygon_array,
		strokeColor: color,
		strokeWeight: 0,
		fillColor: qq.maps.Color.fromHex(color, score)
	});

	qq.maps.event.addListener(polygon, 'click', function() {
		var info = new qq.maps.InfoWindow({
			map: map
		});
		info.open();
		info.setContent('<div style="text-align:center;white-space:nowrap;' + 'margin:10px;">' +
			"量级：" + raw_score +
			"<br>浓度：" + score.toFixed(2) + '</div>');
		info.setPosition(center);
	});

	qq.maps.event.addListener(polygon, 'mousemove', function(event) {
		document.getElementById("polyinfo").innerHTML = "量级：" + raw_score +
			"<br>浓度：" + score.toFixed(2);
	});
}


function addPolyline(map, path, strokeColor = '#610B21', strokeWeight = 3) {
	var polyline = new qq.maps.Polyline({
		map: map,
		path: path,
		strokeColor: strokeColor,
		strokeWeight: strokeWeight,
		editable: false,
		zIndex: 100
	});
}


function layerOfBubble(data_sort, color, max_bubble = 500, radius_min = 50, radius_max = 800) {

	var visibleF = document.getElementById("visible-label");
	var data_max = data_sort[0]["分数"];
	var data_min = data_sort[data_sort.length - 3]["分数"];

	for (var i = 0; i < data_sort.length - 1 && i < max_bubble; ++i) {
		let point = new qq.maps.LatLng(data_sort[i]["lat"], data_sort[i]["lng"]);
		var level = data_sort[i]["分数"];
		var radius = ((parseInt(data_sort[i]["分数"]) - data_min) /
			(data_max - data_min)) * (radius_max - radius_min) + radius_min;

		if (radius != NaN) {
			let rank = i + 1;
			var circle = addBubble(MAP, point, radius, level, color);
			var label = addLabel(MAP, point, rank + ". " + data_sort[i]["详细"], true, "#242424", backgroundColor = "");
		}
	}
}


function layerOfHeat(map, data, valueField = "分数", radius = 1, maxOpacity = 0.8) {
	qq.maps.event.addListenerOnce(map, "idle", function() {
		if (QQMapPlugin.isSupportCanvas) {
			options = {
				"radius": radius,
				"maxOpacity": maxOpacity,
				"useLocalExtrema": false,
				"valueField": valueField
			};

			heatmap = new QQMapPlugin.HeatmapOverlay(map, options);
			heatmap.setData(data);
		} else {
			alert("您的浏览器不支持canvas，无法绘制热力图！！");
		}
	});
}


function layerOfGeohash(map, geohash, level, concentration, raw_score) {
	this.box = decodeGeoHash(geohash);
	color = getColr(level);

	var polygonArr = new Array(
		new qq.maps.LatLng(this.box.latitude[1] * 1.0, this.box.longitude[0] * 1.0),
		new qq.maps.LatLng(this.box.latitude[1] * 1.0, this.box.longitude[1] * 1.0),
		new qq.maps.LatLng(this.box.latitude[0] * 1.0, this.box.longitude[1] * 1.0),
		new qq.maps.LatLng(this.box.latitude[0] * 1.0, this.box.longitude[0] * 1.0)
	);
	var center = new qq.maps.LatLng((this.box.latitude[1] + this.box.latitude[0]) / 2.0,
		(this.box.longitude[1] + this.box.longitude[0]) / 2);
	addPolygon(map, polygonArr, color, concentration, raw_score, center);
}


function layerOfMarker(map, data,
	radius = null, circle = false, color = '#FA5858', reachRadius = false, circleOption = 'circle') {

	if (radius === null) {
		radius = [3000];
	}

	for (var i = 0; i < data.length; i++) {
		var point = new qq.maps.LatLng(data[i].lat, data[i].lng);
		addMarker(map, point, data[i].详细);
		if (circle) {
			for (var j = 0; j < radius.length; ++j) {
				addCircle(map, point, radius[j], fillWeight = 0.04, color = color, option = circleOption);
			}
		}

		if (reachRadius) {
			let path1 = covertPointListToPath(data[i].path1);
			let path2 = covertPointListToPath(data[i].path2);
			let path3 = covertPointListToPath(data[i].path3);
			addPolyline(map, path1, strokeColor = '#610B21', strokeWeight = 3);
			addPolyline(map, path2, strokeColor = '#610B38', strokeWeight = 2);
			addPolyline(map, path3, strokeColor = '#8A084B', strokeWeight = 1);
		}
	}
}


function getIconPath() {
	var js = document.scripts;
	let path = js[js.length - 1].src.substring(0, js[js.length - 1].src.lastIndexOf("/"))
	path = path.substring(0, path.lastIndexOf("bin")) + "/css/icon/";

	return path
}


function addressToLatLng(address) {
	geocoder = new qq.maps.Geocoder();
	geocoder.getLocation(address);
	geocoder.setComplete(function(result) {
		ADDRESS_POINT = result.detail.location;
	});
}


function loadMap(point, zoom = 3, mapTypeId = qq.maps.MapTypeId.ROADMAP) {
	mapContainer = document.getElementById("map-canvas");
	options = {
		center: point,
		zoom: zoom,
		noClear: true,
		mapStyleId: 'style1',
		mapTypeId: mapTypeId,
		zoomControl: true,
		zoomControlOptions: {
			position: qq.maps.ControlPosition.TOP_LEFT
		},
		scaleControl: true,
		scaleControlOptions: {
			position: qq.maps.ControlPosition.BOTTOM_RIGHT
		}
	};
	MAP = new qq.maps.Map(mapContainer, options);
}


// ---------------------------- main --------------------------------


function run(pointer = false, data = HEAT_JSON) {

	let path = getIconPath();

	map_data = {
		max: 100,
		data: data
	};

	if (pointer) {
		console.log("INFO | pointer map");
		let latlng = userInputLatLng();
		let point = new qq.maps.LatLng(latlng[0], latlng[1]);
		loadMap(point, zoom = 14);
		addMarker(MAP, point, "Marker", color = path + "pointer.png");
	} else {
		addressToLatLng(LOCATION_SELECT);
		loadMap(ADDRESS_POINT, zoom = 10);
	}

	if (map_data.data !== undefined) {
		layerOfHeat(MAP, map_data);
	}
	if (STORE_JSON !== undefined) {
		layerOfMarker(MAP, STORE_JSON, maker_color = path + "tuhu.png");
	}
	if (COMPA_JSON !== undefined) {
		layerOfMarker(MAP, COMPA_JSON, maker_color = path + "maint.png");
	}
	if (COMPA_JSON2 !== undefined) {
		layerOfMarker(MAP, COMPA_JSON2, maker_color = path + "comp.png");
	}
}


function runPoint(data = TEXT_DATA) {
	var point = new qq.maps.LatLng(data[0].lat, data[0].lng);

	let color = clickColorList("color-dd");
	let radius = selectCircleRadius();

	loadMap(point, zoom = 14);
	layerOfMarker(MAP, data, radius = radius, circle = true, color = color);
}


function runHeat(pointer = false, data = HEAT_JSON, store = TEXT_DATA) {
	let path = getIconPath();
	var power = parseInt(document.getElementById("heat-power").value);
	var m_name = document.getElementById("marker-name").value;
	let radius = selectCircleRadius();

	map_data = {
		max: power,
		data: data
	};

	if (pointer) {
		console.log("INFO | pointer map");
		let latlng = userInputLatLng();
		var point = new qq.maps.LatLng(latlng[0], latlng[1]);
		loadMap(point, zoom = 14);
	} else {
		addressToLatLng(LOCATION_SELECT);
		loadMap(ADDRESS_POINT, zoom = 10);
	}

	layerOfHeat(MAP, map_data);

	if (pointer) {
		addMarker(MAP, point, m_name, color = path + "pointer.png");
		for (var j = 0; j < radius.length; ++j) {
			addCircle(MAP, point, radius[j], fillWeight = 0.04,
				color = "#0040FF", option = "circle");
		}
	}

	if (store !== undefined) {
		layerOfMarker(MAP, store, radius = radius, circle = true);
	}
}


function runBubble(pointer = false, data = HEAT_JSON, store = TEXT_DATA, length = 100) {
	let path = getIconPath();
	var max_bubble = parseInt(document.getElementById("max-bubble").value);
	let m_name = document.getElementById("marker-name").value;
	let radius = selectCircleRadius();
	let color = clickColorList("color-dd");

	var r_max = parseInt(document.getElementById("r-max").value);
	var r_min = parseInt(document.getElementById("r-min").value);

	Object.freeze(HEAT_JSON);
	var data_sort = quickSort([...data]);

	if (pointer) {
		console.log("pointer map");
		let latlng = userInputLatLng();
		var point = new qq.maps.LatLng(latlng[0], latlng[1]);
		loadMap(point, zoom = 14);

	} else {
		addressToLatLng(LOCATION_SELECT);
		loadMap(ADDRESS_POINT, zoom = 10);
	}

	layerOfBubble(data_sort, color, max_bubble, r_min, r_max);

	if (pointer) {
		addMarker(MAP, point, m_name, color = path + "pointer.png");
		for (var j = 0; j < radius.length; ++j) {
			addCircle(MAP, point, radius[j], fillWeight = 0.04,
				color = "#0040FF", option = "circle");
		}
	}

	if (store !== undefined) {
		layerOfMarker(MAP, store, radius = radius, circle = true);
	}
}


function runGeohash(pointer = false, data_geohash = GEOHASH_JSON, filter = 30) {
	let data = [];
	let score_array = [];
	for (var i = 0; i < data_geohash.length; ++i) {
		var tmp_score = parseInt(data_geohash[i]["分数"]);
		if (tmp_score >= filter) {
			data.push(data_geohash[i]);
			score_array.push(tmp_score);
		}
	}
	let mean = average(score_array);
	let std = standardDeviation(score_array)

	var data_sort = quickSort(data);
	data_sort.pop(data_sort);

	if (pointer) {
		console.log("INFO | pointer map");
		let latlng = userInputLatLng();
		let point = new qq.maps.LatLng(latlng[0], latlng[1]);
		loadMap(point, zoom = 14);
	} else {
		var point = decodeGeoHash(data_sort[0]['geohash'])
		var center = new qq.maps.LatLng(point.latitude[1], point.longitude[1]);
		loadMap(center, zoom = 13);
	}

	if (STORE_JSON !== undefined) {
		layerOfMarker(MAP, STORE_JSON,
			radius = [3000], circle = false, color = null,
			reachRadius = true, circleOption = 'other');
	}

	var data_max = (parseInt(data_sort[0]["分数"]) - mean) / std;
	var data_min = (parseInt(data_sort[data_sort.length - 1]["分数"] - mean)) / std;
	var radius_max = 1.00;
	var radius_min = 0.05;

	for (var i = 0; i < data_sort.length; ++i) {
		var geohash = data_sort[i]["geohash"];
		var raw_score = data_sort[i]["分数"];
		var normal_score = ((parseInt(raw_score) - mean) / std);
		var score = ((normal_score - data_min) /
			(data_max - data_min)) * (radius_max - radius_min) + radius_min;
		layerOfGeohash(MAP, geohash, 0.92, score, raw_score);
	}

}