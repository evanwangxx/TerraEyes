// initial color drop down

function clickColorList(id) {
	var myselect = document.getElementById(id);
	var index = myselect.selectedIndex;
	var distance = myselect.options[index].value;

	return distance;
}

var color_drop_down = document.getElementById("color-dd");

for (var i = 0; i < CORLOR_DROP_DOWN.length; i++) {
	color_drop_down.options
		.add(new Option(CORLOR_DROP_DOWN[i].name, CORLOR_DROP_DOWN[i].length));
	if (i == 6) {
		color_drop_down.options[i].selected = true;
	}
}
