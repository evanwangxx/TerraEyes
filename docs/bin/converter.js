// converter.js
// data convert library for Terra Eyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


function addressToLatLng(address) {
    geocoder = new qq.maps.Geocoder();
    geocoder.getLocation(address);
    geocoder.setComplete(function (result) {
        ADDRESS_POINT = result.detail.location;
    });
}

// Map Latitude, Longitude converter
// GCJ02 (Tencent, Alibaba) <--> BD09 (Baidu)
function convertGcj02Bd09(lat, lng) {
    var x_pi = 3.14159265358979323846264 * 3000.0 / 180.0;
    var x = parseFloat(lng);
    var y = parseFloat(lat);
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    lat = z * Math.sin(theta) + 0.006;
    lng = z * Math.cos(theta) + 0.0065;
    return [lat, lng];
}

function convertBd09Gcj02(lat, lng) {
    var x_pi = 3.14159265358979323846264 * 3000.0 / 180.0;
    var x = parseFloat(lng) - 0.0065;
    var y = parseFloat(lat) - 0.006;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    lat = z * Math.sin(theta)
    lng = z * Math.cos(theta)
    return [lat, lng];
}

function covertPointListToPath(pointPathString, sep = "|") {
    var all_point = pointPathString.split(sep);
    var path = [];

    for (var i = 0; i < all_point.length; i++) {
        let point = all_point[i].split(";");
        path.push(new qq.maps.LatLng(point[0], point[1]));
    }
    return path;
}

// Geohash Converter
BITS = [16, 8, 4, 2, 1];

BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
NEIGHBORS = {
    right: {
        even: "bc01fg45238967deuvhjyznpkmstqrwx"
    },
    left: {
        even: "238967debc01fg45kmstqrwxuvhjyznp"
    },
    top: {
        even: "p0r21436x8zb9dcf5h7kjnmqesgutwvy"
    },
    bottom: {
        even: "14365h7k9dcfesgujnmqp0r2twvyx8zb"
    }
};
BORDERS = {
    right: {
        even: "bcfguvyz"
    },
    left: {
        even: "0145hjnp"
    },
    top: {
        even: "prxz"
    },
    bottom: {
        even: "028b"
    }
};

NEIGHBORS.bottom.odd = NEIGHBORS.left.even;
NEIGHBORS.top.odd = NEIGHBORS.right.even;
NEIGHBORS.left.odd = NEIGHBORS.bottom.even;
NEIGHBORS.right.odd = NEIGHBORS.top.even;

BORDERS.bottom.odd = BORDERS.left.even;
BORDERS.top.odd = BORDERS.right.even;
BORDERS.left.odd = BORDERS.bottom.even;
BORDERS.right.odd = BORDERS.top.even;

function refine_interval(interval, cd, mask) {
    if (cd & mask) {
        interval[0] = (interval[0] + interval[1]) / 2;
    } else {
        interval[1] = (interval[0] + interval[1]) / 2;
    }
}

function calculateAdjacent(srcHash, dir) {
    srcHash = srcHash.toLowerCase();
    var lastChr = srcHash.charAt(srcHash.length - 1);
    var type = (srcHash.length % 2) ? 'odd' : 'even';
    var base = srcHash.substring(0, srcHash.length - 1);
    if (BORDERS[dir][type].indexOf(lastChr) != -1)
        base = calculateAdjacent(base, dir);
    return base + BASE32[NEIGHBORS[dir][type].indexOf(lastChr)];
}

function decodeGeoHash(geohash) {
    var is_even = 1;
    var lat = [];
    var lon = [];
    lat[0] = -90.0;
    lat[1] = 90.0;
    lon[0] = -180.0;
    lon[1] = 180.0;
    lat_err = 90.0;
    lon_err = 180.0;

    for (i = 0; i < geohash.length; i++) {
        c = geohash[i];
        cd = BASE32.indexOf(c);
        for (var j = 0; j < 5; j++) {
            mask = BITS[j];
            if (is_even) {
                lon_err /= 2;
                refine_interval(lon, cd, mask);
            } else {
                lat_err /= 2;
                refine_interval(lat, cd, mask);
            }
            is_even = !is_even;
        }
    }
    lat[2] = (lat[0] + lat[1]) / 2;
    lon[2] = (lon[0] + lon[1]) / 2;

    return {
        latitude: lat,
        longitude: lon
    };
}

function encodeGeoHash(latitude, longitude) {
    var is_even = 1;
    var i = 0;
    var lat = [];
    var lon = [];
    var bit = 0;
    var ch = 0;
    var precision = 12;
    geohash = "";

    lat[0] = -90.0;
    lat[1] = 90.0;
    lon[0] = -180.0;
    lon[1] = 180.0;

    while (geohash.length < precision) {
        if (is_even) {
            mid = (lon[0] + lon[1]) / 2;
            if (longitude > mid) {
                ch |= BITS[bit];
                lon[0] = mid;
            } else
                lon[1] = mid;
        } else {
            mid = (lat[0] + lat[1]) / 2;
            if (latitude > mid) {
                ch |= BITS[bit];
                lat[0] = mid;
            } else
                lat[1] = mid;
        }

        is_even = !is_even;
        if (bit < 4) {
            bit++;
        } else {
            geohash += BASE32[ch];
            bit = 0;
            ch = 0;
        }
    }
    return geohash;
}


