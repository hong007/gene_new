/**
 * Created by Sun Yongqi on 2016/5/23 0023.
 */
/* 地图相关生成 */
var map, marker;
map = new AMap.Map('container', {
    resizeEnable: true,
    zoom: [3 - 18]
});
map.setCity("杭州市");
map.setDefaultCursor("crosshair");
var toolBar = new AMap.ToolBar({
    visible: false
});
toolBar.hide();
map.addControl(toolBar);
var flights = {}, nums = 0;
// var server = 'ws://121.40.103.198:443/',ws;
// var server = 'ws://121.199.53.63:443/',ws;
var server = 'ws://g1.xyitech.com:443/',ws;
var LE = true;

/* 画飞机 */
var drapExpFlightMarker = function (id, bettery, deg, weight) {
    if (flights[id].gps_raw && flights[id].gps_raw.lon_gps && flights[id].gps_raw.lat_gps) {
        var flight_main = document.createElement('div');
        flight_main.className = 'main-flight-marker-hasNO';
        flight_main.id = id;
        var flight_main_img_div = document.createElement('div');
        flight_main_img_div.className = 'img-div';
        var flight_main_img = document.createElement('img');
        flight_main_img_div.appendChild(flight_main_img);
        if (bettery < 25) {
            flight_main_img.src = '../images/uav/flight1.png';
        } else if (bettery < 50) {
            flight_main_img.src = '../images/uav/flight2.png';
        } else if (bettery < 75) {
            flight_main_img.src = '../images/uav/flight3.png';
        } else {
            flight_main_img.src = '../images/uav/flight4.png';
        }
        $(flight_main_img).on('click', function () {
            var id = $(this).parent().next().text();
            if (flights[id]['infos-show'] && flights[id]['infos-show'] == true) {
                $(this).parent().next().next().hide();
                flights[id]['infos-show'] = false;
            } else {
                $(this).parent().next().next().show();
                flights[id]['infos-show'] = true;
            }
        });
        var flight_main_div = document.createElement('div');
        flight_main_div.className = 'id';
        flight_main_div.innerText = id;
        var flight_main_shadow = document.createElement('div');
        if (flights[id]['type'] && flights[id]['type'] * 1 > 0) {
            flight_main_shadow.className = 'shadow heart-beng-beng';
        } else {
            flight_main_shadow.className = 'shadow';
        }
        if(deg){
            flight_main_img.style.transform = 'rotate('+deg+'deg)';
            flight_main_div.style.transform = 'rotate('+deg+'deg)';
        }
        flight_main.appendChild(flight_main_shadow);
        var flight_main_infos = document.createElement('div');
        flight_main_infos.className = 'infos';
        if (flights[id]['infos-show'] && flights[id]['infos-show'] == true) {
            flight_main_infos.style.display = 'block';
        }
        $(flight_main_infos).append($('<p></p>').append($('<span>Lon:</span>')).append(flights[id].gps_raw.lon_gps));
        $(flight_main_infos).append($('<p></p>').append($('<span>Lat:</span>')).append(flights[id].gps_raw.lat_gps));
        $(flight_main_infos).append($('<p></p>').append($('<span>编号 :</span>')).append(id));
        $(flight_main_infos).append($('<p></p>').append($('<span>状态 :</span>')).append(system_status_flag[flights[id].heartbeat.base_mode]));
        $(flight_main_infos).append($('<p></p>').append($('<button class="main-control-button" style="border-right: 1px solid white;" onclick="control(\'' + id + '\')">控制</button>')).append($('<button class="main-control-button" onclick="realtimedate(\'' + id + '\')">数据</button>')));
        flight_main.appendChild(flight_main_img_div);
        flight_main.appendChild(flight_main_div);
        flight_main.appendChild(flight_main_infos);
        return flight_main;
    }
}

