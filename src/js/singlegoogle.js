/* 地图初始化喽~~~~ */
var NAV_GPS = [120.001524, 30.279998];
var map, marker, marklist = [],
    polyLine, lineArr = [],
    clickPointLatLng;
lineArr.push({
    lng: NAV_GPS[0],
    lat: NAV_GPS[1]
});
var flagMap = 0;
var flagRight = 0;
var redrawFlight = 0;
function initMap() {
    map = new google.maps.Map(document.getElementById('container'), {
        center: {
            lat: NAV_GPS[1],
            lng: NAV_GPS[0]
        },
        zoom: 13
    });
    map.data.setStyle({
        cursor: 'crosshair'
    });
    map.addListener('click', function (e) {
        clickPointLatLng = e.latLng;
        var ele = new google.maps.ElevationService();
        ele.getElevationForLocations({
            locations: [e.latLng]
        }, function (param1, param2) {
            if (param2.toUpperCase() == 'OK') {
                $('#elevation').text(param1[0].elevation.toFixed(1));
            }
        });
        if (flagRight == 0 && flagMap == 0) {
            if (marker) {
                marker.setPosition(clickPointLatLng);
            } else {
                marker = new google.maps.Marker({
                    map: map,
                    draggable: true,
                    position: clickPointLatLng,
                    title: Local_count.toString(),
                    icon: {
                        size: new google.maps.Size(22, 34),
                        anchor: new google.maps.Point(10, 32),
                        origin: new google.maps.Point(((Local_count - 1) % 10) * 21, Math.floor((Local_count - 1) / 10) * 35),
                        scaledSize: new google.maps.Size(212, 350),
                        url: '../images/markers.png'
                    }
                });
                marker.addListener('drag', function (e) {
                    var num = this.title * 1;
                    if (num <= lineArr.length) {
                        if ($('.single-right-up-sub').eq(num).length > 0) {
                            lineArr[num] = e.latLng;
                            polyLine.setPath(lineArr);
                            var inputs = $('.single-right-up-sub').eq(num).find('input');

                            console.log("火星坐标转wgs84前 clickPointLatLng is ", clickPointLatLng.lng(), clickPointLatLng.lat());
                            var curcoordpoint = coordTransform(clickPointLatLng.lng(), clickPointLatLng.lat(), 1);
                            console.log("火星坐标转wgs84后 gcj02towgs84 is ", curcoordpoint);

                            inputs[0].value = curcoordpoint[0].toFixed(6);
                            inputs[1].value = curcoordpoint[1].toFixed(6);
                            // inputs[0].value = e.latLng.lng().toFixed(6);
                            // inputs[1].value = e.latLng.lat().toFixed(6);
                        }

                    }
                });
                marklist.push(marker);
                Local_count++;

            }
            flagMap = 1;
            flagRight = 0;
            // console.log("flagMap is",flagMap);
            // console.log("flagRight is", flagRight);
        }
        IWantYou({
            map: map,
            target: $('body')
        });
    });
    map.addListener('rightclick', function (e) {
        marker = null;
        if (flagRight == 0 && flagMap == 1) {
            if (lineArr.length == Local_count - 1) {
                lineArr.push(clickPointLatLng);
                polyLine.setPath(lineArr);
                addFlightPoint();
                flagMap = 0;
                flagRight = 0;
            }
        }
    });
    polyLine = new google.maps.Polyline({
        map: map,
        path: lineArr,
        strokeColor: common.colors.PointLine,
        strokeOpacity: 1,
        strokeWeight: 3,
        strokeStyle: "solid"
    });

    marklist[0] = null;
    map.data.setStyle({
        cursor: 'crosshair'
    });
    connect();
}

var finalData = {};
var results = {};
var infos = {
    local_position_ned: {
        x: 0,
        y: 0,
        z: 0
    },
    heartbeat: {
        base_mode: 0,
        system_status: 0
    },
    mission_ack_2: {
        target_uav: 1,
        target_system: 1,
        type: 8,
        count: 4,
        point: [{
            lat: 30.27760124206543,
            lon: 120.00386047363281,
            alt: 25,
            v: 2
        }, {
            lat: 30.276304244995117,
            lon: 120.0072021484375,
            alt: 25,
            v: 2
        }, {
            lat: 30.2739315032959,
            lon: 120.0066909790039,
            alt: 25,
            v: 2
        }, {
            lat: 30.2739315032959,
            lon: 120.00291442871094,
            alt: 25,
            v: 2
        }]
    },
    mission_ack_3: {
        target_uav: 1,
        target_system: 1,
        type: 8,
        count: 4,
        point: [{
            lat: 30.27760124206543,
            lon: 120.00386047363281,
            alt: 25
        }, {
            lat: 30.276304244995117,
            lon: 120.0072021484375,
            alt: 25
        }, {
            lat: 30.2739315032959,
            lon: 120.0066909790039,
            alt: 25
        }, {
            lat: 30.2739315032959,
            lon: 120.00291442871094,
            alt: 25
        }]
    }
};
var common = {
    colors: {
        PointLine: '#e63f00',
        FlightLine: '#0f0'
    }
};
var flight;
var Local_count = 1;
var length = 0;
var FilghtPoints = [];
var LE = true;
var ctrH = 0;
var draw_line = 0;
var imageReturn = {};
var imageNum = 9;
var imageAllData = '';

// var groundTimeout;

var flightPointClick = function (ele) {
    var sub = $(ele).parents('.single-right-up-sub');
    // console.log("定位航点 火星坐标转wgs84前 clickPointLatLng is ", sub.find("input[name=lon]").val() * 1, sub.find("input[name=lat]").val() * 1);
    var curcoord_flightgps = coordTransform(sub.find("input[name=lon]").val() * 1, sub.find("input[name=lat]").val() * 1, 2);
    // console.log("定位航点  火星坐标转wgs84后 gcj02towgs84 is ", curcoord_flightgps);

    var cur_position = {
        lng: curcoord_flightgps[0],
        lat: curcoord_flightgps[1]
    }

    // var cur_position = {
    //     lng: sub.find("input[name=lon]").val() * 1,
    //     lat: sub.find("input[name=lat]").val() * 1
    // }
    map.setCenter(cur_position);
    var target = $(ele).parent();
    if (target.hasClass('select')) {
        target.removeClass('select');
    } else {
        target.addClass('select');
    }

};

if (window.location.search.split('?')[1]) {
    var tempinfos = window.location.search.split('?')[1];
    if (tempinfos.split('&').length == 2) {
        infos['token'] = decodeURIComponent(tempinfos.split('&')[1].split('=')[1]);
        $("#curControlStatus").text("控制");
    }
    infos['heartbeat']['id_uav_xyi'] = tempinfos.split('&')[0].split('=')[1];
    document.getElementById('heartbeat.id_uav_xyi').innerText = infos['heartbeat']['id_uav_xyi'];
} else {
    alert('未选择飞行器id！');
}
var ws = null;
var curDataTime, lastDataTime, dataTime;
var flagTime = 0;
var timeOuts = {};
var timeOutsId = document.getElementById('heartbeat.id_uav_xyi').innerText;
timeOuts[timeOutsId] = {};

