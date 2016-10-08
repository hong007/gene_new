/**
 * 这是一个难以释怀的js
 * Created by Quanta on 16/7/21.
 */
var mapRightMenu = {
    map: null,
    drawRightMenu: true,
    target: $('body'),
    GPS: {},
    elevationWindow: new google.maps.InfoWindow(),
    drawRule: false,
    ruleLocations: [],
    ruleLine: null,
    ruleMsgStyle: {},
    ruleMarkers: []
};
//显示海拔的小婊砸
function getElevationForLocations(locations, callback) {
    var elevation = new google.maps.ElevationService();
    elevation.getElevationForLocations({
        locations: locations
    }, callback);
}
//海拔
function getElevation() {
    $('#context-menu').hide();
    if (mapRightMenu.drawRightMenu) {
        getElevationForLocations([mapRightMenu.GPS], ElevationCallback);
    } else {
        getElevationForLocations([$('#context-menu').data('latLng')], ElevationCallback);
    }
}

function ElevationCallback(result, state) {
    if (state == google.maps.ElevationStatus.OK) {
        var targetResult = result[0];
        mapRightMenu.elevationWindow.setPosition(targetResult.location);
        mapRightMenu.elevationWindow.setContent('海拔:' + targetResult.elevation.toFixed(2) + '米');
        if (mapRightMenu.map) {
            mapRightMenu.elevationWindow.open(mapRightMenu.map);
        } else {
            mapRightMenu.elevationWindow.open(map);
        }
    }
}

/*测距相关小婊砸*/
function ruleTurn() {
    $('#context-menu').hide();
    mapRightMenu.drawRule = !mapRightMenu.drawRule;
    if (mapRightMenu.drawRule) {
        $('#context-menu div:last-child').text('关闭测距');
        if ($('#rule_zoom').length > 0) {
            $('#rule_zoom').show();
            $('#rule_zoom h5').text('距离:0米');
        } else {
            var div = $('<div id="rule_zoom" style="position: absolute;top: 60px;left: 0;right: 0;margin: 0 auto;width:250px;height: 50px;background: white;border: 1px solid #ddd;z-index:99;"></div>');
            var deleteSpan = $('<div onclick="ruleTurn()" style="float: right;margin-top:2px;margin-right:4px;cursor: pointer;"><span class="glyphicon glyphicon-remove-circle"></span></div>')
            div.append(deleteSpan).append($('<h5 style="line-height: 50px;text-align: center;margin: 0;"></h5>').text('距离为: 0 米'))
            mapRightMenu.target.append(div);
            mapRightMenu.ruleLine = new google.maps.Polyline({
                map: mapRightMenu.map,
                strokeColor: '#000',
                strokeOpacity: 0.8,
                strokeWeight: 2
            });
        }
        // flagRight = 1;
        console.log("flagRight is", flagRight);
    } else {
        $('#context-menu div:last-child').text('开始测距');
        $('#rule_zoom').hide();
        initRule();
        flagRight = 0;
        flagMap = 0;
        console.log("flagRight is", flagRight);
    }
}

function initRule() {
    $.each(mapRightMenu.ruleMarkers, function(i) {
        this.setMap(null);
    });
    mapRightMenu.ruleMarkers = [];
    mapRightMenu.ruleLine.setPath([]);
    mapRightMenu.ruleLocations = [];
}

function sphericalLength(locations) {
    return google.maps.geometry.spherical.computeLength(locations).toFixed(2);
}

function drawSphreicalMarker(e) {
    mapRightMenu.ruleLocations.push(e);
    var temp = new google.maps.Marker({
        map: mapRightMenu.map,
        position: e,
        draggable: true,
        crossOnDrag: false,
        icon: {
            size: new google.maps.Size(10, 10),
            anchor: new google.maps.Point(5, 5),
            origin: new google.maps.Point(0, 0),
            scaledSize: new google.maps.Size(10, 10),
            url: '../images/location_16px.png'
        }
    });
    $('#rule_zoom h5').text('距离:' + google.maps.geometry.spherical.computeLength(mapRightMenu.ruleLocations).toFixed(2) + '米');
    if (mapRightMenu.ruleMarkers.length > 0) {
        temp.addListener('click', function() {
            //点重置排序
            mapRightMenu.ruleMarkers[this.id].setMap(null);
            mapRightMenu.ruleMarkers.splice(this.id, 1);
            for (var i = this.id; i < mapRightMenu.ruleMarkers.length; i++) {
                mapRightMenu.ruleMarkers[i].id = i;
            }
            //线重置排序
            mapRightMenu.ruleLocations.splice(this.id, 1);
            mapRightMenu.ruleLine.setPath(mapRightMenu.ruleLocations);
            $('#rule_zoom h5').text('距离:' + google.maps.geometry.spherical.computeLength(mapRightMenu.ruleLocations).toFixed(2) + '米');
        });
    }
    temp.id = mapRightMenu.ruleMarkers.length;
    temp.addListener('drag', function(e) {
        mapRightMenu.ruleLocations[this.id] = e.latLng;
        mapRightMenu.ruleLine.setPath(mapRightMenu.ruleLocations);
        $('#rule_zoom h5').text('距离:' + google.maps.geometry.spherical.computeLength(mapRightMenu.ruleLocations).toFixed(2) + '米');
    });
    mapRightMenu.ruleMarkers.push(temp);
    mapRightMenu.ruleLine.setPath(mapRightMenu.ruleLocations);
}

/* 右键来啦, */
function IWantYou(options) {

    $.extend(mapRightMenu, options);
    if (mapRightMenu.drawRightMenu) {
        google.maps.event.addListener(mapRightMenu.map, 'rightclick', function(event) {
            if (flagRight == 1 && flagMap == 1) {
                if ($('#context-menu').length > 0) {
                    $('#context-menu').show().css({
                        left: event.pixel.x,
                        top: event.pixel.y
                    });
                } else {
                    var menu = $('<div id="context-menu"></div>'),
                        elevation = $('<div onclick="getElevation()">海拔高度</div>'),
                        rule = $('<div onclick="ruleTurn()">开始测距</div>');
                    menu.append(elevation).append(rule);
                    mapRightMenu.target.append(menu.css({
                        'z-index': 9999,
                        left: event.pixel.x,
                        top: event.pixel.y
                    }));
                }
                mapRightMenu.GPS = event.latLng;
            }

        });

    }
    google.maps.event.addListener(mapRightMenu.map, 'click', function(event) {
        if (flagRight == 1 && flagMap == 1) {

            if (mapRightMenu.drawRule) {
                drawSphreicalMarker(event.latLng);
            }
            $('#context-menu').hide();
        }

    });

}