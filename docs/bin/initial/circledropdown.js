// Initial Circle dropdown

function selectCircleRadius() {
	let circle_length_1 = clickCircleList("circle_1");
	let circle_length_2 = clickCircleList("circle_2");
	let circle_length_3 = clickCircleList("circle_3");
	let radius = [circle_length_1, circle_length_2, circle_length_3];

	return radius
}

function clickCircleList(id) {
	var myselect = document.getElementById(id);
	var index = myselect.selectedIndex;
	var distance = myselect.options[index].value;

	return Number(distance);
}

var CIRCLE_DOWN_1 = document.getElementById("circle_1");
var CIRCLE_DOWN_2 = document.getElementById("circle_2");
var CIRCLE_DOWN_3 = document.getElementById("circle_3");

for (var i = 0; i < CIRCLE_DROP_DOWN.length; i++) {
	CIRCLE_DOWN_1.options.add(new Option(CIRCLE_DROP_DOWN[i].name, CIRCLE_DROP_DOWN[i].length));
	CIRCLE_DOWN_2.options.add(new Option(CIRCLE_DROP_DOWN[i].name, CIRCLE_DROP_DOWN[i].length));
	CIRCLE_DOWN_3.options.add(new Option(CIRCLE_DROP_DOWN[i].name, CIRCLE_DROP_DOWN[i].length));

	if (i == 3) {
		CIRCLE_DOWN_1.options[i].selected = true;
	} else if (i == 5) {
		CIRCLE_DOWN_2.options[i].selected = true;
	} else if (i == 7) {
		CIRCLE_DOWN_3.options[i].selected = true;
	}
}
