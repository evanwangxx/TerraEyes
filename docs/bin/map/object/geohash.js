// geohash.js
// map-geohash library for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.


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


const Geohash = class {
    constructor(map) {
        this.map = map;
        this.height = 500;
    }

    static refineInterval(interval, cd, mask) {
        if (cd && mask) {
            interval[0] = (interval[0] + interval[1]) / 2;
        } else {
            interval[1] = (interval[0] + interval[1]) / 2;
        }
    }

    static calculateAdjacent(srcHash, dir) {
        srcHash = srcHash.toLowerCase();
        let lastChr = srcHash.charAt(srcHash.length - 1);
        let type = (srcHash.length % 2) ? 'odd' : 'even';
        let base = srcHash.substring(0, srcHash.length - 1);
        if (BORDERS[dir][type].indexOf(lastChr) !== -1)
            base = calculateAdjacent(base, dir);
        return base + BASE32[NEIGHBORS[dir][type].indexOf(lastChr)];
    }

    static decode(geohash) {
        let isEven = 1;
        let lat = [-90.0, 90.0];
        let long = [-180.0, 180.0];
        let latErr = 90.0;
        let lonErr = 180.0;

        for (let i = 0; i < geohash.length; i++) {
            let c = geohash[i];
            let cd = BASE32.indexOf(c);
            for (let j = 0; j < 5; j++) {
                let mask = BITS[j];
                if (isEven) {
                    lonErr /= 2;
                    refine_interval(long, cd, mask);
                } else {
                    latErr /= 2;
                    refine_interval(lat, cd, mask);
                }
                isEven = !isEven;
            }
        }
        lat[2] = (lat[0] + lat[1]) / 2;
        long[2] = (long[0] + long[1]) / 2;

        return {latitude: lat, longitude: long};
    }

    static encode(latitude, longitude, precision = 12) {
        let isEven = 1;
        let lat = [-90.0, 90.0];
        let lon = [-180.0, 180.0];
        let bit = 0;
        let ch = 0;
        let geohash = "";
        let mid;

        while (geohash.length < precision) {
            if (isEven) {
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

            isEven = !isEven;
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

    static getCenterOfGeohash(coordinate) {
        return new qq.maps.LatLng(
            (coordinate.latitude[1] + coordinate.latitude[0]) / 2.0,
            (coordinate.longitude[1] + coordinate.longitude[0]) / 2
        );
    }

    addGeohash(coordinate, score, color = 0.92, text = null) {
        let colorRGB = getColr(color);
        let option = {
            map: this.map,
            path: coordinate,
            strokeColor: colorRGB,
            strokeWeight: 0,
            fillColor: qq.maps.Color.fromHex(colorRGB, score),
            zIndex: this.height
        };
        let geohashUnit = new qq.maps.Polygon(option);

        let visible = document.getElementById("visible-geohash");
        setVisibleOption(visible, geohashUnit, "click");
        if (text) {
            let textWithinGeohash = text.replace(" ", "<br>");
            let label;
            let labelInfo;

            // TODO: wait Util class (xipeng)
            // var label = addText(map, textWithinGeohash, polygonArray[0]);
            // var labelInfo = addText(map, textWithinGeohash, polygonArray[0]);

            setVisibleOption(geohashUnit, labelInfo, 'click');
            setVisibleOption(label, labelInfo, 'click');
            setVisibleOption(labelInfo, labelInfo, 'click');

            // add mouseover action
            qq.maps.event.addDomListener(geohashUnit, 'mouseover', function (event) {
                label.setVisible(true);
                qq.maps.event.addDomListener(label, "click", function (event) {
                    label.setVisible(false)
                });
                qq.maps.event.addDomListener(geohashUnit, 'mouseout', function (event) {
                    label.setVisible(false);
                });
            });
        }

        return geohashUnit
    }

    addGeohashLayer(data) {

    }
};