function connect() {
    ws = new WebSocket(server);
    console.info('in connect!');
    if (!ws) {
        alert("您的浏览器版本太低,不支持WebSocket,建议使用最新版本的Chrome Firefox或者IE");
        window.opener = null;
        window.open('', '_self');
        window.close();
    }
    ws.binaryType = "arraybuffer";

    ws.onopen = function () {
        console.log('websocket connected', server);
        var token = "";
        if (infos['token']) {
            token = infos['token'];
            console.log(token);
            var length = 7 + token.length;
            var ab = new ArrayBuffer(length);
            var buffer = new DataView(ab);
            var result = '';
            buffer.setUint8(0, 249);
            buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'], LE);
            buffer.setUint16(5, token.length, LE);
            for (var i = 0; i < token.length; i++) {
                buffer.setUint8(7 + i, token[i].charCodeAt());
            }
            //console.log(buffer.byteLength,buffer.getInt32(1,LE),buffer.getUint16(5,LE),String.fromCharCode.apply(null, new Uint8Array(buffer, 7, token.length)));
            ws.send(buffer);

            $("#curControlStatus").text("控制");
        } else {
            var length = 5;
            var ab = new ArrayBuffer(length);
            var buffer = new DataView(ab);
            buffer.setUint8(0, 249);
            buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'], LE);
            //console.log(buffer.byteLength,buffer.getUint8(0),buffer.getInt32(1,LE));
            ws.send(buffer);

            $("#clearRemoteData").hide();
            $("#curControlStatus").text("查看");
        }
    };
    ws.onerror = function (error) {
        console.log("websocket", error);
    };
    ws.onmessage = function (res) {
        losingTime = 0;
        results = res;
        finalData = res.data;
        var dv = new DataView(res.data);
        var begin = 0;
        // var old = [infos['local_position_ned']['x'], infos['local_position_ned']['y'], infos['local_position_ned']['z']];
        var old = [infos['local_position_ned']['x'], infos['local_position_ned']['y'], infos['local_position_ned']['z']];


        var msgid = dv.getUint8(begin);
        // console.log('msgid is',msgid);
        // console.log('infos["heartbeat"]["base_mode"] is',infos['heartbeat']['base_mode']);
        if (msgid == 1) {
            //heartbeat解析
            begin += 1;
            console.info('Heart beng~beng~beng~');

            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                infos['heartbeat'] = {};
                infos['heartbeat']['id_uav_xyi'] = dv.getUint8(begin);

                if (timeOuts[timeOutsId]['offlineTime']) {
                    // console.log(12);
                    window.clearTimeout(timeOuts[timeOutsId]['offlineTime']);
                    timeOuts[timeOutsId]['offlineTime'] = null;
                }
                // 没有心跳包清除所有定时器
                if (!timeOuts[timeOutsId]['offlineTime']) {
                    timeOuts[timeOutsId]['offlineTime'] = window.setTimeout(function () {

                        if (timeOuts[timeOutsId]['ThirdTimeout']) {
                            window.clearTimeout(timeOuts[timeOutsId]['ThirdTimeout']);
                            timeOuts[timeOutsId]['WSsetTimeout'] = null;
                        }
                        if (timeOuts[timeOutsId]['ThirdTimeoutShow']) {
                            window.clearTimeout(timeOuts[timeOutsId]['ThirdTimeoutShow']);
                            timeOuts[timeOutsId]['ThirdTimeoutShow'] = null;
                        }
                        if (timeOuts[timeOutsId]['WSsetTimeout']) {
                            window.clearTimeout(timeOuts[timeOutsId]['WSsetTimeout']);
                            timeOuts[timeOutsId]['WSsetTimeout'] = null;
                        }
                        if (timeOuts[timeOutsId]['WSsetTimeoutShow']) {
                            window.clearTimeout(timeOuts[timeOutsId]['WSsetTimeoutShow']);
                            timeOuts[timeOutsId]['WSsetTimeoutShow'] = null;
                        }
                        $("#signalWS").addClass("singnal-error");
                        $("#signal3G").addClass("singnal-error");

                        // document.getElementById('heartbeat.base_mode').innerText = "离线";

                    }, 30000);
                    // console.log(121232);
                }
                begin += 1;
                infos['heartbeat']['id_iso_xyi'] = dv.getUint8(begin);
                begin += 1;
                //新协议
                infos['heartbeat']['base_mode'] = dv.getUint8(begin);
                begin += 1;
                infos['heartbeat']['system_status'] = dv.getUint8(begin);
                begin += 1;
                //新协议结束
                infos['heartbeat']['xylink_version'] = dv.getUint8(begin);
                begin += 1;
                if (flight) {

                } else {
                    drapExpFlightMarker();
                }
            }

            if (system_status_flag[infos.heartbeat.base_mode] == "离线") {
                $("#signalWS").addClass("singnal-error");
                $("#signal3G").addClass("singnal-error");
            }

            // 设置滚动log信息
            if ($("#logList p").length == 0) {
                setLogInfor(formatDateTime(), system_status_flag[infos.heartbeat.base_mode]);
            } else if (system_status_flag[infos.heartbeat.base_mode] != document.getElementById("heartbeat.base_mode").innerText) {
                // console.log("飞机新的状态是  ", system_status_flag[infos.heartbeat.base_mode], "飞机上一个状态是 ", document.getElementById("heartbeat.base_mode").innerText);
                setLogInfor(formatDateTime(), system_status_flag[infos.heartbeat.base_mode]);
            }

            setValueFromInfos('heartbeat', 'id_uav_xyi');
            setValueFromInfos('heartbeat', 'base_mode', system_status_flag[infos.heartbeat.base_mode], true);
            // console.log(" infos['heartbeat']['system_status'] is ", infos['heartbeat']['system_status']);
            changeCtlIcons(infos['heartbeat']['system_status']);

            //降落后，起点为降落点
            if (infos['heartbeat'] && infos['heartbeat']['base_mode'] == 11) {
                // var inputs = $('.single-right-up-block').eq(0).find('input');
                var inputs = $('.single-right-up-sub').eq(0).find('input');
                inputs[1].value = infos['gps_raw']['lat_gps'];
                inputs[0].value = infos['gps_raw']['lon_gps'];
            }
            var txtColor = document.getElementById('heartbeat.base_mode');
            if (infos['heartbeat'] && infos['heartbeat']['base_mode'] == 34) {
                txtColor.style.color = "#fd0";
            } else {
                txtColor.style.color = "#bbfbfc";
            }
        } else if (msgid == 2) {
            //battery_status解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                // 数据包是否过时
                if (flagTime == 0) {
                    // console.log('flagTime is', flagTime);
                    dataTime = dv.getUint32(begin, LE);
                    curDataTime = dv.getUint32(begin, LE);
                    lastDataTime = curDataTime;
                    flagTime = 1;
                    // console.log('dataTime is',dataTime);
                    // console.log('curDataTime is',curDataTime);
                    // console.log('lastDataTime is',lastDataTime);
                } else {
                    lastDataTime = dataTime;
                    curDataTime = dv.getUint32(begin, LE);

                    if (curDataTime < lastDataTime) {
                        return;
                        console.log("不接受过时包");
                        // alert('该包已经过时了！');
                    } else {

                        lastDataTime = curDataTime;
                        dataTime = curDataTime;
                        // console.log("接受新包");
                        // console.log('flagTime is' ,flagTime);
                        // console.log('dataTime is',dataTime);
                        // console.log('curDataTime is',curDataTime);
                        // console.log('lastDataTime is',lastDataTime);


                        /* 20160529新协议，增加time_std_s*/
                        infos['battery_status'] = {};
                        infos['battery_status']['time_std_s'] = 0;
                        infos['battery_status']['time_std_s'] = dv.getUint32(begin, LE);
                        infos['time_step'] = new Date().getTime() / 1000 - dv.getUint32(begin, LE);
                        infos['last_date'] = dv.getUint32(begin, LE);
                        begin += 4;
                        /* 20160529新协议，增加time_std_s*/
                        infos['battery_status']['voltages'] = [];
                        for (var i = 0; i < 10; i++) {
                            infos['battery_status']['voltages'][i] = (dv.getUint16(begin, LE) / 1000).toFixed(2);
                            begin += 2;
                        }
                        // var voltagesOne=(infos['battery_status']['voltages'][0] / 1000).toFixed(2);
                        infos['battery_status']['current_battery'] = dv.getInt16(begin, LE);
                        begin += 2;
                        infos['battery_status']['battery_remaining'] = dv.getInt8(begin);
                        begin += 1;
                        // infos['battery_status']['fc_output_ave'] = dv.getUint16(begin, LE);
                        // begin += 2;

                        // setValueFromInfos('battery_status', 'voltages',(infos['battery_status']['voltages'][0] / 1000).toFixed(2),true);
                        setValueFromInfos('battery_status', 'voltages');
                        setValueFromInfos('battery_status', 'current_battery');
                        setValueFromInfos('battery_status', 'battery_remaining');
                        setValueFromInfos('battery_status', 'fc_output_ave');
                        /*if (infos['battery_status']['battery_remaining'] <= 25) {
                         nav.src = "../images/uav/flight4.png";
                         } else if (infos['battery_status']['battery_remaining'] <= 50) {
                         nav.src = "../images/uav/flight3.png";
                         } else if (infos['battery_status']['battery_remaining'] <= 75) {
                         nav.src = "../images/uav/flight2.png";
                         } else {
                         nav.src = "../images/uav/flight1.png";
                         }*/

                    }

                }


            }
        } else if (msgid == 3) {
            //local_position_ned解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                infos['local_position_ned'] = {};
                infos['local_position_ned']['time_std_s'] = 0;
                infos['local_position_ned']['time_std_s'] = dv.getUint32(begin, LE);
                infos['time_step'] = new Date().getTime() / 1000 - dv.getUint32(begin, LE);
                infos['last_date'] = dv.getUint32(begin, LE);
                infos['local_position_ned']['loseWSTime'] = infos['local_position_ned']['time_std_s'];
                begin += 4;
                infos['local_position_ned']['x'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['local_position_ned']['y'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['local_position_ned']['z'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['local_position_ned']['vx'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['local_position_ned']['vy'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['local_position_ned']['vz'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['local_position_ned']['dis_m'] = dv.getFloat32(begin, LE).toFixed(1);
                begin += 4;
                setValueFromInfos('local_position_ned', 'time_std_s');
                setValueFromInfos('local_position_ned', 'x');
                setValueFromInfos('local_position_ned', 'y');
                setValueFromInfos('local_position_ned', 'z');
                setValueFromInfos('local_position_ned', 'vx');
                setValueFromInfos('local_position_ned', 'vy');
                setValueFromInfos('local_position_ned', 'vz');
                $('#FlightLength').text(infos['local_position_ned']['dis_m']);
            }
        } else if (msgid == 4) {
            //global_position_int解析
            // console.log('msgid is ', msgid);
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                infos['global_position_int'] = {};
                infos['global_position_int']['time_std_s'] = 0;
                infos['global_position_int']['time_std_s'] = dv.getUint32(begin, LE);
                infos['time_step'] = new Date().getTime() / 1000 - dv.getUint32(begin, LE);
                infos['last_date'] = dv.getUint32(begin, LE);
                begin += 4;
                infos['global_position_int']['relative_alt'] = (dv.getInt32(begin, LE) / 1000).toFixed(1);
                begin += 4;

                infos['global_position_int']['pitch_deg'] = dv.getInt16(begin, LE) / 100;
                begin += 2;
                infos['global_position_int']['roll_deg'] = dv.getInt16(begin, LE) / 100;
                begin += 2;

                infos['global_position_int']['hdg'] = dv.getUint16(begin, LE) / 100;
                begin += 2;
                setValueFromInfos('global_position_int', 'time_boot_ms', infos.global_position_int.time_boot_ms / 600, true);
                setValueFromInfos('global_position_int', 'relative_alt');

                setValueFromInfos('global_position_int', 'pitch_deg', infos.global_position_int.pitch_deg * 10, true);
                setValueFromInfos('global_position_int', 'roll_deg', (infos.global_position_int.roll_deg * 10).toFixed(1), true);
                // console.log('pitch_deg is ', infos.global_position_int.pitch_deg * 10);
                // console.log('roll_deg is ', infos.global_position_int.roll_deg * 10);

                setValueFromInfos('global_position_int', 'hdg');
                if (flight) {
                    //$('img[src="../images/uav/flight1.png"]').style.transform = 'rotate('+infos['global_position_int']['hdg']+'deg)';
                    // $('img[src="../images/uav/flight1.png"]').css('transform', 'rotate(' + infos['global_position_int']['hdg'] + 'deg)');
                    // console.log(infos['global_position_int']['hdg'])
                    // if (infos["heartbeat"] && ((infos["heartbeat"]["base_mode"] >= 1 && infos["heartbeat"]["base_mode"] <= 4) || infos["heartbeat"]["base_mode"] == 52)) {
                    //     $('#' + document.getElementById('heartbeat.id_uav_xyi').innerText).css('transform', 'rotate(0deg)');
                    // } else {
                    //     $('#' + document.getElementById('heartbeat.id_uav_xyi').innerText).css('transform', 'rotate(' + infos['global_position_int']['hdg'] + 'deg)');
                    // }
                    if (infos["heartbeat"]) {
                        $('#' + document.getElementById('heartbeat.id_uav_xyi').innerText).css('transform', 'rotate(' + infos['global_position_int']['hdg'] + 'deg)');
                    }
                    /*$('img[src="../images/uav/flight1.png"]').parent().each(function () {
                     if(this.title){
                     }else{
                     $(this).css('transform','rotate('+infos['global_position_int']['hdg']+'deg)');
                     }
                     });*/
                }
            }
        } else if (msgid == 5) {
            //gps_raw解析
            // console.log('msgid', msgid, 'id length', dv.byteLength);

            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                infos['gps_raw'] = {};
                infos['gps_raw']['time_std_s'] = 0;
                infos['gps_raw']['time_std_s'] = dv.getUint32(begin, LE);
                infos['time_step'] = new Date().getTime() / 1000 - dv.getUint32(begin, LE);
                infos['last_date'] = dv.getUint32(begin, LE);
                begin += 4;
                infos['gps_raw']['fix_type'] = dv.getUint8(begin);
                begin += 1;
                var lat = parseFloat(dv.getInt32(begin, LE)) / 1E7;
                infos['gps_raw']['lat_gps'] = lat;
                begin += 4;
                var lon = parseFloat(dv.getInt32(begin, LE)) / 1E7;
                infos['gps_raw']['lon_gps'] = lon;
                begin += 4;
                var alt = parseFloat(dv.getInt32(begin, LE)) / 1E7;
                infos['gps_raw']['alt_gps'] = alt;
                begin += 4;
                infos['gps_raw']['eph'] = dv.getUint16(begin, LE);
                begin += 2;
                infos['gps_raw']['epv'] = dv.getUint16(begin, LE);
                begin += 2;
                infos['gps_raw']['vel_gps'] = dv.getUint16(begin, LE) / 100;
                begin += 2;
                infos['gps_raw']['cog'] = dv.getUint16(begin, LE) / 100;
                begin += 2;
                infos['gps_raw']['satellites_visible'] = dv.getUint8(begin);
                begin += 1;
                setValueFromInfos('gps_raw', 'time_boot_ms', infos.gps_raw.time_boot_ms / 600, true);
                setValueFromInfos('gps_raw', 'fix_type');
                setValueFromInfos('gps_raw', 'lat_gps');
                setValueFromInfos('gps_raw', 'lon_gps');
                setValueFromInfos('gps_raw', 'alt_gps');
                setValueFromInfos('gps_raw', 'eph');
                setValueFromInfos('gps_raw', 'epv');
                setValueFromInfos('gps_raw', 'vel_gps');
                setValueFromInfos('gps_raw', 'cog');
                setValueFromInfos('gps_raw', 'satellites_visible');
                NAV_GPS = [infos['gps_raw']['lon_gps'], infos['gps_raw']['lat_gps']];


                var curcoordpoint = coordTransform(NAV_GPS[0], NAV_GPS[1], 2);
                lineArr[0] = {
                    lng: curcoordpoint[0],
                    lat: curcoordpoint[1]
                };
                // console.log('GPS转换前  ',NAV_GPS[0],'  ',NAV_GPS[1])
                // console.log('GPS转换后 ',curcoordpoint,'  ',lineArr[0],'  ',NAV_GPS[0],'  ',NAV_GPS[1])
                if (infos['heartbeat']['system_status'] == 0) {
                    map.setCenter(lineArr[0]);

                }
                if (infos['heartbeat']['system_status'] == 1) {

                }
                if (flight) {
                    flight.setPosition(lineArr[0]);
                }

                $('#start input[name=lon]').val(infos['gps_raw']['lon_gps']);
                $('#start input[name=lat]').val(infos['gps_raw']['lat_gps']);


                // console.log(infos.gps_raw);
            }
        } else if (msgid == 81) {
            //地面站heartbeat解析
            console.info('msgid is ', dv.getUint8(begin), "地面站~~~");
            // console.log(dv.byteLength, dv.getUint8(begin++), dv.getUint8(begin++), dv.getUint8(begin++), dv.getUint8(begin++), dv.getUint8(begin++), dv.getUint8(begin++));
            // begin += 1;
            // $("#signalGround").removeClass("singnal-error");
            // if (infos['heartbeat']['groundTimeout']) {
            //     // console.log("清除定时器");
            //     window.clearTimeout(infos['heartbeat']['groundTimeout']);
            //     // infos['heartbeat']['groundTimeout']=null;
            //     // $("#signalGround").removeClass("singnal-error");
            // }
            // infos['heartbeat'] = {};
            // infos['heartbeat']['id_uav_xyi'] = dv.getUint8(begin);
            // begin += 1;
            // infos['heartbeat']['id_iso_xyi'] = dv.getUint8(begin);
            // begin += 1;
            // //新协议
            // infos['heartbeat']['base_mode'] = dv.getUint8(begin);
            // begin += 1;
            // infos['heartbeat']['system_status'] = dv.getUint8(begin);
            // begin += 1;
            // //新协议结束
            // infos['heartbeat']['xylink_version'] = dv.getUint8(begin);
            // begin += 1;
            // if (infos['heartbeat']['base_mode'] == 0) {
            //     // console.log(infos['heartbeat']['base_mode']);
            //     // $("#signalGround").removeClass("singnal-error");
            //     if (!infos['heartbeat']['groundTimeout']) {
            //         // console.log(infos['heartbeat']['base_mode']);
            //         infos['heartbeat']['groundTimeout'] = window.setTimeout(function () {
            //             $("#signalGround").addClass("singnal-error");
            //         }, 5000);
            //     }
            // }
            //连接信号
        } else if (msgid == 101) {
        } else if (msgid == 102) {
            //command_xyi_long解析
            // console.log('msgid', msgid, dv.getUint8(begin + 1), dv.getUint16(begin + 2, LE), dv.getUint8(begin + 4));
            infos['command_ack'] = {};
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                infos['command_ack']['command'] = dv.getUint16(begin, LE);
                begin += 2;
                infos['command_ack']['result'] = dv.getUint8(begin);
                begin += 1;
                if (infos['command_ack']['command'] == 3 && infos['command_ack']['result'] == 0) { //指令3且执行成功
                    /* Just for you, my dear kongzhi tiaocan!! 就为了你，我亲爱的控制调参   */

                    if (window.location.search.split('?')[1]) {
                        var tempinfos = window.location.search.split('?')[1];
                        if (tempinfos.split('&').length == 2) {
                            alert(command_ack_flag[infos['command_ack']['result']]);
                            $('#pid').modal('hide');
                        }
                    }


                } else if (infos['command_ack']['command'] == 4 && infos['command_ack']['result'] == 0) {
                    /* Just for you, my dear kongzhi tiaocan!! 就为了你，我亲爱的控制调参   */
                    if (window.location.search.split('?')[1]) {
                        var tempinfos = window.location.search.split('?')[1];
                        if (tempinfos.split('&').length == 2) {
                            alert(command_ack_flag[infos['command_ack']['result']]);
                            $('#pid').modal('hide');
                        }
                    }

                } else if ((infos['command_ack']['command'] == 7 || infos['command_ack']['command'] == 8 || infos['command_ack']['command'] == 9 || infos['command_ack']['command'] == 10) && infos['command_ack']['result'] == 0) {
                    if (window.location.search.split('?')[1]) {
                        var tempinfos = window.location.search.split('?')[1];
                        if (tempinfos.split('&').length == 2) {
                            // alert(12);
                            alert(command_ack_flag[infos['command_ack']['result']]);
                            // $('#pid').modal('hide');
                        }
                    }
                } else if (infos['command_ack']['command'] != 3 && infos['command_ack']['result'] > 0) {
                    if (window.location.search.split('?')[1]) {
                        var tempinfos = window.location.search.split('?')[1];
                        if (tempinfos.split('&').length == 2) {
                            alert(command_ack_flag[infos['command_ack']['result']]);
                        }
                    }
                }
            }
        } else if (msgid == 106) {
            //command_xyi_long解析
            console.log(msgid, 'back');
            infos['mission_ack'] = {};
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                infos['mission_ack']['target_uav'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack']['target_system'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack']['type'] = dv.getUint8(begin);
                begin += 1;
                if (infos['mission_ack']['type'] > 0) {
                    alert(mission_ack_flag[infos['mission_ack']['type']][0]);
                }
            }
        } else if (msgid == 108) {
            //mission_ack_2航点查询解析
            console.log("msgid is  ", msgid);
            console.log(msgid, 'back', dv.byteLength, dv.getUint8(begin + 1));
            begin += 1;
            if (dv.getUint8(begin) == infos['heartbeat'].id_uav_xyi) {
                infos['mission_ack_2'] = {};
                console.log('id', infos['heartbeat'].id_uav_xyi);
                infos['mission_ack_2']['target_uav'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_2']['target_system'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_2']['type'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_2']['count'] = dv.getUint16(begin, LE);
                if (infos['mission_ack_2']['count'] == 256) {
                    infos['mission_ack_2']['count'] = (dv.byteLength - 7) / 16;
                }
                begin += 2;
                infos['mission_ack_2']['frame'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_2']['point'] = [];
                for (var i = 0; i < infos['mission_ack_2']['count']; i++) {
                    var point = {}
                    var lat = dv.getInt32(begin, LE) / 1e7;
                    point['lat'] = lat;
                    //point['lat'] = (lat / Math.PI) * 180 - 0.002450;
                    begin += 4;
                    var lon = dv.getInt32(begin, LE) / 1e7;
                    point['lon'] = lon;
                    //point['lon'] = (lon / Math.PI) * 180 + 0.004740;
                    begin += 4;
                    point['alt'] = dv.getInt32(begin, LE) / 1e3.toFixed(2);
                    begin += 4;
                    point['v'] = dv.getInt32(begin, LE) / 1e3.toFixed(2);
                    begin += 4;
                    infos['mission_ack_2']['point'][i] = point;
                }

                if (infos['heartbeat']['base_mode']) {
                    drawSearchPoint();
                } else {
                    //一般情况下，在线状态显示的，才是上一次的返回点吧！！
                    drawSearchPoint(true);
                }
                // console.log(infos.gps_raw);
                if (draw_line == 0) {
                    draw_line = 1;
                }
                console.log("infos['mission_ack_2'] is", infos['mission_ack_2']);
            }
        } else if (msgid == 109) {
            //mission_ack_3备降点查询
            infos['mission_ack_3'] = {};
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                infos['mission_ack_3']['target_uav'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_3']['target_system'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_3']['type'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_3']['count_em'] = dv.getUint16(begin, LE);
                begin += 2;
                infos['mission_ack_3']['point'] = [];
                for (var i = 0; i < infos['mission_ack_3']['count_em']; i++) {
                    var point = {}
                    var lat = dv.getInt32(begin, LE) / 1e7;
                    point['lat'] = (lat / Math.PI) * 180 - 0.002450;
                    begin += 4;
                    var lon = dv.getInt32(begin, LE) / 1e7;
                    point['lon'] = (lon / Math.PI) * 180 + 0.004740;
                    begin += 4;
                    point['alt'] = dv.getInt32(begin, LE) / 1e3.toFixed(2);
                    begin += 4;
                    infos['mission_ack_3']['point'][i] = point;
                }
                drawSearchEnd();
            }
        } else if (msgid == 125) {
            //图片分批回传
            console.log('msgid', msgid, 'id length', dv.byteLength);
            infos['image_data'] = {};
            begin += 1;
            // var id = dv.getUint8(begin);
            // console.log(dv.getUint8(begin),dv.getUint32(begin,LE));
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                infos['image_data']['image_id'] = dv.getUint32(begin, LE);
                var imageId = dv.getUint8(begin);
                begin += 4;
                infos['image_data']['image_piece_num'] = dv.getUint8(begin);
                begin += 1;
                // var curimageNum=infos['image_data']['image_piece_num'];
                infos['image_data']['image_piece_id'] = dv.getUint8(begin);
                begin += 1;
                // var length=dv.byteLength - begin;

                if (!imageReturn[imageId]) {
                    imageReturn[imageId] = {};
                    imageReturn[imageId]['image_data'] = {};
                }
                imageReturn[imageId]['image_data'] = infos['image_data'];
                if (imageReturn[imageId]['image_data']['image_id'] == infos['image_data']['image_id']) {
                    var len = dv.byteLength - begin;
                    var pic = "";
                    var arr = new Uint8Array(res.data, begin, len);
                    for (var i = 0; i < arr.length; ++i) {
                        pic += String.fromCharCode(arr[i]);
                    }
                    imageAllData += pic;
                    // console.log(imageReturn[imageId]['image_data']);
                    // console.log('imageReturn[imageId]["image_data"]["image_id"] is ', imageReturn[imageId]['image_data']['image_id']);
                    if (imageReturn[imageId]['image_data']['image_piece_id'] + 1 == imageReturn[imageId]['image_data']['image_piece_num']) {
                        // console.log(imageReturn[imageId]['image_data']['image_piece_num'], imageReturn[id]['image_data']['image_piece_id'] + 1);
                        // console.log(imageReturn[imageId]['image_data']['image_piece_id']);
                        imageAllData = btoa(imageAllData);

                        if (infos.heartbeat && infos.heartbeat.base_mode && infos.heartbeat.base_mode == 33) {
                            // if (infos['uavStop'] && infos['uavStop'] == true) {
                            //     $('#image').modal('show');
                            // }
                            $('#image').modal('show');
                            $('#imgZoom').attr('src', 'data:image/jpg;base64,' + imageAllData);
                            imageAllData = '';
                        } else {
                            $("#leftMain1").hide();
                            $("#leftMain2").show();
                            $('#leftMainImg').attr('src', 'data:image/jpg;base64,' + imageAllData);
                            imageAllData = '';
                        }
                    }
                }
            }

        } else if (msgid == 126) {
            console.log('msgid', msgid, 'id length', dv.byteLength);
            begin += 1;
            var id = dv.getUint8(begin);
            begin += 4;
            var len = dv.byteLength - begin;
            var uid;
            if (infos['heartbeat']['id_uav_xyi'] == id && infos['heartbeat'] && infos['heartbeat']['base_mode'] == 5) {
                // uid = btoa(String.fromCharCode.apply(null, new Uint8Array(res.data, begin, len)));
                var pic = "";
                var arr = new Uint8Array(res.data, begin, len);
                for (var i = 0; i < arr.length; ++i) {
                    pic += String.fromCharCode(arr[i]);
                }
                pic = btoa(pic);
                $("#leftMain1").hide();
                $("#leftMain2").show();
                $('#leftMainImg').attr('src', 'data:image/jpg;base64,' + pic);
            } else {
                $("#leftMain1").show();
                $("#leftMain2").hide();
            }
        } else if (msgid == 128) {
            console.log('msgid', msgid, 'id length', dv.byteLength);
            begin += 1;
            if (infos['uavStop'] && infos['uavStop'] == true) {
                $('#image').modal('show');
            }
            $('#image').modal('show');
            /*var id = dv.getInt32(begin,LE);
             begin += 4;*/
            var id = dv.getUint8(begin);
            begin += 4;
            var len = dv.byteLength - begin;
            var uid;
            if (infos['heartbeat']['id_uav_xyi'] == id) {
                // uid = btoa(String.fromCharCode.apply(null, new Uint8Array(res.data, begin, len)));
                var pic = "";
                var arr = new Uint8Array(res.data, begin, len);
                for (var i = 0; i < arr.length; ++i) {
                    pic += String.fromCharCode(arr[i]);
                }
                pic = btoa(pic);
            }
            $('#imgZoom').attr('src', 'data:image/jpg;base64,' + pic);
        } else if (msgid == 247) {
            console.log('msgid', msgid);
            $('#system  .modal-body h3').text('抱歉，没有权限');
            $('#system').modal('show');
        } else if (msgid == 248) {
            console.log('msgid', msgid);
            //gps_raw解析
            begin += 1;
            var id = dv.getInt32(begin, LE);
            begin += 4;
            var result = dv.getUint8(begin);
            if (result == 1 || infos['heartbeat']['id_uav_xyi'] != id) {
                $('#system  .modal-body h3').text('控制获取失败');
                $('#system').modal('show');
            }
        } else if (msgid == 253) {
            console.log('msgid', msgid);
            //gps_raw解析
            begin += 1;
            var id = dv.getInt32(begin, LE);
            begin += 4;
            if (infos['heartbeat']['id_uav_xyi'] == id) {
                var len = dv.getUint16(begin, LE);
                var uid = String.fromCharCode.apply(null, new Uint8Array(res.data, begin + 2, len));
                //confirmAlert('用户'+uid+'申请控制当前飞行器！');
                $('#confirm').data('uid', uid).modal('show');
            }
        } else if (msgid == 250) {
            console.log('msgid', msgid);
            //gps_raw解析
            begin += 1;
            var id = dv.getInt32(begin, LE);
            begin += 4;
            if (infos['heartbeat']['id_uav_xyi'] == id) {
                var len = dv.getUint16(begin, LE);
                var token = String.fromCharCode.apply(null, new Uint8Array(res.data, begin + 2, len));
                infos['token'] = token;
                window.location.href = 'singlegoogle.html?id=' + id + '&t=' + encodeURI(token);
            }
        } else if (msgid == 254) {

            //console.log('msgid', msgid);
            //gps_raw解析
            begin += 1;
            var id = dv.getInt32(begin, LE);
            if (infos['heartbeat']['id_uav_xyi'] == id) {
                begin += 4;
                var type = dv.getUint8(begin);
                // console.info("254type is ", type);
                infos['flight-type'] = type;

                if (type == 1) {
                    $('#losttime').text('0');
                    $("#signalWS").removeClass("singnal-error");
                    $("#signal3G").removeClass("singnal-error");

                } else if (type == 2) {
                    if (infos['heartbeat'] && infos['heartbeat']['base_mode'] != 0) {
                        if (!timeOuts[timeOutsId]['ThirdTimeout']) {
                            if ($("#signal3G").hasClass("singnal-error") == false) {
                                timeOuts[timeOutsId]['ThirdTimeout'] = window.setTimeout(function () {
                                    $("#signal3G").addClass("singnal-error");
                                    window.clearTimeout(timeOuts[timeOutsId]['ThirdTimeout']);
                                    timeOuts[timeOutsId]['WSsetTimeout'] = null;
                                }, 5000);
                            }
                        }
                        if (timeOuts[timeOutsId]['ThirdTimeoutShow']) {
                            window.clearTimeout(timeOuts[timeOutsId]['ThirdTimeoutShow']);
                            timeOuts[timeOutsId]['ThirdTimeoutShow'] = null;
                            // console.log("清空上一次收到254  3G断开");
                        }
                        // console.log(!timeOuts[timeOutsId]['ThirdTimeoutShow']);
                        if (!timeOuts[timeOutsId]['ThirdTimeoutShow']) {
                            timeOuts[timeOutsId]['ThirdTimeoutShow'] = window.setTimeout(function () {
                                $("#signal3G").removeClass("singnal-error");
                                // console.log("最后一次收到254  3G断开");
                            }, 5000);
                        }
                    }


                } else if (type == 3) {
                    if (infos['heartbeat'] && infos['heartbeat']['base_mode'] != 0) {

                        if (!timeOuts[timeOutsId]['WSsetTimeout']) {
                            if ($("#signalWS").hasClass("singnal-error") == false) {
                                timeOuts[timeOutsId]['WSsetTimeout'] = window.setTimeout(function () {
                                    $("#signalWS").addClass("singnal-error");
                                    window.clearTimeout(timeOuts[timeOutsId]['WSsetTimeout']);
                                    timeOuts[timeOutsId]['WSsetTimeout'] = null;
                                }, 5000);
                            }
                        }
                        if (timeOuts[timeOutsId]['WSsetTimeoutShow']) {
                            window.clearTimeout(timeOuts[timeOutsId]['WSsetTimeoutShow']);
                            timeOuts[timeOutsId]['WSsetTimeoutShow'] = null;
                            // console.log("清空上一次收到254  WS断开");

                        }
                        // console.log(!timeOuts[timeOutsId]['WSsetTimeoutShow']);
                        if (!timeOuts[timeOutsId]['WSsetTimeoutShow']) {
                            timeOuts[timeOutsId]['WSsetTimeoutShow'] = window.setTimeout(function () {
                                $("#signalWS").removeClass("singnal-error");
                                // console.log(1)
                                // console.log("最后一次收到254  WS断开");
                            }, 5000);
                        }
                    }

                } else {
                    if (infos['time_step']) {
                        $('#losttime').text((new Date().getTime() / 1000).toFixed(0) - infos['time_step'].toFixed(0) - infos['last_date']);

                    }
                }
            }
        } else {
            console.error('Msgid=' + msgid + ' is not found!');
            console.error('Msg Length is ' + dv.byteLength);
        }
        /* 飞行距离已经从无人机返回，不需要进行计算了 */
        /*
         if((infos['heartbeat']['system_status'] == 3) || (infos['heartbeat']['system_status'] == 4) || (infos['heartbeat']['system_status'] == 5) || (infos['heartbeat']['system_status'] == 6)){
         $('#FlightLength').text(calcLength(old[0]-infos.local_position_ned.x, old[1]-infos.local_position_ned.y, old[2]-infos.local_position_ned.z));
         FilghtPoints.push(NAV_GPS);
         }else if((infos['heartbeat']['system_status'] == 0) || (infos['heartbeat']['system_status'] == 1)){
         $('#FlightLength').text('0');
         }*/
        //flight.setPosition({lng:,lat:})
    };
    ws.onclose = function () {
        console.log('websocket disconnected, prepare reconnect');
        ws = null;
        setTimeout(connect, 100);
    };
}