/*for (var count in flights) {
    var flight = flights[count];
    var temp = new AMap.Marker({
        map: map,
        content: drapExpFlightMarker(count, Math.random() * 100),
        bubble: true
    });
    flight['flight'] = temp;
    temp.setPosition(new AMap.LngLat(flight.lnglat[0], flight.lnglat[1]));
}
$('#flight-no').text(nums);*/
function mainConnect() {
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
    };
    ws.onerror = function (error) {
        console.log("websocket", error);
    };
    ws.onmessage = function (res) {
        var dv = new DataView(res.data);
        var begin = 0;

        var msgid = dv.getUint8(begin);
        if (msgid == 1) {
            //heartbeat解析
            begin += 1;
            var id = dv.getUint8(begin);
            if (flights[id]) {
                flights[id]['heartbeat'] = {};
            } else {
                nums += 1;
                flights[id] = {};
            }
            var infos = {};
            infos['id_uav_xyi'] = id;
            begin += 1;
            infos['id_iso_xyi'] = dv.getUint8(begin);
            begin += 1;
            infos['base_mode'] = dv.getUint8(begin);
            begin += 1;
            infos['system_status'] = dv.getUint8(begin);
            begin += 1;
            infos['xylink_version'] = dv.getUint8(begin);
            begin += 1;
            flights[id]['heartbeat'] = infos;
        } else if (msgid == 2) {
            //battery_status解析
            begin += 1;
            var id = dv.getUint8(begin);
            begin += 1;
            if (flights[id]) {
                var infos = {};
                infos['time_std_s'] = 0;
                infos['time_std_s'] = dv.getUint32(begin, LE);
                begin += 4;
                /* 20160529新协议，增加time_std_s*/
                infos['voltages'] = [];
                for (var i = 0; i < 10; i++) {
                    infos['voltages'][i] = dv.getUint16(begin, LE);
                    begin += 2;
                }
                infos['current_battery'] = dv.getInt16(begin, LE);
                begin += 2;
                infos['battery_remaining'] = dv.getInt8(begin);
                begin += 1;
                flights[id]['battery_status'] = infos;
                if(flights[id]['plain_marker'] && infos['battery_remaining']){
                    flights[id]['plain_marker'].setContent(drapExpFlightMarker(id, infos['battery_remaining']));
                }else{
                    var temp = new AMap.Marker({
                        map: map,
                        label:{
                            offset: new AMap.Pixel(-50, -50)
                        },
                        content: drapExpFlightMarker(id, infos['battery_remaining']),
                        bubble: true
                    });
                    flights[id]['plain_marker'] = temp;
                }
            }
        } else if (msgid == 3) {
            //local_position_ned解析
            begin += 1;
            var id = dv.getUint8(begin);
            begin += 1;
            if (flights[id]) {
                var infos = {};
                infos['time_std_s'] = dv.getUint32(begin, LE);
                begin += 4;
                infos['x'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['y'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['z'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['vx'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['vy'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['vz'] = dv.getFloat32(begin, LE).toFixed(2);
                begin += 4;
                infos['dis_m'] = dv.getFloat32(begin, LE).toFixed(1);
                begin += 4;
                flights[id]['local_position_ned'] = infos;
            }
        } else if (msgid == 4) {
            //global_position_int解析
            begin += 1;
            var id = dv.getUint8(begin);
            begin += 1;
            if (flights[id]) {
                var infos = {};
                infos['time_std_s'] = dv.getUint32(begin, LE);
                begin += 4;
                infos['relative_alt'] = dv.getInt32(begin, LE) / 1000;
                begin += 4;
                infos['hdg'] = dv.getUint16(begin, LE) / 100;
                begin += 2;
                flights[id]['global_position_int'] = infos;
                if(flights[id]['plain_marker'] && flights[id]['battery_remaining']){
                    flights[id]['plain_marker'].setContent(drapExpFlightMarker(id, flights[id]['battery_remaining'],infos['hdg']));
                }
            }
        } else if (msgid == 5) {
            //gps_raw解析
            begin += 1;
            var id = dv.getUint8(begin);
            begin += 1;
            if (flights[id]) {
                var infos = {};
                infos['time_std_s'] = dv.getUint32(begin, LE);
                begin += 4;
                infos['fix_type'] = dv.getUint8(begin);
                begin += 1;
                var lat = parseFloat(dv.getInt32(begin, LE)) / 1E7
                infos['lat_gps'] = lat;
                begin += 4;
                var lon = parseFloat(dv.getInt32(begin, LE)) / 1E7
                infos['lon_gps'] = lon;
                begin += 4;
                var alt = parseFloat(dv.getInt32(begin, LE)) / 1E7
                infos['alt_gps'] = alt;
                begin += 4;
                infos['eph'] = dv.getUint16(begin, LE);
                begin += 2;
                infos['epv'] = dv.getUint16(begin, LE);
                begin += 2;
                infos['vel_gps'] = dv.getUint16(begin, LE) / 100;
                begin += 2;
                infos['cog'] = dv.getUint16(begin, LE) / 100;
                begin += 2;
                infos['satellites_visible'] = dv.getUint8(begin);
                begin += 1;
                flights[id]['gps_raw'] = infos;
                flights[id]['plain_marker'].setPosition(new AMap.LngLat(infos['lon_gps'], infos['lat_gps']));
            }
        } else if (msgid == 250) {
            console.log('msgid',msgid);
            //gps_raw解析
            begin += 1;
            var id = dv.getInt32(begin,LE);
            begin += 4;
            if (flights[id]) {
                var len = dv.getUint16(begin,LE);
                var token = String.fromCharCode.apply(null, new Uint8Array(res.data, begin+2, len));
                window.open('/pages/single.html?id=' + id+'&t='+ encodeURI(token));
            }
        }
        var count = 0;
        for(var k in flights){
            count++;
        }
        $('#flight-no').text(count);
    };
    ws.onclose = function () {
        console.log('websocket disconnected, prepare reconnect');
        ws = null;
        setTimeout(mainConnect, 100);
    };
}

function change_base_map(isnormal, eve) {
    if (isnormal) {
        if (!$(eve).hasClass('selected')) {
            $(eve).removeClass('under').addClass('selected');
            $(eve).next().removeClass('selected').addClass('under');
            map.setLayers([new AMap.TileLayer({detectRetina: true})]);
        }
    }
    else {
        if (!$(eve).hasClass('selected')) {
            $(eve).removeClass('under').addClass('selected');
            $(eve).prev().removeClass('selected').addClass('under');
            map.setLayers([new AMap.TileLayer.Satellite({detectRetina: true}), new AMap.TileLayer({detectRetina: true})]);
        }
    }
}
function control(eve) {
    var length = 5;
    var ab = new ArrayBuffer(length);
    var buffer = new DataView(ab);
    var result = '';
    buffer.setUint8(0, 253);
    buffer.setInt32(1, eve, LE);
    ws.send(buffer);
    console.log(253);
    //window.open('/pages/single.html?' + eve);
    //window.location.href = 'single.html?' + eve;
}
function realtimedate(eve) {
    window.location.href = 'realtimedata.html?' + eve;
}
mainConnect();

