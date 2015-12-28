(function() {
    var pluginName = 'SaveScenes',
        serverPrefix = 'http://search.kosmosnimki.ru/',
        serverScript = serverPrefix + 'QuicklooksJson.ashx';

    _translationsHash.addtext('rus', {
        'SaveScenes.iconTitle'  : 'Поиск снимков по экрану',
        'SaveScenes.setTop'     : 'Снимков:',
        'SaveScenes.visible'    : 'видимых:'
    });
    _translationsHash.addtext('eng', {
        'SaveScenes.iconTitle'  : 'Find scene by screen',
        'SaveScenes.setTop'     : 'Quicklook:',
        'SaveScenes.visible'    : 'on:'
    });

    var setHiddenLayer = function(layer, map) {
        var ids = {};
        if (L.Mixin.ContextMenu) {
console.log('ddddddddddd', layer._gmx.layerID);
            L.setOptions(layer, {
                contextmenu: false,
                contextmenuItems: [
                    { separator: true },
                    { text: '' },
                    { text: '' }
                ],
                contextmenuInheritItems: true,
            });
            L.extend(layer, L.Mixin.ContextMenu);
            layer.bindContextMenu();

            var select = L.DomUtil.create('select', 'select-items');
            L.DomEvent
                .on(select, 'mousewheel', L.DomEvent.stopPropagation)
                .disableScrollPropagation(select);

            select.multiple = true;
            select.size = 6;

            var setCount = function(all, visible) {
                var contextmenu = map.contextmenu,
                    arr = contextmenu._items;

                arr[arr.length - 2].el.innerHTML = _gtxt(pluginName + '.setTop') +
                    ' <b>' + all + '</b> ' +
                    _gtxt(pluginName + '.visible') +
                    ' <b>' + visible + '</b>';
            };

            var selectItem = L.bind(function (ev) {
                var count = 0,
                    target = ev.target,
                    len = target.options.length;
                for (var i = 0; i < len; i++) {
                    var option = target.options[i];
                    if (option) {
                        var id = option._id;
                        if (option.selected) {
                            if (!ids[id]) {
                                ids[id] = true;
                                layer.bringToTopItem(id);
                                layer.redrawItem(id);
                            }
                            count++;
                        } else {
                            if (ids[id]) {
                                ids[id] = false;
                                layer.redrawItem(id);
                            }
                        }
                    }
                }
                setCount(len, count);
// console.log('change', option, select.selectedIndex, ids);
            }, this);
            L.DomEvent.on(select, 'change', selectItem);

            var addOptions = function(arr) {
                var count = 0, i,
                    len = arr.length;
                for (i = select.options.length - 1; i >= 0; i--) {
                    select.remove(i);
                }
                for (i = 0; i < len; i++) {
                    var it = arr[i],
                        propsArr = it.properties,
                        properties = layer.getItemProperties(propsArr),
                        sceneid = properties.sceneid,
                        option = document.createElement('option');

                    option.text = sceneid;
                    option._id = it.id;
                    option.selected = ids[it.id];
                    if (option.selected) { count++; }
                    select.add(option);
                }
                setCount(len, count);
var tt = 1;
            };
            layer
                .setStyleHook(function(it) {
                    return ids[it.id] ? {} : {skipRasters: true};
                })
                .on('contextmenu', function (ev) {
                    var contextmenu = map.contextmenu,
                        arr = contextmenu._items,
                        elSum = arr[arr.length - 2].el,
                        el = arr[arr.length - 1].el;

                    L.DomUtil.addClass(elSum, 'leaflet-contextmenu-item-disabled');
                    L.DomUtil.addClass(el, 'leaflet-contextmenu-item-disabled');
                    el.appendChild(select);
                    addOptions(ev.gmx.targets);
    // console.log('__layer_____', layer.options.contextmenuItems, arr);
                });
        }
    };

    var publicInterface = {
        pluginName: pluginName,
        afterViewer: function(params, map) {
            var path = gmxCore.getModulePath(pluginName);
            var _params = $.extend({
                regularImage: 'satellite.png',
                layerName: null
            }, params);

            for (var layerID in nsGmx.gmxMap.layersByID) {
                var layer = nsGmx.gmxMap.layersByID[layerID],
                    rawProps = layer.getGmxProperties(),
                    viewType = rawProps.MetaProperties.viewType;
                if (viewType && viewType.Value === 'hidden') {
                    setHiddenLayer(layer, nsGmx.leafletMap);
                }
            }
            
            var icon = new L.Control.gmxIcon({
                id: pluginName, 
                // togglable: true,
                regularImageUrl: _params.regularImage.search(/^https?:\/\//) !== -1 ? _params.regularImage : path + _params.regularImage,
                title: _gtxt(pluginName + '.iconTitle')
            }).on('click', function(ev) {
console.log('fffffff', ev);
/*
var nodes = nsCatalog.DataSources.InternalDataSource._resultView.treeView.getNodes();
    props = {},
    out = [],
    setLayer = function(layer) {
        nsGmx.leafletMap.addLayer(layer);
        var ids = {};
        layer
            .setStyleHook(function(it) {
                return ids[it.id] ? null : {skipRasters: true};
            })
            .on('click', function(ev) {
                if (ev.originalEvent.altKey) {
                    var id = ev.gmx.id;
                    if (ids[id]) {
                        ids[id] = false;
                    } else {
                        ids[id] = {skipRasters: true};
                    }
                }
            });
    };
for (var i = 0, len = nodes.length; i < len; i++) {
    var node = nodes[i];
    if (node.type === 'GroundOverlay') {
        var data = node.data,
            info = data.info,
            platform = info.platform.replace(/ /g, '_'),
            anchors = data.anchors;
    
        var properties = L.extend({}, info, {
            x1: anchors[0][0],
            y1: anchors[0][1],
            x2: anchors[1][0],
            y2: anchors[1][1],
            x3: anchors[2][0],
            y3: anchors[2][1],
            x4: anchors[3][0],
            y4: anchors[3][1]
        });
        out.push({properties: properties, geometry: L.gmxUtil.convertGeometry(data.geometry), action: 'insert'});
        for (var key in properties) {
            var type = typeof properties[key];
            if (type === 'number') {
                type = 'float';
            }
            props[key] = {Name: key, ColumnSimpleType: type};
       }
    }
}
if (out.length) {
    var crDate = new Date().toGMTString(),
        lp = new nsGmx.LayerProperties(),
        layerProps = {
            Type:           'Vector',
            SourceType:     'manual',
            Title:          crDate,
            RC: new nsGmx.LayerRCProperties({
                IsRasterCatalog: true
            }),
            Quicklook:      'http://search.kosmosnimki.ru/QuickLookImage.ashx?id=[sceneid]', 
            GeometryType:   'polygon',
            MetaProperties: new nsGmx.LayerTags({"quicklookPlatform":{"Value":"image","Type":"String"}, "viewType":{"Value":"hidden","Type":"String"}}),
            Columns:        []
        };
    
    for (var key in props) {
        layerProps.Columns.push(props[key]);
    }

    lp.set(layerProps);
    lp.save().done(function(response) {
        if (response.Status === 'ok' && response.Result) {
            var res = response.Result,
                layerID = res.properties.name;
            if (layerID) {
                _layersTree.addLayerToTree(layerID);
                _mapHelper.modifyObjectLayer(layerID, out).done(function() {
                    setLayer(nsGmx.gmxMap.layersByID[layerID]);
                });
            }
        }
    });
}
*/

            });
            nsGmx.leafletMap.addControl(icon);
        }
    };
    gmxCore.addModule(pluginName, publicInterface, {
        css: 'SaveScenes.css'
    });
})();