var confirmAlert = function (info) {
    $('#confirm .modal-body h3').text(info);
    $('#confirm').modal('show');
}
//common function
var uavStart = function () {
    if (infos.heartbeat && infos.heartbeat.base_mode && infos.heartbeat.base_mode == 52) {
        var length = 6 + 4 * 7;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        buffer.setUint8(0, 101);
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(2, 0);
        //开始起飞指令
        buffer.setUint16(3, 1, LE);
        //buffer.setUint16(3, 4, LE);
        buffer.setUint8(5, 1);
        for (var i = 0; i < 7; i++) {
            buffer.setFloat32(6 + 4 * i, 0, LE);
        }
        ws.send(buffer);
        if (window.location.search.split('?')[1]) {
            var tempinfos = window.location.search.split('?')[1];
            if (tempinfos.split('&').length == 2) {
                setLogInfor(formatDateTime(), '飞机起飞');
            }
        }
        console.info('flight start');
    }
}
//common control by hands
var handI = 0;
var uavCtrlByHands = function (el) {
    if (infos.heartbeat && infos.heartbeat.base_mode && infos.heartbeat.base_mode == 55) {
        $('#image').modal('show');
        var length = 6 + 4 * 7;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        buffer.setUint8(0, 101);
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(2, 0);
        //进入退出人工操控指令
        buffer.setUint16(3, 4, LE);
        buffer.setUint8(5, 0);
        var tempi = 0;
        if (el == 1) {
            if (ctrH == 0) {
                // alert(1);
                // var tempi = 0;
                buffer.setFloat32(6 + 4 * (tempi++), 1.0, LE);
                //enter
                //(——您已进入人工操控模式)";
                buffer.setFloat32(6 + 4 * (tempi++), -1, LE);
                buffer.setFloat32(6 + 4 * (tempi++), $("#imageX").val() * 1, LE);
                //pararm3对应X坐标
                buffer.setFloat32(6 + 4 * (tempi++), $("#imageY").val(), LE);
                buffer.setFloat32(6 + 4 * (tempi++), -1, LE);
                buffer.setFloat32(6 + 4 * (tempi++), $("#imageH").val(), LE);
                //pararm6对应高度坐标
                buffer.setFloat32(6 + 4 * (tempi++), 0, LE);
                console.info('click sent flight by hands');
                // alert(tempi);
                handI = 1;
                setLogInfor(formatDateTime(), '人工操控');

            } else {
                // var tempi = 0;
                // buffer.setFloat32(6 , 0, LE);//enter
                buffer.setFloat32(6 + 4 * (tempi++), -1.0, LE); //quit
                // (——您已退出人工操控模式)";
                buffer.setFloat32(6 + 4 * (tempi++), 1, LE);
                buffer.setFloat32(6 + 4 * (tempi++), $("#imageX").val() * 1, LE);
                //pararm3对应X坐标
                buffer.setFloat32(6 + 4 * (tempi++), $("#imageY").val(), LE);
                buffer.setFloat32(6 + 4 * (tempi++), 1, LE);
                buffer.setFloat32(6 + 4 * (tempi++), $("#imageH").val(), LE);
                //pararm6对应高度坐标
                buffer.setFloat32(6 + 4 * (tempi++), 0, LE);
                console.info('quit flight by hands');
                handI = 0;
                // alert(tempi);
            }

        }
        ws.send(buffer);
        console.info('click sent flight');
    }
    if (handI == 1) {
        $('#image').modal('show');
        var length = 6 + 4 * 7;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        buffer.setUint8(0, 101);
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(2, 0);
        //人工水平和人工高度操控指令
        buffer.setUint16(3, 4, LE);
        buffer.setUint8(5, 0);
        var tempi = 0;
        if (el == 2) {
            // alert(2);
            // var tempi = 0;
            buffer.setFloat32(6 + 4 * (tempi++), 1.0, LE);
            //enter
            buffer.setFloat32(6 + 4 * (tempi++), 1, LE);
            buffer.setFloat32(6 + 4 * (tempi++), $("#imageX").val() * 1, LE);
            //pararm3对应X坐标
            buffer.setFloat32(6 + 4 * (tempi++), $("#imageY").val(), LE);
            buffer.setFloat32(6 + 4 * (tempi++), -1, LE);
            buffer.setFloat32(6 + 4 * (tempi++), $("#imageH").val(), LE);
            //pararm6对应高度坐标
            buffer.setFloat32(6 + 4 * (tempi++), 0, LE);
            // ws.send(buffer);
            // alert(tempi);

            console.info('click sent horizontal value');
            setLogInfor(formatDateTime(), '水平人工操控');

        } else if (el == 3) {
            // alert(3);
            // var tempi = 0;
            buffer.setFloat32(6 + 4 * (tempi++), 1.0, LE);
            //enter
            buffer.setFloat32(6 + 4 * (tempi++), -1, LE);
            buffer.setFloat32(6 + 4 * (tempi++), $("#imageX").val() * 1, LE);
            //pararm3对应X坐标
            buffer.setFloat32(6 + 4 * (tempi++), $("#imageY").val(), LE);
            buffer.setFloat32(6 + 4 * (tempi++), 1, LE);
            buffer.setFloat32(6 + 4 * (tempi++), $("#imageH").val(), LE);
            //pararm6对应高度坐标
            buffer.setFloat32(6 + 4 * (tempi++), 0, LE);
            // ws.send(buffer);
            // alert(tempi);
            console.info('click sent vertical value');
            setLogInfor(formatDateTime(), '垂直人工操控');

        }
        ws.send(buffer);
        console.info('click sent flight');
    }

    if (window.location.search.split('?')[1]) {
        var tempinfos = window.location.search.split('?')[1];
        if (tempinfos.split('&').length == 2) {
            //设置飞机当地坐标偏移
            if (el == 'offsetset') {
                var length = 6 + 4 * 7;
                var ab = new ArrayBuffer(length);
                var buffer = new DataView(ab);
                buffer.setUint8(0, 101);
                buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
                buffer.setUint8(2, 0);
                //设置飞机当地坐标偏移指令
                buffer.setUint16(3, 7, LE);
                buffer.setUint8(5, 0);

                var tempi = 0;
                // buffer.setFloat32(6 + 4 * (tempi++), ($("#offset_long_deg").val() * 1.0).toFixed(6), LE);
                // buffer.setFloat32(6 + 4 * (tempi++), ($("#offset_lat_deg").val() * 1.0).toFixed(6), LE); 
                var offset_long_deg = $("#offset_long_deg").val() * 1e7;
                var offset_lat_deg = $("#offset_lat_deg").val() * 1e7;

                buffer.setInt32(6 + 4 * (tempi++), offset_long_deg, LE);
                // console.log('对比一下',offset_long_deg,buffer.getInt32(6 + 4 * (tempi--),LE));
                buffer.setInt32(6 + 4 * (tempi++), offset_lat_deg, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                console.log(offset_long_deg, offset_lat_deg);


                // float64位
                // buffer.setFloat64(6 + 8 * (tempi++),offset_long_deg , LE);
                // buffer.setFloat64(6 + 8 * (tempi++), offset_lat_deg, LE);
                // buffer.setInt32(6 + 24, 0, LE);


                ws.send(buffer);
                setLogInfor(formatDateTime(), '设置飞机当地坐标偏移');

                // var buffer = new ArrayBuffer(length);
                // buffer = new DataView(buffer);
                // testinfos = {};
                // testinfos['command_ack'] = {};

                // var testbegin = 0;
                // testinfos['command_ack']['testmsgid'] = buffer.getUint8(testbegin);
                // testbegin += 1;

                // testinfos['command_ack']['testfid'] = buffer.getUint8(testbegin);
                // testbegin += 1;

                // testinfos['command_ack']['testtarget_system'] = buffer.getUint8(testbegin);
                // testbegin += 1;

                // testinfos['command_ack']['testcommand'] = buffer.getUint16(testbegin, LE);
                // testbegin += 2;

                // testinfos['command_ack']['confirmation'] = buffer.getUint8(testbegin);
                // testbegin += 1;

                // testinfos['command_ack']['testp1'] = buffer.getInt32(testbegin, LE);
                // testbegin += 4;

                // testinfos['command_ack']['testp2'] = buffer.getInt32(testbegin, LE);
                // testbegin += 4;

                // testinfos['command_ack']['testp3'] = buffer.getInt32(testbegin, LE);
                // testbegin += 4;

                // testinfos['command_ack']['testp4'] = buffer.getInt32(testbegin, LE);
                // testbegin += 4;

                // testinfos['command_ack']['testp5'] = buffer.getInt32(testbegin, LE);
                // testbegin += 4;

                // testinfos['command_ack']['testp6'] = buffer.getInt32(testbegin, LE);
                // testbegin += 4;

                // testinfos['command_ack']['testp7'] = buffer.getInt32(testbegin, LE);
                // testbegin += 4;

                // console.log('testinfos["command_ack"] is ', testinfos['command_ack']);

                // console.info(offset_long_deg, offset_lat_deg);
                // console.info('click sent offsetSet');
            }

            //设置飞机应急着陆点
            if (el == 'emlandinfoset') {
                // var length = 6 + 4 * 7;
                var length = 6 + 4 * 8;
                var ab = new ArrayBuffer(length);
                var buffer = new DataView(ab);
                buffer.setUint8(0, 101);
                buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
                buffer.setUint8(2, 0);
                //设置飞机设置飞机应急着陆点指令
                buffer.setUint16(3, 8, LE);
                buffer.setUint8(5, 0);

                var tempi = 0;
                buffer.setInt32(6 + 4 * (tempi++), $("#route_vel").val() * 1e3, LE);
                buffer.setInt32(6 + 4 * (tempi++), $("#route_alt").val() * 1e3, LE);
                buffer.setInt32(6 + 4 * (tempi++), $("#em_1_long_deg").val() * 1e7, LE);
                buffer.setInt32(6 + 4 * (tempi++), $("#em_1_lat_deg").val() * 1e7, LE);
                buffer.setInt32(6 + 4 * (tempi++), $("#em_1_rep_h_m").val() * 1e3, LE);
                buffer.setInt32(6 + 4 * (tempi++), $("#em_2_long_deg").val() * 1e7, LE);
                buffer.setInt32(6 + 4 * (tempi++), $("#em_2_lat_deg").val() * 1e7, LE);
                buffer.setInt32(6 + 4 * (tempi++), $("#em_2_rep_h_m").val() * 1e3, LE);
                ws.send(buffer);
                console.info('click sent emlandinfoset');
                setLogInfor(formatDateTime(), '设置飞机应急着陆点');
            }

            //设置着落场相对高度差
            if (el == 'localgpsoffset') {
                var length = 6 + 4 * 7;
                var ab = new ArrayBuffer(length);
                var buffer = new DataView(ab);
                buffer.setUint8(0, 101);
                buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
                buffer.setUint8(2, 0);
                //设置着落场相对高度差指令
                buffer.setUint16(3, 9, LE);
                buffer.setUint8(5, 0);

                var tempi = 0;
                buffer.setInt32(6 + 4 * (tempi++), $("#height_diff_landing_m").val() * 1e3, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                buffer.setInt32(6 + 4 * (tempi++), 0, LE);
                ws.send(buffer);
                console.info('click sent localgpsoffset');
                setLogInfor(formatDateTime(), '设置着落场相对高度差');

            }
        } else {
            alert("error")
        }
    } else {
        alert("error");
    }


}
var uavStop = function () {
    if (infos.heartbeat.base_mode && infos.heartbeat.base_mode == 5) {
        infos['uavStop'] = true;
        var length = 6 + 4 * 7;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        buffer.setUint8(0, 101);
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(2, 0);
        //应急着陆指令
        buffer.setUint16(3, 2, LE);
        buffer.setUint8(5, 1);
        for (var i = 0; i < 7; i++) {
            buffer.setFloat32(6 + 4 * i, 0, LE);
        }
        ws.send(buffer);
        console.info('flight stop');
        if (window.location.search.split('?')[1]) {
            var tempinfos = window.location.search.split('?')[1];
            if (tempinfos.split('&').length == 2) {
                setLogInfor(formatDateTime(), '应急着陆');
            }
        }
    }
}
$('#pid').on('show.bs.modal', function () {
    if (infos.heartbeat.base_mode && infos.heartbeat.base_mode == 1) {
        $(this).find('input').val('');
        $(this).find('.ok').show();
    } else {
        $(this).find('.ok').hide();
        $('#pid').modal('hide');
    }
});
$('#pid .ok').on('click', function () {
    var inputs = $('#pid').find('input');
    uavCMDPId(inputs[0].value, inputs[1].value, inputs[2].value, inputs[3].value, inputs[4].value, inputs[5].value, inputs[6].value);
});
var uavCMDPId = function (p1, p2, p3, p4, p5, p6, p7) {
    if (infos.heartbeat.base_mode && infos.heartbeat.base_mode == 1) {
        var length = 6 + 4 * 7;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        buffer.setUint8(0, 101);
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(2, 0);
        buffer.setUint16(3, 3, LE);
        buffer.setUint8(5, infos.heartbeat.system_status);
        var i = 0;
        if (p1) {
            buffer.setFloat32(6 + 4 * i, parseFloat(p1), LE);
        } else {
            buffer.setFloat32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p2) {
            buffer.setFloat32(6 + 4 * i, parseFloat(p2), LE);
        } else {
            buffer.setFloat32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p3) {
            buffer.setFloat32(6 + 4 * i, parseFloat(p3), LE);
        } else {
            buffer.setFloat32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p4) {
            buffer.setFloat32(6 + 4 * i, parseFloat(p4), LE);
        } else {
            buffer.setFloat32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p5) {
            buffer.setFloat32(6 + 4 * i, parseFloat(p5), LE);
        } else {
            buffer.setFloat32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p6) {
            buffer.setFloat32(6 + 4 * i, parseFloat(p6), LE);
        } else {
            buffer.setFloat32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p7) {
            buffer.setFloat32(6 + 4 * i, parseFloat(p7), LE);
        } else {
            buffer.setFloat32(6 + 4 * i, 0, LE);
        }
        i++;
        ws.send(buffer);
        console.info('flight PID');
        setLogInfor(formatDateTime(), '调控参数注入');
    } else {
        alert('注入未成功，请重试');
    }
}

// int32位
$('#confirmXPCtr').on('click', function () {
    var inputs = $('#XPPid').find('input');
    uavCMDPId2(inputs[0].value, inputs[1].value, inputs[2].value, inputs[3].value, inputs[4].value, inputs[5].value, inputs[6].value);
});

// $('#XPPid button').on('click', function(){
//     if (infos.heartbeat.base_mode && infos.heartbeat.base_mode == 1) {
//         $("XPPid").find('input').val('');
//         // $("XPPid").find('.ok').show();
//     } else {
//         $("XPPid").find('.ok').hide();
//         $('#pid').modal('hide');
//     }
// })
// $('#XPPid').on('show.bs.modal', function () {
//     if (infos.heartbeat.base_mode && infos.heartbeat.base_mode == 1) {
//         $(this).find('input').val('');
//         $(this).find('#confirmXPCtr').show();
//     } else {
//         $(this).find('#confirmXPCtr').hide();
//         $('#XPPid').modal('hide');
//     }
// });
var uavCMDPId2 = function (p1, p2, p3, p4, p5, p6, p7) {
    if (infos.heartbeat.base_mode && infos.heartbeat.base_mode >= 1) {
        var length = 6 + 4 * 7;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        buffer.setUint8(0, 101);
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(2, 0);
        buffer.setUint16(3, 10, LE);
        buffer.setUint8(5, infos.heartbeat.system_status);
        var i = 0;
        if (p1) {
            buffer.setInt32(6 + 4 * i, p1, LE);
        } else {
            buffer.setInt32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p2) {
            buffer.setInt32(6 + 4 * i, p2, LE);
        } else {
            buffer.setInt32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p3) {
            buffer.setInt32(6 + 4 * i, p3, LE);
        } else {
            buffer.setInt32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p4) {
            buffer.setInt32(6 + 4 * i, p4, LE);
        } else {
            buffer.setInt32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p5) {
            buffer.setInt32(6 + 4 * i, p5, LE);
        } else {
            buffer.setInt32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p6) {
            buffer.setInt32(6 + 4 * i, p6, LE);
        } else {
            buffer.setInt32(6 + 4 * i, 0.0, LE);
        }
        i++;
        if (p7) {
            buffer.setInt32(6 + 4 * i, p7, LE);
        } else {
            buffer.setInt32(6 + 4 * i, 0, LE);
        }
        i++;
        ws.send(buffer);
        console.info('flight XPPID');
        setLogInfor(formatDateTime(), 'XP调控参数注入');
    } else {
        alert('XP调参注入未成功，请重试');
    }
}
var uavCMDMaunCtrl = function (state, x, y, z) {
    if (infos.heartbeat.base_mode && infos.heartbeat.base_mode == 5) {
        var length = 6 + 4 * 7;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        buffer.setUint8(0, 101);
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(2, 0);
        //应急着陆指令
        buffer.setUint16(3, 4, LE);
        buffer.setUint8(5, 1);
        var i = 0;
        buffer.setFloat32(6 + 4 * i++, state, LE);
        buffer.setFloat32(6 + 4 * i++, parseFloat(x), LE);
        buffer.setFloat32(6 + 4 * i++, parseFloat(y), LE);
        buffer.setFloat32(6 + 4 * i++, parseFloat(z), LE);
        for (var j = i;
             (j < 7); j++) {
            buffer.setFloat32(6 + 4 * j, 0, LE);
        }
        ws.send(buffer);
        console.info('uavCMDMaunCtrl');
    }
}
var calcLength = function (x, y, z) {
    length += (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)));
    return length.toFixed(2);
}
var setValue = function (id1, id2, value, needTrueValue, trueValue) {

    if (trueValue && needTrueValue && needTrueValue == true) {
        $(document.getElementById(id1 + "." + id2)).text(value).attr('data-value', trueValue);
    } else {
        $(document.getElementById(id1 + "." + id2)).text(value);
    }
}
var setValueFromInfos = function (id1, id2, value, needTrueValue) {

    if (needTrueValue && needTrueValue == true) {
        $(document.getElementById(id1 + "." + id2)).text(value).attr('data-value', infos[id1][id2]);
    } else {
        $(document.getElementById(id1 + "." + id2)).text(infos[id1][id2]);
    }
}
var direction = function (vn, ve) {
    var result = '0deg';
    if (vn == 0 && ve == 0) {
        return result;
    }
    var vne = Math.sqrt(Math.pow(vn, 2) + Math.pow(ve, 2));
    if (ve > 0) {
        if (vn < 0) {
            result = 180 - Math.asin(ve / vne) * 180 / Math.PI;
        } else {
            result = Math.asin(ve / vne) * 180 / Math.PI;
        }
    } else {
        if (vn < 0) {
            result = -Math.asin(ve / vne) * 180 / Math.PI - 180;
        } else {
            result = Math.asin(ve / vne) * 180 / Math.PI;
        }
    }
    return result + 'deg';
}
var clickLnglat = [];

