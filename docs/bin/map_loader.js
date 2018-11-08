var MAP;
var ZOOM;

var ADDRESS_POINT;
var ADDRESS;

function addMarker(map, point, text, color = "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png") {

	var icon = new qq.maps.MarkerImage(color);
	var marker = new qq.maps.Marker({
		position: point,
		animation: qq.maps.MarkerAnimation.DROP,
		map: map
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


function layerOfMarker(map, data) {

	for (var i = 0; i < data.length; i++) {
		var point = new qq.maps.LatLng(data[i].lat, data[i].lng);
		addMarker(map, point, data[i].详细);
	}
	console.log("Layer label Done");
}


function addCircle(map, point, radius, color = '#FA5858', bubble = false) {

	if (bubble) {
		var option = {
			map: map,
			center: point,
			radius: radius,
			strokeDashStyle: 'dash',
			strokeWeight: 3,
			strokeColor: color,
			cursor: 'pointer',
			visible: true,
			fillColor: qq.maps.Color.fromHex(color, 0.0000001)
		}
	} else {
		var option = {
			map: map,
			center: point,
			radius: radius,
			strokeColor: color,
			fillColor: qq.maps.Color.fromHex('#FF8000', 0.35),
			strokeWeight: 0.000001
		}
	}

	var circle = new qq.maps.Circle(option);
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
			style: cssC
		});
	} else {
		var label = new qq.maps.Label({
			map: map,
			content: text,
			position: point,
			style: cssC,
			offset: new qq.maps.Size(0, 10)
		});
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

function addPolygon(map, polygon_array, strokecolor, strokeWeight, fillcolor, fillOpacity) {

	var polygon = new qq.maps.Polygon({
		map: map,
		path: polygon_array,
		strokeColor: strokecolor,
		strokeWeight: strokeWeight,
		fillColor: qq.maps.Color.fromHex(fillcolor, fillOpacity)
	});
}

function layerOfGeohash(map, geohash, score) {

	this.box = decodeGeoHash(geohash);
	color = getColr(score);

	var polygonArr = new Array(
		new qq.maps.LatLng(this.box.latitude[1] * 1.0, this.box.longitude[0] * 1.0),
		new qq.maps.LatLng(this.box.latitude[1] * 1.0, this.box.longitude[1] * 1.0),
		new qq.maps.LatLng(this.box.latitude[0] * 1.0, this.box.longitude[1] * 1.0),
		new qq.maps.LatLng(this.box.latitude[0] * 1.0, this.box.longitude[0] * 1.0)
	);

	addPolygon(map, polygonArr, color, 0, color, 0.6);
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
	return MAP;
}


// ---------------------------- main -----------------------------------------------


function run(pointer = false, data = HEAT_JSON) {

	var js = document.scripts;
	console.log(js[js.length - 2].src);
	let path = js[js.length - 1].src.substring(0, js[js.length - 1].src.lastIndexOf("/"))

	path = path.substring(0, path.lastIndexOf("/")) + "/css/icon/";
	console.log(path);

	map_data = {
		max: 100,
		data: data
	};

	if (pointer) {
		console.log("pointer map");
		let latlng = userInputLatLng();
		let point = new qq.maps.LatLng(latlng[0], latlng[1]);
		loadMap(point, zoom = 14);
		addMarker(MAP, point, "Marker", color = path + "pointer.png");

	} else {
		addressToLatLng(LOCATION_SELECT);
		MAP = loadMap(ADDRESS_POINT, zoom = 10);
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


function run_point(data = TEXT_DATA) {

	var point = new qq.maps.LatLng(data[0].lat, data[0].lng);
	loadMap(point, zoom = 14);
	layerOfMarker(MAP, data);
}


function run_bubble(pointer = false, data = HEAT_JSON, length = 100) {

	if (pointer) {
		console.log("pointer map");
		let latlng = userInputLatLng();
		let point = new qq.maps.LatLng(latlng[0], latlng[1]);
		loadMap(point, zoom = 14);

	} else {
		addressToLatLng(LOCATION_SELECT);
		MAP = loadMap(ADDRESS_POINT, zoom = 10);
	}

	var data_sort = quickSort(data);
	data_sort.pop();
	var data_max = data_sort[0]["分数"]
	var data_min = data_sort[data_sort.length - 1]["分数"]
	var radius_max = 800;
	var radius_min = 400;
	console.log(data_sort);

	for (var i = 0; i < data_sort.length && i < length; ++i) {

		let point = new qq.maps.LatLng(data_sort[i]["lat"], data_sort[i]["lng"]);
		var radius = ((parseInt(data_sort[i]["分数"]) - data_min) / (data_max - data_min)) * (radius_max - radius_min) + radius_min;
		if (radius != NaN) {
			addCircle(MAP, point, radius);
		}
	}
}


function run_geohash(pointer = false, data = GEOHASH_JSON) {

	var data_sort = quickSort(data);
	data_sort.pop();
	var data_max = data_sort[0]["分数"];
	var data_min = data_sort[data_sort.length - 1]["分数"];
	var radius_max = 1.1;
	var radius_min = 0.0;

	if (pointer) {
		console.log("pointer map");
		let latlng = userInputLatLng();
		let point = new qq.maps.LatLng(latlng[0], latlng[1]);
		loadMap(point, zoom = 14);
	} else {
		var point = decodeGeoHash(data_sort[0]['geohash'])
		var center = new qq.maps.LatLng(point.latitude[1], point.longitude[1]);
		loadMap(center, zoom = 13);
	}

	for (var i = 0; i < data.length; ++i) {

		var geohash = data[i]["geohash"];
		var score = ((parseInt(data_sort[i]["分数"]) - data_min) / (data_max - data_min)) * (radius_max - radius_min) + radius_min;
		if (score >= 0.5) {
			layerOfGeohash(MAP, geohash, score);
		}
	}
}