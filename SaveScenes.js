(function() {
    var pluginName = 'SaveScenes',
        serverPrefix = 'http://search.kosmosnimki.ru/',
        serverScript = serverPrefix + 'QuicklooksJson.ashx';

    _translationsHash.addtext('rus', {
        'SaveScenes.iconTitle'  : 'Поиск снимков по экрану',
        'SaveScenes.setTop'     : 'Показать/Скрыть снимок'
    });
    _translationsHash.addtext('eng', {
        'SaveScenes.iconTitle'  : 'Find scene by screen',
        'SaveScenes.setTop'     : 'Show/Hide quicklook'
    });

var setLayers = function(map) {
// В маплете карты
    var setHiddenLayer = function(layer) {
        var ids = {};
        if (L.Mixin.ContextMenu) {
            L.setOptions(layer, {
                contextmenu: false,
                contextmenuItems: [{
                    text: 'Center map here',
                    callback: function () {console.log(arguments);}
                }],
                contextmenuInheritItems: true,
            });
            L.extend(layer, L.Mixin.ContextMenu);
            layer.bindContextMenu();
        }
        layer
            .on('mousedown', function(ev) {
                var out = {};
                var res = ev.gmx.targets.map(function(it) {
                    var propsArr = it.properties,
                        properties = layer.getItemProperties(propsArr),
                        sceneid = properties.sceneid,
                        geometry = [propsArr[propsArr.length - 1]];

                    var mItem = {
                        //text: '<b>' + sceneid + '</b>',
                        text: '<option>' + sceneid + '</option>',
                        //callback: function () { selectItem(sceneid); }
                    };
                    if (out[sceneid]) {
                        mItem.icon = 'images/error.png';
                        // console.log('Error: ', sceneid);
                    } else {
                        out[sceneid] = {
                            properties: properties,
                            sceneid: sceneid,
                            geometry: geometry
                        };
                    }
                    return '<option>' + sceneid + '</option>';
                });
                layer.options.contextmenuItems = [
                    { separator: true },
                    {
                        text: '<select class="select-item"><option>' + _gtxt(pluginName + '.setTop') + '</option>' + res + '</select>'
                        // ,
                        // context: this
                        // ,
                        // callback: function () {
                    // console.log('callback', arguments);
                        // }
                    }
                ];
                var select = null;
                var selectItem = function (ev) {
                    var sel = ev.target;
                    if (sel.selectedIndex) {
                        var current = sel.options[sel.selectedIndex];
                        var sceneid = current.value;
console.log('change', sceneid, current.selected);
                    }
                };
                
                map.on('contextmenu.hide', function (ev) {
                    if (select) { L.DomEvent.off(select, 'change', selectItem); }
                });
                map.on('contextmenu.show', function (ev) {
                    var contextmenu = map.contextmenu,
                        items = contextmenu._items,
                        el = items[items.length - 1].el;
                    // contextmenu.setDisabled(items[items.length - 1], true);
                    L.DomUtil.addClass(el, 'leaflet-contextmenu-item-disabled');
                    select = el.childNodes[0]
                    L.DomEvent.on(select, 'change', selectItem);
                    // console.log('contextmenu.show', arguments);
                });
                        
                // console.log('mousedown', res, ev.gmx.targets);
            })
            .on('click', function(ev) {
                var id = ev.gmx.id;
                ids[id] = !ev.originalEvent.altKey;
                layer.redrawItem(id);
            })
            .setStyleHook(function(it) {
                return ids[it.id] ? {} : {skipRasters: true};
            });
    };

 console.log('ddddddd', nsGmx.gmxMap, map);
    for (var layerID in nsGmx.gmxMap.layersByID) {
        var layer = nsGmx.gmxMap.layersByID[layerID],
            rawProps = layer.getGmxProperties(),
            viewType = rawProps.MetaProperties.viewType;
        if (viewType && viewType.Value === 'hidden') {
            setHiddenLayer(layer);
        }
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
            
            setLayers(nsGmx.leafletMap);
            
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