/* 添加点 */
var addFlightPoint = function () {
    $('.single-right-up-sub').removeClass('select');

    // console.log("火星坐标转wgs84前 clickPointLatLng is ", clickPointLatLng.lng(), clickPointLatLng.lat());
    var curcoordpoint = coordTransform(clickPointLatLng.lng(), clickPointLatLng.lat(), 1);
    // console.log("火星坐标转wgs84后 gcj02towgs84 is ", curcoordpoint);

    var outside = $('<div class="single-right-up-sub select"></div>'),
        upInsert = $('<span class="sanjiao glyphicon glyphicon-plus-sign" title="插入航点" onclick="flightPointOperate(this,\'insertpoint\')">&nbsp;</span>'),
        upDel = $('<span class="sanjiao glyphicon glyphicon-remove-circle" title="删除航点" onclick="flightPointOperate(this,\'delete\')">&nbsp;</span>'),
        upInfo = $('<div class="single-right-up-block" onclick="flightPointClick(this)"></div>'),
        upInfoNumber = $('<span class="number">' + (Local_count - 1) + '</span>'),
        upInfoTitle = $('<span class="infos">航点</span>'),
        // downinfo = $('<div class="single-right-up-hidden"><table><tbody><tr><td class="info">经度 :</td><td class="input"><input name="lon" onkeyup="enterLonLatValues(this)" type="text" style="width: 90%;" value="' + clickPointLatLng.lng().toFixed(6) + '"/></td></tr><tr><td class="info">纬度 :</td><td class="input"><input name="lat" onkeyup="enterLonLatValues(this)" style="width: 90%;" value="' + clickPointLatLng.lat().toFixed(6) + '" type="text"/></td></tr><tr><td class="info">速度 :</td><td class="input"><input name="speed" type="text" value="2.0"/><span>m/s</span></td></tr><tr><td class="info">高度 :</td><td class="input"><input name="altitude" value="25.0" type="text"/><span>m</span></td></tr></tbody></table></div>')
        downinfo = $('<div class="single-right-up-hidden"><table><tbody><tr><td class="info">经度 :</td><td class="input"><input name="lon" onkeyup="enterLonLatValues(this)" type="text" style="width: 90%;" value="' + curcoordpoint[0].toFixed(6) + '"/></td></tr><tr><td class="info">纬度 :</td><td class="input"><input name="lat" onkeyup="enterLonLatValues(this)" style="width: 90%;" value="' + curcoordpoint[1].toFixed(6) + '" type="text"/></td></tr><tr><td class="info">速度 :</td><td class="input"><input name="speed" type="text" value="2.0"/><span>m/s</span></td></tr><tr><td class="info">高度 :</td><td class="input"><input name="altitude" value="25.0" type="text"/><span>m</span></td></tr></tbody></table></div>')
    $('.single-right-up').append(outside.append(upInsert).append(upDel).append(upInfo.prepend(upInfoTitle).prepend(upInfoNumber)).append(downinfo));
}
/* 输入航点经纬度，修改marker在地图上的位置 */
var enterLonLatValues = function (eve) {
    var sub = $(eve).parents('.single-right-up-sub');
    var count = sub.find('.number:first').text();
    var modifyPoint = marklist[count];

    console.log("火星坐标转wgs84前 右侧输入框经纬度修改 is ", sub.find('input')[0].value, '   ', sub.find('input')[1].value);
    var curcoordpoint = coordTransform(sub.find('input')[0].value * 1, sub.find('input')[1].value * 1, 2);

    var lnglat = {
        lng: curcoordpoint[0] * 1,
        lat: curcoordpoint[1] * 1
    };
    console.log("火星坐标转wgs84后 右侧输入框经纬度修改 is ", lnglat.lng, '  ', lnglat.lat);
    modifyPoint.setPosition(lnglat);
    lineArr[count] = lnglat;
    polyLine.setPath(lineArr);
}

