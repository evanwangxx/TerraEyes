// initial color drop down

var color_drop_down = document.getElementById("color-dd");

for (var i = 0; i < CORLOR_DROP_DOWN.length; i++) {
	color_drop_down.options
		.add(new Option(CORLOR_DROP_DOWN[i].name, CORLOR_DROP_DOWN[i].length));
	if (i == 6) {
		color_drop_down.options[i].selected = true;
	}
}