// Color Converter
function hslToRgb(h, s, l) {

    var r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) {
                t += 1;
            } else if (t > 1) {
                t -= 1;
            } else if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            } else if (t < 1 / 2) {
                return q;
            } else if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    var ret = showRGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));

    return ret;
}

//0-1转化为颜色代代码
function getColr(value) {

    h = (1 - value);
    s = 1.0;
    l = 1 - value * 0.5;
    var ret = hslToRgb(h * 1, s * 1, l * 1);

    return ret;
}

function showRGB(r, g, b) {

    red = r;
    green = g;
    blue = b;

    var hexarray = new Array(256);
    hexarray[0] = "00";
    hexarray[1] = "01";
    hexarray[2] = "02";

    hexarray[3] = "03";
    hexarray[4] = "04";
    hexarray[5] = "05";

    hexarray[6] = "06";
    hexarray[7] = "07";
    hexarray[8] = "08";

    hexarray[9] = "09";
    hexarray[10] = "0A";
    hexarray[11] = "0B";

    hexarray[12] = "0C";
    hexarray[13] = "0D";
    hexarray[14] = "0E";

    hexarray[15] = "0F";
    hexarray[16] = "10";
    hexarray[17] = "11";

    hexarray[18] = "12";
    hexarray[19] = "13";
    hexarray[20] = "14";

    hexarray[21] = "15";
    hexarray[22] = "16";
    hexarray[23] = "17";

    hexarray[24] = "18";
    hexarray[25] = "19";
    hexarray[26] = "1A";

    hexarray[27] = "1B";
    hexarray[28] = "1C";
    hexarray[29] = "1D";

    hexarray[30] = "1E";
    hexarray[31] = "1F";
    hexarray[32] = "20";

    hexarray[33] = "21";
    hexarray[34] = "22";
    hexarray[35] = "23";

    hexarray[36] = "24";
    hexarray[37] = "25";
    hexarray[38] = "26";

    hexarray[39] = "27";
    hexarray[40] = "28";
    hexarray[41] = "29";

    hexarray[42] = "2A";
    hexarray[43] = "2B";
    hexarray[44] = "2C";

    hexarray[45] = "2D";
    hexarray[46] = "2E";
    hexarray[47] = "2F";

    hexarray[48] = "30";
    hexarray[49] = "31";
    hexarray[50] = "32";

    hexarray[51] = "33";
    hexarray[52] = "34";
    hexarray[53] = "35";

    hexarray[54] = "36";
    hexarray[55] = "37";
    hexarray[56] = "38";

    hexarray[57] = "39";
    hexarray[58] = "3A";
    hexarray[59] = "3B";

    hexarray[60] = "3C";
    hexarray[61] = "3D";
    hexarray[62] = "3E";

    hexarray[63] = "3F";
    hexarray[64] = "40";
    hexarray[65] = "41";

    hexarray[66] = "42";
    hexarray[67] = "43";
    hexarray[68] = "44";

    hexarray[69] = "45";
    hexarray[70] = "46";
    hexarray[71] = "47";

    hexarray[72] = "48";
    hexarray[73] = "49";
    hexarray[74] = "4A";

    hexarray[75] = "4B";
    hexarray[76] = "4C";
    hexarray[77] = "4D";

    hexarray[78] = "4E";
    hexarray[79] = "4F";
    hexarray[80] = "50";

    hexarray[81] = "51";
    hexarray[82] = "52";
    hexarray[83] = "53";

    hexarray[84] = "54";
    hexarray[85] = "55";
    hexarray[86] = "56";

    hexarray[87] = "57";
    hexarray[88] = "58";
    hexarray[89] = "59";

    hexarray[90] = "5A";
    hexarray[91] = "5B";
    hexarray[92] = "5C";

    hexarray[93] = "5D";
    hexarray[94] = "5E";
    hexarray[95] = "6F";

    hexarray[96] = "60";
    hexarray[97] = "61";
    hexarray[98] = "62";

    hexarray[99] = "63";
    hexarray[100] = "64";
    hexarray[101] = "65";

    hexarray[102] = "66";
    hexarray[103] = "67";
    hexarray[104] = "68";

    hexarray[105] = "69";
    hexarray[106] = "6A";
    hexarray[107] = "6B";

    hexarray[108] = "6C";
    hexarray[109] = "6D";
    hexarray[110] = "6E";

    hexarray[111] = "6F";
    hexarray[112] = "70";
    hexarray[113] = "71";

    hexarray[114] = "72";
    hexarray[115] = "73";
    hexarray[116] = "74";

    hexarray[117] = "75";
    hexarray[118] = "76";
    hexarray[119] = "77";

    hexarray[120] = "78";
    hexarray[121] = "79";
    hexarray[122] = "7A";

    hexarray[123] = "7B";
    hexarray[124] = "7C";
    hexarray[125] = "7D";

    hexarray[126] = "7E";
    hexarray[127] = "7F";
    hexarray[128] = "80";

    hexarray[129] = "81";
    hexarray[130] = "82";
    hexarray[131] = "83";

    hexarray[132] = "84";
    hexarray[133] = "85";
    hexarray[134] = "86";

    hexarray[135] = "87";
    hexarray[136] = "88";
    hexarray[137] = "89";

    hexarray[138] = "8A";
    hexarray[139] = "8B";
    hexarray[140] = "8C";

    hexarray[141] = "8D";
    hexarray[142] = "8E";
    hexarray[143] = "8F";

    hexarray[144] = "90";
    hexarray[145] = "91";
    hexarray[146] = "92";

    hexarray[147] = "93";
    hexarray[148] = "94";
    hexarray[149] = "95";

    hexarray[150] = "96";
    hexarray[151] = "97";
    hexarray[152] = "98";

    hexarray[153] = "99";
    hexarray[154] = "9A";
    hexarray[155] = "9B";

    hexarray[156] = "9C";
    hexarray[157] = "9D";
    hexarray[158] = "9E";

    hexarray[159] = "9F";
    hexarray[160] = "A0";
    hexarray[161] = "A1";

    hexarray[162] = "A2";
    hexarray[163] = "A3";
    hexarray[164] = "A4";

    hexarray[165] = "A5";
    hexarray[166] = "A6";
    hexarray[167] = "A7";

    hexarray[168] = "A8";
    hexarray[169] = "A9";
    hexarray[170] = "AA";

    hexarray[171] = "AB";
    hexarray[172] = "AC";
    hexarray[173] = "AD";

    hexarray[174] = "AE";
    hexarray[175] = "AF";
    hexarray[176] = "B0";

    hexarray[177] = "B1";
    hexarray[178] = "B2";
    hexarray[179] = "B3";

    hexarray[180] = "B4";
    hexarray[181] = "B5";
    hexarray[182] = "B6";

    hexarray[183] = "B7";
    hexarray[184] = "B8";
    hexarray[185] = "B9";

    hexarray[186] = "BA";
    hexarray[187] = "BB";
    hexarray[188] = "BC";

    hexarray[189] = "BD";
    hexarray[190] = "BE";
    hexarray[191] = "BF";

    hexarray[192] = "C0";
    hexarray[193] = "C1";
    hexarray[194] = "C2";

    hexarray[195] = "C3";
    hexarray[196] = "C4";
    hexarray[197] = "C5";

    hexarray[198] = "C6";
    hexarray[199] = "C7";
    hexarray[200] = "C8";

    hexarray[201] = "C9";
    hexarray[202] = "CA";
    hexarray[203] = "CB";

    hexarray[204] = "CC";
    hexarray[205] = "CD";
    hexarray[206] = "CE";

    hexarray[207] = "CF";
    hexarray[208] = "D0";
    hexarray[209] = "D1";

    hexarray[210] = "D2";
    hexarray[211] = "D3";
    hexarray[212] = "D4";

    hexarray[213] = "D5";
    hexarray[214] = "D6";
    hexarray[215] = "D7";

    hexarray[216] = "D8";
    hexarray[217] = "D9";
    hexarray[218] = "DA";

    hexarray[219] = "DB";
    hexarray[220] = "DC";
    hexarray[221] = "DD";

    hexarray[222] = "DE";
    hexarray[223] = "DF";
    hexarray[224] = "E0";

    hexarray[225] = "E1";
    hexarray[226] = "E2";
    hexarray[227] = "E3";

    hexarray[228] = "E4";
    hexarray[229] = "E5";
    hexarray[230] = "E6";

    hexarray[231] = "E7";
    hexarray[232] = "E8";
    hexarray[233] = "E9";

    hexarray[234] = "EA";
    hexarray[235] = "EB";
    hexarray[236] = "EC";

    hexarray[237] = "ED";
    hexarray[238] = "EE";
    hexarray[239] = "EF";

    hexarray[240] = "F0";
    hexarray[241] = "F1";
    hexarray[242] = "F2";

    hexarray[243] = "F3";
    hexarray[244] = "F4";
    hexarray[245] = "F5";

    hexarray[246] = "F6";
    hexarray[247] = "F7";
    hexarray[248] = "F8";

    hexarray[249] = "F9";
    hexarray[250] = "FA";
    hexarray[251] = "FB";

    hexarray[252] = "FC";
    hexarray[253] = "FD";
    hexarray[254] = "FE";

    hexarray[255] = "FF";

    hexcode = "#" + hexarray[red] + hexarray[green] + hexarray[blue];

    return hexcode;
}