// 插入、删除航点
var flightPointOperate = function (eve, name) {
    var paretObj = $('.single-right-up-sub');
    var sub = $(eve).parents(".single-right-up-sub");
    // alert('现在开始插入航点');
    if (name == "insertpoint") {
        if (sub.nextAll('.single-right-up-sub').length == 0) {
            alert('最后一个航点无法插入，请手动添加！');
        } else {
            var nextPoint = sub.next(".single-right-up-sub");

            var insertNum = sub.find(".number").text() * 1 + 1;

            var nextAllPoint = sub.nextAll(".single-right-up-sub");
            for (var i = 0; i < nextAllPoint.length; i++) {
                var curNum = nextAllPoint.eq('' + i).find(".number").text() * 1 + 1;
                // console.log(curNum);
                nextAllPoint.eq('' + i).find(".number").text(curNum);
            }
            var insertLon = ((nextPoint.find("input[name=lon]").val() * 1 + sub.find("input[name=lon]").val() * 1) / 2).toFixed(7);
            var insertLat = ((nextPoint.find("input[name=lat]").val() * 1 + sub.find("input[name=lat]").val() * 1) / 2).toFixed(7);
            var insertSpeed = ((nextPoint.find("input[name=speed]").val() * 1 + sub.find("input[name=speed]").val() * 1) / 2).toFixed(1);
            var insertAltitude = (sub.find("input[name=altitude]").val() * 1).toFixed(1);

            var insertPoint = '<div class="single-right-up-sub"><span class="sanjiao glyphicon glyphicon-plus-sign" title="插入航点" onclick="flightPointOperate(this,\'insertpoint\')">&nbsp;</span><span class="sanjiao glyphicon glyphicon-remove-circle" title="删除航点" onclick="flightPointOperate(this,\'delete\')">&nbsp;</span><div class="single-right-up-block" onclick="flightPointClick(this)"><span class="number">' + insertNum + '</span><span class="infos">航点</span></div><div class="single-right-up-hidden"><table><tbody><tr><td class="info">经度 :</td><td class="input"><input name="lon" onkeyup="enterLonLatValues(this)" type="text" style="width: 90%;" value="' + insertLon + '"></td></tr><tr><td class="info">纬度 :</td><td class="input"><input name="lat" onkeyup="enterLonLatValues(this)" style="width: 90%;" value="' + insertLat + '" type="text"></td></tr><tr><td class="info">速度 :</td><td class="input"><input name="speed" type="text" value="' + insertSpeed + '"><span>m/s</span></td></tr><tr><td class="info">高度 :</td><td class="input"><input name="altitude" value="' + insertAltitude + '" type="text"><span>m</span></td></tr></tbody></table></div></div>';

            sub.after(insertPoint);
        }

    } else if (name == "delete") {
        if (confirm('确认删除该航点？')) {
            sub.remove();
        }
    }
    var curPoints = $('.single-right-up-sub');
    var savecounts = curPoints.length;
    var points = [];
    for (var i = 0; i < savecounts; i++) {
        var savepoints = {
            lat: '',
            lon: '',
            alt: '',
            v: '',
        };
        var inputs = curPoints.eq(i).find('input');
        savepoints.lat = inputs[1].value * 1;
        savepoints.lon = inputs[0].value * 1;
        savepoints.alt = inputs[3].value * 1;
        savepoints.v = inputs[2].value * 1;

        points.push(savepoints);
    }
    console.log("counts is ", savecounts);
    console.log("points is", points);
    // points = JSON.stringify(points);

    drawSearchPoint(true, savecounts, points);

}
var pointsOpration = function () {
    var curPoints = $('.single-right-up-sub');
    var savecounts = curPoints.length;
    var points = [];
    for (var i = 0; i < savecounts; i++) {
        var savepoints = {
            lat: '',
            lon: '',
            alt: '',
            v: '',
        };
        var inputs = curPoints.eq(i).find('input');
        savepoints.lat = inputs[1].value * 1;
        savepoints.lon = inputs[0].value * 1;
        savepoints.alt = inputs[3].value * 1;
        savepoints.v = inputs[2].value * 1;

        points.push(savepoints);
    }
    console.log("counts is ", savecounts);
    console.log("points is", points);
    // points = JSON.stringify(points);

    drawSearchPoint(true, savecounts, points);
}


