!function (a, b, c) {
    "undefined" != typeof module && module.exports ? module.exports = c() : "function" == typeof define && define.amd ? define(c) : b[a] = c()
}("h337", this, function () {
    var a = {
            defaultRadius: 40,
            defaultRenderer: "canvas2d",
            defaultGradient: {
                .25: "rgb(0,0,255)",
                .55: "rgb(0,255,0)",
                .85: "yellow",
                1: "rgb(255,0,0)"
            },
            defaultMaxOpacity: 1,
            defaultMinOpacity: 0,
            defaultBlur: .85,
            defaultXField: "x",
            defaultYField: "y",
            defaultValueField: "value",
            plugins: {}
        },
        b = function () {
            var b = function (a) {
                    this._coordinator = {}, this._data = [], this._radi = [], this._min = 0, this._max = 1, this._xField = a.xField || a.defaultXField, this._yField = a.yField || a.defaultYField, this._valueField = a.valueField || a.defaultValueField, a.radius && (this._cfgRadius = a.radius)
                },
                c = a.defaultRadius;
            return b.prototype = {
                _organiseData: function (a, b) {
                    var d = a[this._xField],
                        e = a[this._yField],
                        f = this._radi,
                        g = this._data,
                        h = this._max,
                        i = this._min,
                        j = a[this._valueField] || 1,
                        k = a.radius || this._cfgRadius || c;
                    return g[d] || (g[d] = [], f[d] = []), g[d][e] ? g[d][e] += j : (g[d][e] = j, f[d][e] = k), g[d][e] > h ? (b ? this.setDataMax(g[d][e]) : this._max = g[d][e], !1) : {
                        x: d,
                        y: e,
                        value: j,
                        radius: k,
                        min: i,
                        max: h
                    }
                },
                _unOrganizeData: function () {
                    var a = [],
                        b = this._data,
                        c = this._radi;
                    for (var d in b)
                        for (var e in b[d]) a.push({
                            x: d,
                            y: e,
                            radius: c[d][e],
                            value: b[d][e]
                        });
                    return {
                        min: this._min,
                        max: this._max,
                        data: a
                    }
                },
                _onExtremaChange: function () {
                    this._coordinator.emit("extremachange", {
                        min: this._min,
                        max: this._max
                    })
                },
                addData: function () {
                    if (arguments[0].length > 0)
                        for (var a = arguments[0], b = a.length; b--;) this.addData.call(this, a[b]);
                    else {
                        var c = this._organiseData(arguments[0], !0);
                        c && this._coordinator.emit("renderpartial", {
                            min: this._min,
                            max: this._max,
                            data: [c]
                        })
                    }
                    return this
                },
                setData: function (a) {
                    var b = a.data,
                        c = b.length;
                    this._data = [], this._radi = [];
                    for (var d = 0; c > d; d++) this._organiseData(b[d], !1);
                    return this._max = a.max, this._min = a.min || 0, this._onExtremaChange(), this._coordinator.emit("renderall", this._getInternalData()), this
                },
                removeData: function () {
                },
                setDataMax: function (a) {
                    return this._max = a, this._onExtremaChange(), this._coordinator.emit("renderall", this._getInternalData()), this
                },
                setDataMin: function (a) {
                    return this._min = a, this._onExtremaChange(), this._coordinator.emit("renderall", this._getInternalData()), this
                },
                setCoordinator: function (a) {
                    this._coordinator = a
                },
                _getInternalData: function () {
                    return {
                        max: this._max,
                        min: this._min,
                        data: this._data,
                        radi: this._radi
                    }
                },
                getData: function () {
                    return this._unOrganizeData()
                }
            }, b
        }(),
        c = function () {
            function a(a) {
                var c = a.container,
                    d = this.shadowCanvas = document.createElement("canvas"),
                    e = this.canvas = a.canvas || document.createElement("canvas"),
                    f = (this._renderBoundaries = [1e4, 1e4, 0, 0], getComputedStyle(a.container) || {});
                e.className = "heatmap-canvas", this._width = e.width = d.width = +f.width.replace(/px/, ""), this._height = e.height = d.height = +f.height.replace(/px/, ""), this.shadowCtx = d.getContext("2d"), this.ctx = e.getContext("2d"), e.style.cssText = d.style.cssText = "position:absolute;left:0;top:0;", c.style.position = "relative", c.appendChild(e), this._palette = b(a), this._templates = {}, this._setStyles(a)
            }

            var b = function (a) {
                    var b = a.gradient || a.defaultGradient,
                        c = document.createElement("canvas"),
                        d = c.getContext("2d");
                    c.width = 256, c.height = 1;
                    var e = d.createLinearGradient(0, 0, 256, 1);
                    for (var f in b) e.addColorStop(f, b[f]);
                    return d.fillStyle = e, d.fillRect(0, 0, 256, 1), d.getImageData(0, 0, 256, 1).data
                },
                c = function (a, b) {
                    var c = document.createElement("canvas"),
                        d = c.getContext("2d"),
                        e = a,
                        f = a;
                    if (c.width = c.height = 2 * a, 1 == b) d.beginPath(), d.arc(e, f, a, 0, 2 * Math.PI, !1), d.fillStyle = "rgba(0,0,0,1)", d.fill();
                    else {
                        var g = d.createRadialGradient(e, f, a * b, e, f, a);
                        g.addColorStop(0, "rgba(0,0,0,1)"), g.addColorStop(1, "rgba(0,0,0,0)"), d.fillStyle = g, d.fillRect(0, 0, 2 * a, 2 * a)
                    }
                    return c
                },
                d = function (a) {
                    for (var b = [], c = a.min, d = a.max, e = a.radi, a = a.data, f = Object.keys(a), g = f.length; g--;)
                        for (var h = f[g], i = Object.keys(a[h]), j = i.length; j--;) {
                            var k = i[j],
                                l = a[h][k],
                                m = e[h][k];
                            b.push({
                                x: h,
                                y: k,
                                value: l,
                                radius: m
                            })
                        }
                    return {
                        min: c,
                        max: d,
                        data: b
                    }
                };
            return a.prototype = {
                renderPartial: function (a) {
                    this._drawAlpha(a), this._colorize()
                },
                renderAll: function (a) {
                    this._clear(), this._drawAlpha(d(a)), this._colorize()
                },
                _updateGradient: function (a) {
                    this._palette = b(a)
                },
                updateConfig: function (a) {
                    a.gradient && this._updateGradient(a), this._setStyles(a)
                },
                setDimensions: function (a, b) {
                    this._width = a, this._height = b, this.canvas.width = this.shadowCanvas.width = a, this.canvas.height = this.shadowCanvas.height = b
                },
                _clear: function () {
                    this.shadowCtx.clearRect(0, 0, this._width, this._height), this.ctx.clearRect(0, 0, this._width, this._height)
                },
                _setStyles: function (a) {
                    this._blur = 0 == a.blur ? 0 : a.blur || a.defaultBlur, a.backgroundColor && (this.canvas.style.backgroundColor = a.backgroundColor), this._opacity = 255 * (a.opacity || 0), this._maxOpacity = 255 * (a.maxOpacity || a.defaultMaxOpacity), this._minOpacity = 255 * (a.minOpacity || a.defaultMinOpacity), this._useGradientOpacity = !!a.useGradientOpacity
                },
                _drawAlpha: function (a) {
                    for (var b = this._min = a.min, d = this._max = a.max, a = a.data || [], e = a.length, f = 1 - this._blur; e--;) {
                        var g, h = a[e],
                            i = h.x,
                            j = h.y,
                            k = h.radius,
                            l = Math.min(h.value, d),
                            m = i - k,
                            n = j - k,
                            o = this.shadowCtx;
                        this._templates[k] ? g = this._templates[k] : this._templates[k] = g = c(k, f), o.globalAlpha = (l - b) / (d - b), o.drawImage(g, m, n), m < this._renderBoundaries[0] && (this._renderBoundaries[0] = m), n < this._renderBoundaries[1] && (this._renderBoundaries[1] = n), m + 2 * k > this._renderBoundaries[2] && (this._renderBoundaries[2] = m + 2 * k), n + 2 * k > this._renderBoundaries[3] && (this._renderBoundaries[3] = n + 2 * k)
                    }
                },
                _colorize: function () {
                    var a = this._renderBoundaries[0],
                        b = this._renderBoundaries[1],
                        c = this._renderBoundaries[2] - a,
                        d = this._renderBoundaries[3] - b,
                        e = this._width,
                        f = this._height,
                        g = this._opacity,
                        h = this._maxOpacity,
                        i = this._minOpacity,
                        j = this._useGradientOpacity;
                    0 > a && (a = 0), 0 > b && (b = 0), a + c > e && (c = e - a), b + d > f && (d = f - b);
                    for (var k = this.shadowCtx.getImageData(a, b, c, d), l = k.data, m = l.length, n = this._palette, o = 3; m > o; o += 4) {
                        var p = l[o],
                            q = 4 * p;
                        if (q) {
                            var r;
                            r = g > 0 ? g : h > p ? i > p ? i : p : h, l[o - 3] = n[q], l[o - 2] = n[q + 1], l[o - 1] = n[q + 2], l[o] = j ? n[q + 3] : r
                        }
                    }
                    k.data = l, this.ctx.putImageData(k, a, b), this._renderBoundaries = [1e3, 1e3, 0, 0]
                },
                getValueAt: function (a) {
                    var b, c = this.shadowCtx,
                        d = c.getImageData(a.x, a.y, 1, 1),
                        e = d.data[3],
                        f = this._max,
                        g = this._min;
                    return b = Math.abs(f - g) * (e / 255) >> 0
                },
                getDataURL: function () {
                    return this.canvas.toDataURL()
                }
            }, a
        }(),
        d = function () {
            var b = !1;
            return "canvas2d" === a.defaultRenderer && (b = c), b
        }(),
        e = {
            merge: function () {
                for (var a = {}, b = arguments.length, c = 0; b > c; c++) {
                    var d = arguments[c];
                    for (var e in d) a[e] = d[e]
                }
                return a
            }
        },
        f = function () {
            function c() {
                var c = this._config = e.merge(a, arguments[0] || {});
                if (this._coordinator = new f, c.plugin) {
                    var h = c.plugin;
                    if (!a.plugins[h]) throw new Error("Plugin '" + h + "' not found. Maybe it was not registered.");
                    var i = a.plugins[h];
                    this._renderer = new i.renderer(c), this._store = new i.store(c)
                } else this._renderer = new d(c), this._store = new b(c);
                g(this)
            }

            var f = function () {
                    function a() {
                        this.cStore = {}
                    }

                    return a.prototype = {
                        on: function (a, b, c) {
                            var d = this.cStore;
                            d[a] || (d[a] = []), d[a].push(function (a) {
                                return b.call(c, a)
                            })
                        },
                        emit: function (a, b) {
                            var c = this.cStore;
                            if (c[a])
                                for (var d = c[a].length, e = 0; d > e; e++) {
                                    var f = c[a][e];
                                    f(b)
                                }
                        }
                    }, a
                }(),
                g = function (a) {
                    var b = a._renderer,
                        c = a._coordinator,
                        d = a._store;
                    c.on("renderpartial", b.renderPartial, b), c.on("renderall", b.renderAll, b), c.on("extremachange", function (b) {
                        a._config.onExtremaChange && a._config.onExtremaChange({
                            min: b.min,
                            max: b.max,
                            gradient: a._config.gradient || a._config.defaultGradient
                        })
                    }), d.setCoordinator(c)
                };
            return c.prototype = {
                addData: function () {
                    return this._store.addData.apply(this._store, arguments), this
                },
                removeData: function () {
                    return this._store.removeData && this._store.removeData.apply(this._store, arguments), this
                },
                setData: function () {
                    return this._store.setData.apply(this._store, arguments), this
                },
                setDataMax: function () {
                    return this._store.setDataMax.apply(this._store, arguments), this
                },
                setDataMin: function () {
                    return this._store.setDataMin.apply(this._store, arguments), this
                },
                configure: function (a) {
                    return this._config = e.merge(this._config, a), this._renderer.updateConfig(this._config), this._coordinator.emit("renderall", this._store._getInternalData()), this
                },
                repaint: function () {
                    return this._coordinator.emit("renderall", this._store._getInternalData()), this
                },
                getData: function () {
                    return this._store.getData()
                },
                getDataURL: function () {
                    return this._renderer.getDataURL()
                },
                getValueAt: function (a) {
                    return this._store.getValueAt ? this._store.getValueAt(a) : this._renderer.getValueAt ? this._renderer.getValueAt(a) : null
                }
            }, c
        }(),
        g = {
            create: function (a) {
                return new f(a)
            },
            register: function (b, c) {
                a.plugins[b] = c
            }
        };
    return g
}),
    function () {
        function a(a, b) {
            this.setMap(a), this.map = a, this.cfg = b || {}, qq.maps.Overlay.call(this)
        }

        function b() {
            var a = document.createElement("canvas");
            return !(!a.getContext || !a.getContext("2d"))
        }

        var c = window.QQMapPlugin = window.QQMapPlugin || {};
        a.prototype = new qq.maps.Overlay, a.CSS_TRANSFORM = function () {
            for (var a = document.createElement("div"), b = ["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"], c = 0; c < b.length; c++) {
                var d = b[c];
                if (void 0 !== a.style[d]) return d
            }
            return b[0]
        }(), a.prototype.construct = function () {
            var a = this.container = document.createElement("div"),
                b = this.map,
                c = b.getContainer(),
                d = this.width = c.clientWidth,
                e = this.height = c.clientHeight;
            this.cfg.container = a, a.style.cssText = "width:" + d + "px;height:" + e + "px;", this.data = [], this.max = 1, this.min = 0, this.getPanes().overlayLayer.appendChild(a);
            var f = this;
            this.changeHandler = qq.maps.event.addListener(b, "bounds_changed", function () {
                f.draw()
            }), this.heatmap || (this.heatmap = h337.create(this.cfg)), this.constructed = !0
        }, a.prototype.show = function () {
            this.container.style.display = ""
        }, a.prototype.hide = function () {
            this.container.style.display = "none"
        }, a.prototype.destroy = function () {
            this.container.parentElement.removeChild(this.container), this.changeHandler && (qq.maps.event.removeListener(this.changeHandler), this.changeHandler = null)
        }, a.prototype.draw = function () {
            if (this.map) {
                var b = this.map.getBounds(),
                    c = new qq.maps.LatLng(b.getNorthEast().getLat(), b.getSouthWest().getLng()),
                    d = this.getProjection(),
                    e = d.fromLatLngToDivPixel(c);
                this.container.style[a.CSS_TRANSFORM] = "translate(" + Math.round(e.x) + "px," + Math.round(e.y) + "px)", this.update()
            }
        }, a.prototype.resize = function () {
            if (this.map) {
                var a = this.map.getContainer(),
                    b = a.clientWidth,
                    c = a.clientHeight;
                (b != this.width || c != this.height) && (this.width = b, this.height = c, this.heatmap._renderer.setDimensions(b, c))
            }
        }, a.prototype.update = function () {
            var a, b, c, d, e = this.map.getProjection();
            if (e && (c = this.map.getBounds(), d = new qq.maps.LatLng(c.getNorthEast().getLat(), c.getSouthWest().getLng()), a = this.map.getZoom(), b = Math.pow(2, a), this.resize(), 0 != this.data.length)) {
                for (var f = {
                    max: this.max,
                    min: this.min
                }, g = [], h = this.data.length, i = this.getProjection(), j = i.fromLatLngToDivPixel(d), k = this.cfg.scaleRadius ? b : 20, l = 0, m = 0, n = this.cfg.valueField; h--;) {
                    var o = this.data[h],
                        p = o[n],
                        q = o.latlng;
                    if (c.contains(q)) {
                        l = Math.max(p, l), m = Math.min(p, m);
                        var r = i.fromLatLngToDivPixel(q),
                            s = {
                                x: Math.round(r.x - j.x),
                                y: Math.round(r.y - j.y)
                            };
                        s[n] = p;
                        var t;
                        t = o.radius ? o.radius * k : (this.cfg.radius || 2) * k, s.radius = t, g.push(s)
                    }
                }
                this.cfg.useLocalExtrema && (f.max = l, f.min = m), f.data = g, this.heatmap.setData(f)
            }
        }, a.prototype.setData = function (a) {
            var b = this;
            if (this.constructed) {
                this.max = a.max, this.min = a.min;
                for (var c = this.cfg.latField || "lat", d = this.cfg.lngField || "lng", e = this.cfg.valueField || "value", a = a.data, f = a.length, g = []; f--;) {
                    var h = a[f],
                        i = new qq.maps.LatLng(h[c], h[d]),
                        j = {
                            latlng: i
                        };
                    j[e] = h[e], h.radius && (j.radius = h.radius), g.push(j)
                }
                this.data = g, this.update()
            } else setTimeout(function () {
                b.setData(a)
            }, 100)
        }, a.prototype.addData = function (a) {
            if (a.length > 0)
                for (var b = a.length; b--;) this.addData(a[b]);
            else {
                var c = this.cfg.latField || "lat",
                    d = this.cfg.lngField || "lng",
                    e = this.cfg.valueField || "value",
                    f = a,
                    g = new qq.maps.LatLng(f[c], f[d]),
                    h = {
                        latlng: g
                    };
                h[e] = f[e], f.radius && (h.radius = f.radius), this.max = Math.max(this.max, h[e]), this.min = Math.min(this.min, h[e]), this.data.push(h), this.update()
            }
        }, c.isSupportCanvas = b(), c.HeatmapOverlay = a
    }();