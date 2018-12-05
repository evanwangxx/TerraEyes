function $$(str) {
	return document.getElementById(str);
}

var ADDRESS_PROV_CITY_COUN = $$("pcc_show"); // selected area
var BTN = document.getElementsByClassName('met1')[0];
var PROV_DROPDOWN = $$("province_dropdown");
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
	ADDRESS_PROV_CITY_COUN.value = PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov].name +
		PROVINCE_CITY_COUNTRY[CURRENT_PCC.prov]["city"][CURRENT_PCC.city].name;
	LOCATION_SELECT = ADDRESS_PROV_CITY_COUN.value;
}


// main initial
showProvince();