/* 删除航点(old) */

var flightPointDelete = function (eve) {
    if (confirm('确认删除该航点？')) {
        var sub = $(eve).parents('.single-right-up-sub');
        var count = sub.find('.number:first').text();
        lineArr.splice(count, 1);
        polyLine.setPath(lineArr);
        marklist[count].setMap(null);
        var flightPointNoList = $('.single-right-up-block>.number');
        var i = count * 1 + 1;
        while (i < marklist.length) {
            marklist[i].setTitle((i - 1).toString());
            marklist[i].setLabel({
                color: '#ffffff',
                text: (i - 1).toString()
            });
            if (flightPointNoList[i]) {
                flightPointNoList[i].innerText = i - 1;
            }
            i++;
        }
        if (marker) {
            Local_count -= 1;
        } else {
            Local_count -= 1;
        }
        marklist.splice(count, 1);
        sub.remove();
    }
}
// 清空航点
var flightPointDeleteAll = function () {
    // if (window.location.search.split('?')[1]) {
    //     var tempinfos = window.location.search.split('?')[1];
    //     if (tempinfos.split('&').length == 2) {

            $(".single-right-up-sub:not(:first)").remove();
            // console.log("航点数", $(".single-right-up-sub").length);
            // console.log("curpoint is ", infos.mission_ack_2.point[0].lon);
            // console.log("curpoint is ", infos.mission_ack_2.point[0]);
            // var points = $('.single-right-up-sub');
            var newpoints = infos.mission_ack_2.point[0];
            console.log("curpoint is ", newpoints);

            polyLine.setPath([]);
            drawSearchPoint(true, 1, newpoints);
            setLogInfor(formatDateTime(), '清空本地航点');
    //     } else {
    //         alert("没有权限，无法清除！");
    //     }
    // }

}

$('#addStartEndPoint').on('click', function () {
    var outside = $('<div class="single-right-up-sub select"></div>'),
        upInfo = $('<div class="single-right-up-block" onclick="flightPointClick(this)"><span class="sanjiao glyphicon glyphicon-remove-circle" title="删除航点">&nbsp;</span></div>'),
        upInfoNumber = $('<span class="number">' + +'</span>'),
        upInfoTitleStart = $('<span class="infos">起飞点</span>'),
        upInfoTitleEnd = $('<span class="infos">着陆点</span>'),
        downinfo = $('<div class="single-right-up-hidden"><table><tbody><tr><td>速度 :</td><td><input name="speed" type="text" value="2.0"/><span>m/s</span></td></tr><tr><td>高度 :</td><td><input name="altitude" value="25.0" type="text"/><span style="float: right;">meters</span></td></tr></tbody></table></div>');
    $('.single-right-up').append(outside.append(upInfo.prepend(upInfoTitleStart).prepend(upInfoNumber)).append(downinfo));
    $('.single-right-up').append(outside.append(upInfo.prepend(upInfoTitleEnd).prepend(upInfoNumber)).append(downinfo));
});

//页面控件事件
$('#addFlightLine').on('click', function () {
    if ($(document.getElementById('heartbeat.base_mode')).eq(0).attr('data-value') == 1) {
        var points = $('.single-right-up-sub');
        var length = 6 + 16 * points.length;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        var result = '';
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(0, 105);
        buffer.setUint8(2, 0);
        buffer.setUint16(3, points.length, LE);
        buffer.setUint8(5, 1);
        result += buffer.getUint8(0) + ',';
        result += buffer.getUint8(1) + ',';
        result += buffer.getUint8(2) + ',';
        result += buffer.getUint16(3, LE) + ',';
        result += buffer.getUint8(5) + ',';
        var bc = 6;
        for (var i = 0; i < points.length; i++) {
            var inputs = points.eq(i).find('input');
            console.info(inputs[1].value);
            console.info(inputs[0].value);
            console.info(inputs[3].value);
            console.info(inputs[2].value);
            buffer.setInt32(bc + 16 * i, inputs[1].value * 1e7, LE);
            result += buffer.getInt32(bc + 16 * i, LE) + ',';

            buffer.setInt32(bc + 16 * i + 4, inputs[0].value * 1e7, LE);
            result += buffer.getInt32(bc + 16 * i + 4, LE) + ',';

            buffer.setInt32(bc + 16 * i + 8, inputs[3].value * 1e3, LE);
            result += buffer.getInt32(bc + 16 * i + 8, LE) + ',';

            buffer.setInt32(bc + 16 * i + 12, inputs[2].value * 1e3, LE);
            result += buffer.getInt32(bc + 16 * i + 12, LE) + ',';
        }
        ws.send(buffer);
        console.info('sent ' + result);
        if (window.location.search.split('?')[1]) {
            var tempinfos = window.location.search.split('?')[1];
            if (tempinfos.split('&').length == 2) {
                setLogInfor(formatDateTime(), '航路注入');
            }
        }

    }
});
var drapExpFlightMarker = function () {
    var id = 0,
        position = {
            lng: NAV_GPS[0],
            lat: NAV_GPS[1]
        },
        bettery = 100,
        weight = 50;
    var myLatlng = new google.maps.LatLng(NAV_GPS[1], NAV_GPS[0]);

    // $('#start input[name=lon]').val(infos['gps_raw']['lon_gps']);
    // $('#start input[name=lat]').val(infos['gps_raw']['lat_gps']);
    if (infos.heartbeat && infos.heartbeat.id_uav_xyi) {
        id = infos.heartbeat.id_uav_xyi;
    }
    if (infos.gps_raw && infos['gps_raw']['lon_gps'] && infos['gps_raw']['lat_gps']) {
        position = {
            lng: infos['gps_raw']['lon_gps'],
            lat: infos['gps_raw']['lat_gps']
        }
        if (flight) {
            var myLatlng = new google.maps.LatLng(flight[id].gps_raw.lat_gps, flight[id].gps_raw.lon_gps);
        }
    }
    // console.log("position is", position);
    var singletitle = '电池' + bettery + '%,载重' + weight + '%';
    if (flight) {
        deg = flight[id].global_position_int.hdg;
    } else {
        deg = 0;
    }
    flight = new CustomMarker(
        myLatlng,
        map, {
            marker_id: '123',
            id: id,
            title: singletitle,
            deg: deg
        }
    );
    // map.setCenter(lineArr[0]);
    console.info("lineArr[0] is", lineArr[0]);
}
$('#satellite').on('click', function () {
    if ($(this).attr('data-satellite')) {
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        $(this).removeAttr('data-satellite');
    } else {
        map.setMapTypeId(google.maps.MapTypeId.HYBRID);
        $(this).attr('data-satellite', true);
    }
    setLogInfor(formatDateTime(), '切换实景');
});

$('#searchFlightPoint').on('click', function () {
    /* 搜索航点的状态是不是应该是在上线状态呢？ */
    if ($(document.getElementById('heartbeat.base_mode')).eq(0).attr('data-value') * 1 > 1) {
        var length = 5;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        var result = '';
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(0, 107);
        buffer.setUint8(2, 0);
        buffer.setUint8(3, 2);
        result += buffer.getUint8(0) + ',';
        result += buffer.getUint8(1) + ',';
        result += buffer.getUint8(2) + ',';
        result += buffer.getUint8(3) + ',';
        ws.send(buffer);
        console.info('sent SearchStartResult is :' + result);
        setLogInfor(formatDateTime(), '查询航路');
        if (window.location.search.split('?')[1]) {
            var tempinfos = window.location.search.split('?')[1];
            if (tempinfos.split('&').length == 2) {
                redrawFlight = 1;
                polyLine = new google.maps.Polyline({
                    map: map,
                    path: lineArr,
                    strokeColor: common.colors.FlightLine,
                    strokeOpacity: 1,
                    strokeWeight: 3,
                    strokeStyle: "solid"
                });
                // alert(redrawFlight);
            }
        }
    }
});
var drawSearchPoint = function (draggable, curcount, curpoint) {
    if (!curcount && !curpoint) {
        var counts = infos.mission_ack_2.count;
        var points = infos.mission_ack_2.point;
        console.log('默认108返回航路点');
    } else {
        var counts = curcount;
        var points = curpoint;
        console.log('航路点传值', '航路点传值 counts', counts, ' 航路点传值 points', points);
    }
    // console.info("加载的counts is", counts);
    // console.info("加载的points is", points);
    var inputs = $('.single-right-up-sub').eq(0).find('input');

    Local_count = 1;
    lineArr = [];
    if (counts == 1) {
        if (infos.gps_raw && infos.gps_raw.lon_gps && infos.gps_raw.lat_gps) {
            NAV_GPS[0] = infos.gps_raw.lon_gps;
            NAV_GPS[1] = infos.gps_raw.lat_gps;
            inputs[0].value = infos.gps_raw.lon_gps;
            inputs[1].value = infos.gps_raw.lat_gps;

            // inputs[0].value = curcoordpoint[0];
            // inputs[1].value = curcoordpoint[1];
            console.log('infos.gps_raw ', infos.gps_raw);
        }
        lineArr.push({
            lng: NAV_GPS[0],
            lat: NAV_GPS[1]
        });


        console.log(lineArr);
    }

    for (var mk in marklist) {
        if (marklist[mk]) {
            marklist[mk].setMap(null);
        }
    }
    marklist = [];
    marklist[0] = null;
    if (counts > 1) {
        $('.single-right-up').empty();
    }
    // for (var i = 0; i < counts; i++) {
    for (var i = 0; i < counts; i++) {
        console.log("points", points);
        var lnglat = {
            lng: points[i].lon,
            lat: points[i].lat
        };
        // var lnglat;
        if (i == 0) {
            if (infos.gps_raw && infos.gps_raw.lon_gps && infos.gps_raw.lat_gps) {
                inputs[0].value = infos.gps_raw.lon_gps;
                inputs[1].value = infos.gps_raw.lat_gps;

                points[i].lon = infos.gps_raw.lon_gps;
                points[i].lat = infos.gps_raw.lat_gps;


                console.log('points[0] is ', points[0]);

                // var curcoordpoint =coordTransform(points[i].lon,points[i].lat,2);
                //
                // points[i].lon = curcoordpoint[0];
                // points[i].lat = curcoordpoint[1];

                lnglat = {
                    lng: points[i].lon,
                    lat: points[i].lat
                }
            }
        }

        console.log("wgs84转火星坐标转前 is ", points[i].lon, points[i].lat);
        var curcoordpoint = coordTransform(points[i].lon, points[i].lat, 2);
        // points[i].lon = curcoordpoint[0];
        // points[i].lat = curcoordpoint[1];

        lnglat = {
            lng: curcoordpoint[0],
            lat: curcoordpoint[1]
        }
        console.log("lnglat is ", lnglat.lng, '   ', lnglat.lat);
        console.log("wgs84转火星坐标转后 is ", curcoordpoint);

        console.log(lnglat);
        lineArr.push(lnglat);

        if (i > 0) {
            var mk = new google.maps.Marker({
                map: map,
                draggable: true,
                position: lnglat,
                title: (i).toString(),
                icon: {
                    size: new google.maps.Size(22, 34),
                    anchor: new google.maps.Point(10, 32),
                    origin: new google.maps.Point(((i - 1) % 10) * 21, Math.floor((i - 1) / 10) * 35),
                    scaledSize: new google.maps.Size(212, 350),
                    url: '../images/markers.png'
                }
            });

            if (draggable && draggable == true) {
                console.log('draggable', draggable);
                mk.addListener('drag', function (e) {
                    var num = this.title * 1;
                    console.log(num, lineArr.length);
                    if (num <= lineArr.length) {
                        // if($('.single-right-up-sub').eq(num).length > 0){
                        lineArr[num] = e.latLng;
                        polyLine.setPath(lineArr);
                        var inputs = $('.single-right-up-sub').eq(num).find('input');

                        console.log("火星坐标转wgs84前 clickPointLatLng is ", clickPointLatLng.lng(), clickPointLatLng.lat());
                        var curcoordpoint = coordTransform(clickPointLatLng.lng(), clickPointLatLng.lat(), 1);
                        console.log("火星坐标转wgs84后 gcj02towgs84 is ", curcoordpoint);

                        inputs[0].value = curcoordpoint[0];
                        inputs[1].value = curcoordpoint[1];
                        // inputs[0].value = e.latLng.lng();
                        // inputs[1].value = e.latLng.lat();
                        // }
                    }
                });
            }
            marklist.push(mk);
            // console.log("marklist",marklist);
        }

        $('.single-right-up-sub').removeClass('select');

        var outside = $('<div class="single-right-up-sub select"></div>'),
            upInsert = $('<span class="sanjiao glyphicon glyphicon-plus-sign" title="插入航点" onclick="flightPointOperate(this,\'insertpoint\')">&nbsp;</span>'),
            upDel = $('<span class="sanjiao glyphicon glyphicon-remove-circle" title="删除航点" onclick="flightPointOperate(this,\'delete\')">&nbsp;</span>'),
            upInfo = $('<div class="single-right-up-block" onclick="flightPointClick(this)"></div>'),
            upInfoNumber = $('<span class="number">' + i + '</span>'),
            upInfoTitle = $('<span class="infos">航点</span>'),
            downinfo = $('<div class="single-right-up-hidden"><table><tbody><tr><td class="info">经度 :</td><td class="input"><input name="lon" onkeyup="enterLonLatValues(this)" type="text" style="width: 90%;" value="' + points[i].lon.toFixed(6) + '"/></td></tr><tr><td class="info">纬度 :</td><td class="input"><input name="lat" onkeyup="enterLonLatValues(this)" style="width: 90%;" value="' + points[i].lat.toFixed(6) + '" type="text"/></td></tr><tr><td class="info">速度 :</td><td class="input"><input name="speed" type="text" value="' + (points[i].v * 1).toFixed(1) + '"/><span>m/s</span></td></tr><tr><td class="info">高度 :</td><td class="input"><input name="altitude" value="' + (points[i].alt * 1).toFixed(1) + '" type="text"/><span>m</span></td></tr></tbody></table></div>')
        $('.single-right-up').append(outside.append(upInsert).append(upDel).append(upInfo.prepend(upInfoTitle).prepend(upInfoNumber)).append(downinfo));
    }
    if (flight) {
        flight.setPosition(lineArr[0]);
    }
    if (!curcount && !curpoint && infos['heartbeat'] && infos['heartbeat']['base_mode'] <= 1) {
        lineArr[0] = lineArr[1];
    }
    // 第一个航点不能删除
    $('.single-right-up-sub').eq(0).find(".glyphicon-remove-circle").remove();


    Local_count = counts;
    polyLine.setPath(lineArr);
}
$('#searchFlightEnd').on('click', function () {
    /* 搜索应急着陆点，应该是什么状态呢？ */
    if ($(document.getElementById('heartbeat.base_mode')).eq(0).attr('data-value') * 1 > 1) {
        var length = 4;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        var result = '';
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(0, 107);
        buffer.setUint8(2, 0);
        buffer.setUint8(3, 3);
        result += buffer.getUint8(0) + ',';
        result += buffer.getUint8(1) + ',';
        result += buffer.getUint8(2) + ',';
        result += buffer.getUint8(3) + ',';
        ws.send(buffer);
        console.info('sent SearchEndResult is :' + result);
        if (window.location.search.split('?')[1]) {
            var tempinfos = window.location.search.split('?')[1];
            if (tempinfos.split('&').length == 2) {
                setLogInfor(formatDateTime(), '查询应急着陆点');
            }
        }
    }
});
var locationFlight = function () {
    console.log(infos['gps_raw']);
    if (infos['heartbeat'] && infos['gps_raw']) {

        console.log("飞机图标定位 火星坐标转wgs84前 clickPointLatLng is ", infos['gps_raw']['lon_gps'], infos['gps_raw']['lat_gps']);
        var curcoord_flightgps = coordTransform(infos['gps_raw']['lon_gps'], infos['gps_raw']['lat_gps'], 2);
        console.log("飞机图标定位 火星坐标转wgs84后 gcj02towgs84 is ", curcoord_flightgps);

        var cur_position = {
            lng: curcoord_flightgps[0],
            lat: curcoord_flightgps[1]
        }
        // var cur_position = {
        //     lng: infos['gps_raw']['lon_gps'],
        //     lat: infos['gps_raw']['lat_gps']
        // }
        map.setCenter(cur_position);
        setLogInfor(formatDateTime(), '飞机定位');
    }
}

var drawSearchEnd = function () {
    var counts = infos.mission_ack_3.count;
    var points = infos.mission_ack_3.point;
    var result = [];
    for (var t in points) {
        console.log("wgs84 转火星坐标前 ", points[t].lon, points[t].lat);
        var curcoordpoint = coordTransform(points[t].lon, points[t].lat, 2);
        console.log("wgs84 转火星坐标后 ", curcoordpoint[0], curcoordpoint[1]);

        new google.maps.Marker({
            map: map,
            position: {
                lng: points[t].lon,
                lat: points[t].lat
            },
            label: {
                color: '#ffffff',
                fontSize: '10px',
                text: t.toString()
            },
            icon: '../images/mark_bs_red.png'
        });
    }
}
var changeCtlIcons = function (params) {
    var param2 = params.toString(2);
    // console.log('param2 is ',param2);
    var length = param2.length;
    for (var i = param2.length - 1; i >= 0; i--) {
        var type = control_icons.ids[length - 1 - i];

        $('#' + type).attr('src', '../images/ctrlogo/' + control_icons.status[param2[i]] + control_icons.icons[type])
        // console.log('param2[i] is',param2[i]);
        // console.log('type is ', type);
        // console.log('control_icons.status  is ', control_icons.status[param2[i]]);

        // }
        // if (param2[i] == "1") {
        //     var type = control_icons.ids[length - 1 - i];
        //     console.log('param2[i] is',param2[i]);
        //     console.log('type is ', type);
        //     $('#' + type).attr('src', '../images/ctrlogo/' + control_icons.status[param2[i]] + control_icons.icons[type])
        // } else{
        //     var type = control_icons.ids[length - 1 - i];
        //     console.log('param2[i] is',param2[i]);
        //     console.log('type is ', type);
        //     $('#' + type).attr('src', '../images/ctrlogo/' + control_icons.status[param2[i]] + control_icons.icons[type])
        // }
    }
};
var realTimeData = function () {
    if (document.getElementById('heartbeat.id_uav_xyi').innerText) {
        window.location.href = 'realtimedata.html?' + document.getElementById('heartbeat.id_uav_xyi').innerText;
    } else {
        window.location.href = 'realtimedata.html?' + 1;
    }
};
var backToMain = function () {
    window.location.href = 'maingoogle.html';
}
var canvasDraw = function (vn, ve, beforevn, beforeve) {
    var canvas = document.getElementById('center-left-canvas');
    var width = canvas.width;
    var height = canvas.height;
    var context = canvas.getContext("2d");
    var result;
    var commonParam = 0.12;
    var rotateX = 'rotateX(65deg)',
        rotateZ = 'rotateZ(90deg)';
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#01A752";
    context.lineWidth = 1;
    context.beginPath();
    if (ve && vn) {
        var trueVE = ve,
            trueVN = vn;
        if (beforevn && beforeve) {
            trueVE = ve - beforeve;
            trueVN = vn - beforevn;
        }
        var vne = Math.sqrt(Math.pow(trueVN, 2) + Math.pow(trueVE, 2));
        if (trueVE > 0) {
            if (trueVN < 0) {
                result = 180 - Math.asin(trueVE / vne) * 180 / Math.PI;
            } else {
                result = Math.asin(trueVE / vne) * 180 / Math.PI;
            }
        } else {
            if (trueVN < 0) {
                result = -Math.asin(trueVE / vne) * 180 / Math.PI - 180;
            } else {
                result = Math.asin(trueVE / vne) * 180 / Math.PI;
            }
        }
        $('#compass').css('transform', 'rotate(' + result + 'deg)');
        var moreHeight = 0;
        if (trueVE != 0 && trueVN != 0) {
            if (trueVE < 0) {
                moreHeight = commonParam * (trueVE / trueVN) * width / 2;
                if (Math.abs(moreHeight) > 50) {
                    moreHeight = 50;
                }
                $('.left-main-flight').css('transform', rotateX + ' rotateY(' + (0 - Math.asin(moreHeight / (width / 2)) * 180 / Math.PI) + 'deg) ' + rotateZ);
            } else {
                moreHeight = commonParam * (trueVE / trueVN) * width / 2;
                if (Math.abs(moreHeight) > 50) {
                    moreHeight = 50;
                }
                $('.left-main-flight').css('transform', rotateX + ' rotateY(' + Math.asin(moreHeight / (width / 2)) * 180 / Math.PI + 'deg) ' + rotateZ);
                moreHeight = 0 - moreHeight;
            }
            context.moveTo(0, height / 2 + moreHeight);
            context.lineTo(width, height / 2 - moreHeight);
            context.lineTo(width, height);
            context.lineTo(0, height);
            context.fill();
        } else {
            $('#compass').css('transform', 'rotate(0deg)');
            context.moveTo(0, height / 2);
            context.lineTo(width, height / 2);
            context.lineTo(width, height);
            context.lineTo(0, height);
            context.fill();
        }
    } else {
        $('#compass').css('transform', 'rotate(0deg)');
        context.moveTo(0, height / 2);
        context.lineTo(width, height / 2);
        context.lineTo(width, height);
        context.lineTo(0, height);
        context.fill();
    }
};
canvasDraw();

/* 放弃控制飞行器 */
/* 20160805 修改为不需要*/
// var giveupControl = function() {
//     if (confirm('确认放弃控制飞行器？')) {
//         var length = 5;
//         var ab = new ArrayBuffer(length);
//         var buffer = new DataView(ab);
//         buffer.setUint8(0, 252);
//         buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'], LE);
//         ws.send(buffer);
//         console.log('give up control');
//     }
// };
/* 重新获取控制权 */
var getControl = function () {
    var length = 5;
    var ab = new ArrayBuffer(length);
    var buffer = new DataView(ab);
    var result = '';
    buffer.setUint8(0, 253);
    buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'], LE);
    ws.send(buffer);
    console.log('get control');
    setLogInfor(formatDateTime(), '申请控制权');
}

// 显示日志
var setLogInfor = function (time, log) {
    // if (window.location.search.split('?')[1]) {
    //     var tempinfos = window.location.search.split('?')[1];
    //     if (tempinfos.split('&').length == 2) {
    // $("#logList").remove();

    // $("#logList .clone").remove();
    // console.log($("#logList .clone").length);
    // var oldHtml=$("#logList li").clone();
    // console.log(oldHtml.length);
    //var curHtml = '<li><span class = "date-infor">' + time + ' </span ><span class = "log-infor">' + log + '</span ></li >';
    // $("#logList").empty();
    // $("#logList").append(oldHtml).append(curHtml);
    // $("#logList").append(curHtml);
    // if($("#logList li").length==5){
    //     jQuery(".txtMarquee-top").slide({
    //         mainCell: ".bd ul",
    //         autoPlay: true,
    //         effect: "topMarquee",
    //         vis: 5,
    //         interTime: 50
    //     });
    // }
    //console.log($("#logList li").length);
    //console.log($("#logList li.clone").length);

    var curHtml = '<p class="noMargin"><span class = "date-infor">' + time + ' </span ><span class = "log-infor">' + log + '</span ></p>';

    if ($("#logList p").length > 4) {
        $("#logList p").eq(0).remove();
    }
    $("#logList").append(curHtml);
}
// 时间显示
var formatDateTime = function () {
    var curDate = new Date();
    // console.log(curDate);
    var y = curDate.getFullYear();
    var m = curDate.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = curDate.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = curDate.getHours();
    var minute = curDate.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;

    var second = curDate.getSeconds();
    second = second < 10 ? ('0' + second) : second;

    var t = y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;

    return t;
};
var gcj02towgs84, wgs84togcj02;
var coordTransform = function (lng, lat, type) {
    if (type == 1) {
        //国测局坐标(火星坐标)转wgs84坐标
        gcj02towgs84 = coordtransform.gcj02towgs84(lng, lat);
        // console.log("wgs84坐标  is  ", gcj02towgs84);
        return gcj02towgs84;
    } else {
        //wgs84转国测局坐标(火星坐标)
        wgs84togcj02 = coordtransform.wgs84togcj02(lng, lat);
        // console.log("火星坐标  is  ", wgs84togcj02);
        return wgs84togcj02;

    }


}
/* 当收到获取控制权的申请时候，将控制权给别人 */
$('#confirm #ok').on('click', function () {
    if ($('#confirm').data('uid') && infos['token']) {
        var uid = $('#confirm').data('uid');
        var length = 7 + uid.length;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        var result = '';
        buffer.setUint8(0, 251);
        buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'], LE);
        buffer.setUint16(5, uid.length, LE);
        for (var i = 0; i < uid.length; i++) {
            buffer.setUint8(7 + i, uid[i].charCodeAt());
        }
        ws.send(buffer);
        $('#confirm').modal('hide');
    }
});

// 保存航路
$('#saveAirLine').on('click', function () {
    // if (infos.heartbeat.base_mode && infos.heartbeat.base_mode >= 1) {
    // $("#searchFlightPoint").trigger("click");
    // var msgid = dv.getUint8(begin);
    // if(msgid==102){
    var data = {};
    if ($('#pointID').val() == "") {
        alert('请输入航路点名称');
    } else {
        data['name'] = $('#pointID').val().toString();
    }
    // 飞行之后
    // var counts = infos.mission_ack_2.count;
    // var points = infos.mission_ack_2.point;

    //直接保存页面可视航点，无权限限制
    var inputpoints = $('.single-right-up-sub');
    var savecounts = inputpoints.length;
    console.log(savecounts);
    var points = [];
    for (var i = 0; i < savecounts; i++) {
        var savepoints = {
            lat: '',
            lon: '',
            alt: '',
            v: '',
        };
        var inputs = inputpoints.eq(i).find('input');
        savepoints.lat = inputs[1].value * 1;
        savepoints.lon = inputs[0].value * 1;
        savepoints.alt = inputs[3].value * 1;
        savepoints.v = inputs[2].value * 1;

        points.push(savepoints);
        // points[i]=savepoints;
    }
    console.log("points is", points)
    var points = JSON.stringify(points);

    data['detail'] = points;
    // console.info("counts is",counts);
    // console.info("points is", points);
    // console.info("count is",(JSON.parse(points)).length);
    console.info("data is ", data);
    $.ajax({
        url: pointurl + 'submitroute',
        // url:'http://121.199.53.63:9999/submitbatch',
        type: 'post',
        data: data,
        success: function (result) {
            result = JSON.parse(result);
            if (result.err * 1 == 0) {
                alert('添加成功');
                console.log('正确', result);
                // $('input').val('');
                // $("#routeLine").modal('hide');
                setLogInfor(formatDateTime(), '保存航路');

            } else {
                alert('错误：' + result.msg);
            }
        }
    });
    // }

    // } else {
    //     // alert("注入航路后方可保存！");
    //     alert("飞机上线后方可保存！");
    // }
    $('#routeLine').modal('hide');
});

// 查询航路点
$("#searchLineBtn").on('click', function () {
    var reData;
    var sHtml = "";
    var pointData;
    var point;
    $("#infobody").empty();
    $.ajax({
        url: pointurl + 'route',
        type: 'get',
        data: {
            name: $('#pointsearch').val()
        },
        success: function (result) {
            pointData = JSON.parse(result);
            if (pointData.err == 0) {
                console.log('正确', pointData);
                console.log('正确', pointData.items.length);
                if (pointData.items.length > 0) {
                    $("#bodynone").hide();
                    $.each(pointData.items, function (n, value) {
                        console.log('detail', value);
                        // console.log("id is",value.id,JSON.parse(value.detail));
                        console.log("id is", value.id);
                        // try{
                        point = JSON.parse(value.detail);
                        // }catch(err){
                        //     alert("Error name:"+err.name+"Error message:"+err.message)
                        // }
                        var tr = $('<tr onclick="checkTr($(this))"><td><input type="radio" data-id="' + value.id + '" name="radioline"></td><td>' + value.name + '</td><td>' + point.length + '</td></tr>').data('points', value);
                        $("#infobody").append(tr);

                    });
                    setLogInfor(formatDateTime(), '查询航路');

                } else {
                    $("#bodynone").show();
                }
            } else {
                alert('错误：' + result.msg);
            }
        },
        error: function (result) {
            alert("出错啦！");
        }
    });
});

function checkTr(e) {
    e.find("input").prop("checked", true);
}
$("#confirmRe").click(function () {
    // if ($(document.getElementById('heartbeat.base_mode')).eq(0).attr('data-value') == 1) {
    var curId = $("input[name='radioline']:checked").attr("data-id");
    var target_infos = $("input[name='radioline']:checked").parents('tr').data("points");
    // console.log("curId is", curId);
    // console.log("target_infos  is", target_infos);
    curPoint = JSON.parse(target_infos.detail);
    curCount = curPoint.length;
    // console.log("current point is", curPoint);
    // console.log("current count length is", curCount);
    // console.log("current point id is", target_infos.id);

    $("#searchLine").modal("hide");
    drawSearchPoint(true, curCount, curPoint);
    drapExpFlightMarker();
    // }
});
// 清空飞机远程数据
$("#clearRemoteData").click(function () {
    var data = {};
    data['fid'] = $('#heartbeat.id_uav_xyi').text();
    console.log("data is", data);

    if (confirm('确认清空该飞机航点？')) {
        $.ajax({
            url: pointurl + 'cleardata',
            data: data,
            success: function (result) {
                result = JSON.parse(result);
                JSON.stringify
                if (result.err == 0) {
                    alert('清除成功');
                    console.log('正确', result);
                    $('input').val('');
                    $("#routeLine").modal('hide');
                    setLogInfor(formatDateTime(), '清空远程数据');
                } else {
                    alert('错误：' + result.msg);
                }
            }
        });
    }
})
/*
 var vbefore = [0,0];
 setInterval(function () {
 var v = Math.random().toFixed(1).toString().split('.')[1];
 var now = [];
 now[0] = Math.random()>0.5?0-Math.random().toFixed(1).toString().split('.')[1]*Math.random():Math.random().toFixed(1).toString().split('.')[1]*Math.random();
 now[1] = Math.random()>0.5?0-Math.random().toFixed(1).toString().split('.')[1]*Math.random():Math.random().toFixed(1).toString().split('.')[1]*Math.random();
 canvasDraw(now[0],now[1],vbefore[0],vbefore[1]);
 vbefore[0] += now[0];
 vbefore[1] += now[1];
 },1000);
 */
initMap();
$('#imgZoom').on('mousemove', function (e) {
    $("#spanX").text(e.offsetX / this.width - 0.5).css({
        "left": e.offsetX + 10,
        "top": e.offsetY
    });
    $("#spanY").text(e.offsetY / this.height - 0.5).css({
        "left": e.offsetX + 10,
        "top": e.offsetY + 20
    });
});
$('#imgZoom').on('click', function (e) {
    $("#imageX").val(e.offsetX / this.width - 0.5);
    $("#imageY").val(e.offsetY / this.height - 0.5);
});
$("#ruleZoom").click(function () {
    flagRight = 1;
    flagMap = 1
})