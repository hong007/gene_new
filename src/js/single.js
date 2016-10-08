//var server = 'ws://121.40.103.198:443/';
// var server = 'ws://121.199.53.63:443/',
//     ws;
var server = 'ws://g1.xyitech.com:443/',ws;

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
        FlightLine: '#1188fa'
    }
}
var Local_count = 1;
var Point_GPS = {};
var mark_div = document.createElement('div');
mark_div.className = 'map-marker';
var mark_div_Count = document.createElement('div');
mark_div_Count.innerHTML = Local_count;
var mark_div_img = document.createElement('img');
mark_div_img.src = '../images/mark_bs.png';
mark_div.appendChild(mark_div_img);
mark_div.appendChild(mark_div_Count);
var length = 0;
var losingTime = 0.1;
var NAV_GPS = [120.001524, 30.279998];
var FilghtPoints = [];
var LE = true;
var flightPointClick = function(ele) {
    var target = $(ele).parent();
    if (target.hasClass('select')) {
        target.removeClass('select');
    } else {
        target.addClass('select');
    }
};
if (window.location.search.split('?')[1]) {
    var tempinfos = window.location.search.split('?')[1];
    infos['token'] = decodeURI(tempinfos.split('&')[1].split('=')[1]);
    infos['heartbeat']['id_uav_xyi'] = tempinfos.split('&')[0].split('=')[1];
    document.getElementById('heartbeat.id_uav_xyi').innerText = infos['heartbeat']['id_uav_xyi'];
} else {
    document.getElementById('heartbeat.id_uav_xyi').innerText = 1;
}
var ws = null;

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

    ws.onopen = function() {
        console.log('websocket connected', server);
        if (infos['token']) {
            var token = infos['token'];
            var length = 7 + token.length;
            var ab = new ArrayBuffer(length);
            var buffer = new DataView(ab);
            var result = '';
            buffer.setUint8(0, 249);
            buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'], LE);
            buffer.setUint16(5, infos['token'].length, LE);
            for (var i = 0; i < token.length; i++) {
                buffer.setUint8(7 + i, token[i].charCodeAt());
            }
            /*buffer
            var test1 = String.fromCharCode.apply(null, new Uint8Array(res.data, begin+2, len));
            */
            console.log(123, buffer.byteLength, buffer.getInt32(1, LE), buffer.getUint16(5, LE), buffer.getUint8(10), String.fromCharCode.apply(null, new Uint8Array(buffer, 7, token.length)));
            ws.send(buffer);
        }
    };
    ws.onerror = function(error) {
        console.log("websocket", error);
    };
    ws.onmessage = function(res) {
        losingTime = 0;
        results = res;
        finalData = res.data;
        var dv = new DataView(res.data);
        var begin = 0;
        var old = [infos['local_position_ned']['x'], infos['local_position_ned']['y'], infos['local_position_ned']['z']];

        var msgid = dv.getUint8(begin);
        if (msgid == 1) {
        console.log('finalData is' ,finalData)
            
            //heartbeat解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                infos['heartbeat'] = {};
                console.info('Heart beng~beng~beng~');
                infos['heartbeat']['id_uav_xyi'] = dv.getUint8(begin);
                begin += 1;
                infos['heartbeat']['id_iso_xyi'] = dv.getUint8(begin);
                begin += 1;
                //旧协议
                /*infos['heartbeat']['base_mode'] = dv.getUint8(begin);
                 begin += 1;
                 infos['heartbeat']['system_status'] = dv.getUint8(begin);
                 begin += 1;*/
                //新协议
                infos['heartbeat']['base_mode'] = dv.getUint8(begin);
                begin += 1;
                infos['heartbeat']['system_status'] = dv.getUint8(begin);
                begin += 1;
                //新协议结束
                infos['heartbeat']['xylink_version'] = dv.getUint8(begin);
                begin += 1;
            }
            setValueFromInfos('heartbeat', 'id_uav_xyi');
            setValueFromInfos('heartbeat', 'base_mode', system_status_flag[infos.heartbeat.base_mode], true);
            changeCtlIcons(infos['heartbeat']['system_status']);
        } else if (msgid == 2) {
            //battery_status解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                /* 20160529新协议，增加time_std_s*/
                infos['battery_status'] = {};
                infos['battery_status']['time_std_s'] = 0;
                infos['battery_status']['time_std_s'] = dv.getUint32(begin, LE);
                begin += 4;
                /* 20160529新协议，增加time_std_s*/
                infos['battery_status']['voltages'] = [];
                for (var i = 0; i < 10; i++) {
                    infos['battery_status']['voltages'][i] = dv.getUint16(begin, LE);
                    begin += 2;
                }
                infos['battery_status']['current_battery'] = dv.getInt16(begin, LE);
                begin += 2;
                infos['battery_status']['battery_remaining'] = dv.getInt8(begin);
                begin += 1;
                setValueFromInfos('battery_status', 'voltages');
                setValueFromInfos('battery_status', 'current_battery');
                setValueFromInfos('battery_status', 'battery_remaining');
                if (infos['battery_status']['battery_remaining'] <= 25) {
                    nav.src = "../images/uav/flight4.png";
                } else if (infos['battery_status']['battery_remaining'] <= 50) {
                    nav.src = "../images/uav/flight3.png";
                } else if (infos['battery_status']['battery_remaining'] <= 75) {
                    nav.src = "../images/uav/flight2.png";
                } else {
                    nav.src = "../images/uav/flight1.png";
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
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                infos['global_position_int'] = {};
                infos['global_position_int']['time_std_s'] = 0;
                infos['global_position_int']['time_std_s'] = dv.getUint32(begin, LE);
                begin += 4;
                infos['global_position_int']['relative_alt'] = dv.getInt32(begin, LE) / 1000;
                begin += 4;
                infos['global_position_int']['hdg'] = dv.getUint16(begin, LE) / 100;
                begin += 2;
                setValueFromInfos('global_position_int', 'time_boot_ms', infos.global_position_int.time_boot_ms / 600, true);
                setValueFromInfos('global_position_int', 'relative_alt');
                setValueFromInfos('global_position_int', 'hdg');
            }
        } else if (msgid == 5) {
            //gps_raw解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                infos['gps_raw'] = {};
                infos['gps_raw']['time_std_s'] = 0;
                infos['gps_raw']['time_std_s'] = dv.getUint32(begin, LE);
                begin += 4;
                infos['gps_raw']['fix_type'] = dv.getUint8(begin);
                begin += 1;
                var lat = parseFloat(dv.getInt32(begin, LE)) / 1E7
                infos['gps_raw']['lat_gps'] = lat;
                begin += 4;
                var lon = parseFloat(dv.getInt32(begin, LE)) / 1E7
                infos['gps_raw']['lon_gps'] = lon;
                begin += 4;
                var alt = parseFloat(dv.getInt32(begin, LE)) / 1E7
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
                //createFlightPoint(0);
                $('#start input[name=lon]').val(infos['gps_raw']['lon_gps']);
                $('#start input[name=lat]').val(infos['gps_raw']['lat_gps']);
            }
        } else if (msgid == 101) {} else if (msgid == 102) {
            //command_xyi_long解析
            infos['command_ack'] = {};
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                begin += 1;
                infos['command_ack']['command'] = dv.getUint16(begin, LE);
                begin += 2;
                infos['command_ack']['result'] = dv.getUint8(begin);
                begin += 1;
                if (infos['command_ack']['type'] > 0) {
                    alert(command_ack_flag[infos['command_ack']['type']][0]);
                }
            }
        } else if (msgid == 106) {
            //command_xyi_long解析
            console.info(msgid);
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
            infos['mission_ack_2'] = {};
            console.info(msgid);
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText) {
                infos['mission_ack_2']['target_uav'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_2']['target_system'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_2']['type'] = dv.getUint8(begin);
                begin += 1;
                infos['mission_ack_2']['count'] = dv.getUint16(begin, LE);
                begin += 1;
                infos['mission_ack_2']['frame'] = dv.getUint8(begin);
                begin += 2;
                infos['mission_ack_2']['point'] = [];
                for (var i = 0; i < infos['mission_ack_2']['count']; i++) {
                    var point = {}
                    var lat = dv.getFloat32(begin, LE);
                    point['lat'] = (lat / Math.PI) * 180 - 0.002450;
                    begin += 4;
                    var lon = dv.getFloat32(begin, LE);
                    point['lon'] = (lon / Math.PI) * 180 + 0.004740;
                    begin += 4;
                    point['alt'] = dv.getFloat32(begin, LE).toFixed(2);
                    begin += 4;
                    point['v'] = dv.getFloat32(begin, LE).toFixed(2);
                    begin += 4;
                    infos['mission_ack_2']['point'][i] = point;
                }
                drawSearchPoint();
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
                    var lat = dv.getFloat32(begin, LE);
                    point['lat'] = (lat / Math.PI) * 180 - 0.002450;
                    begin += 4;
                    var lon = dv.getFloat32(begin, LE);
                    point['lon'] = (lon / Math.PI) * 180 + 0.004740;
                    begin += 4;
                    point['alt'] = dv.getFloat32(begin, LE).toFixed(2);
                    begin += 4;
                    infos['mission_ack_3']['point'][i] = point;
                }
                drawSearchEnd();
            }
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
            console.log(id, result);
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
                window.location.href = '/pages/single.html?id=' + id + '&t=' + encodeURI(token);
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
        resetMarker([infos.local_position_ned.vx, infos.local_position_ned.vy])
    };
    ws.onclose = function() {
        console.log('websocket disconnected, prepare reconnect');
        ws = null;
        setTimeout(connect, 100);
    };
}
connect();
var confirmAlert = function(info) {
        $('#confirm .modal-body h3').text(info);
        $('#confirm').modal('show');
    }
    //common function
var uavStart = function() {
    if (infos.heartbeat && infos.heartbeat.base_mode && infos.heartbeat.base_mode == 52) {
        var length = 6 + 4 * 7;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        buffer.setUint8(0, 101);
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(2, 0);
        //开始起飞指令
        buffer.setUint16(3, 1, LE);
        buffer.setUint8(5, 1);
        for (var i = 0; i < 7; i++) {
            buffer.setFloat32(6 + 4 * i, 0, LE);
        }
        ws.send(buffer);
        console.info('flight start');
    }
}
var uavStop = function() {
    if (infos.heartbeat.base_mode && infos.heartbeat.base_mode == 5) {
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
        console.info('flight start');
    }
}

var calcLength = function(x, y, z) {
    length += (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)));
    return length.toFixed(2);
}
var setValue = function(id1, id2, value, needTrueValue, trueValue) {

    if (trueValue && needTrueValue && needTrueValue == true) {
        $(document.getElementById(id1 + "." + id2)).text(value).attr('data-value', trueValue);
    } else {
        $(document.getElementById(id1 + "." + id2)).text(value);
    }
}
var setValueFromInfos = function(id1, id2, value, needTrueValue) {

    if (needTrueValue && needTrueValue == true) {
        $(document.getElementById(id1 + "." + id2)).text(value).attr('data-value', infos[id1][id2]);
    } else {
        $(document.getElementById(id1 + "." + id2)).text(infos[id1][id2]);
    }
}
var direction = function(vn, ve) {
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
var addFlightPoint = function() {

        $('.single-right-up-sub').removeClass('select');
        drawLinesByPoint([Point_GPS.lng, Point_GPS.lat]);
        createFlightPoint(Local_count);
        var outside = $('<div class="single-right-up-sub select"></div>'),
            upDel = $('<span class="sanjiao glyphicon glyphicon-remove-circle" title="close" onclick="flightPointDelete(this)">&nbsp;</span>'),
            upInfo = $('<div class="single-right-up-block" onclick="flightPointClick(this)"></div>'),
            upInfoNumber = $('<span class="number">' + Local_count++ + '</span>'),
            upInfoTitle = $('<span class="infos">航点</span>'),
            downinfo = $('<div class="single-right-up-hidden"><table><tbody><tr><td class="info">lon :</td><td class="input"><input name="lon" onkeyup="enterLonLatValues(this)" type="text" style="width: 100%;" value="' + Point_GPS.lng + '"/></td></tr><tr><td class="info">lat :</td><td class="input"><input name="lat" onkeyup="enterLonLatValues(this)" style="width: 100%;" value="' + Point_GPS.lat + '" type="text"/></td></tr><tr><td class="info">速度 :</td><td class="input"><input name="speed" type="text" value="2"/><span>m/s</span></td></tr><tr><td class="info">高度 :</td><td class="input"><input name="altitude" value="25" type="text"/><span>m</span></td></tr></tbody></table></div>')
        mark_div.childNodes[1].innerText = Local_count;
        $('.single-right-up').append(outside.append(upDel).append(upInfo.prepend(upInfoTitle).prepend(upInfoNumber)).append(downinfo));
    }
    /* 输入航点经纬度，修改marker在地图上的位置 */
var enterLonLatValues = function(eve) {
        var sub = $(eve).parents('.single-right-up-sub');
        var count = sub.find('.number:first').text();
        var modifyPoint = flightPointList[count];
        modifyPoint.setPosition(new AMap.LngLat(sub.find('input')[0].value, sub.find('input')[1].value));
        modifyPoint.setMap(map);
        lineArr[count] = [sub.find('input')[0].value, sub.find('input')[1].value];
        polyLine.setPath(lineArr);
        polyLine.setMap(map);
    }
    /* 删除航点 */
var flightPointDelete = function(eve) {
        if (confirm('确认删除该航点？')) {
            var sub = $(eve).parents('.single-right-up-sub');
            var count = sub.find('.number:first').text();
            lineArr.splice(count, 1);
            polyLine.setPath(lineArr);
            polyLine.setMap(map);
            flightPointList[count].hide();
            var flightPointNoList = $('.single-right-up-block>.number');
            var i = count * 1 + 1;
            while (i < flightPointList.length) {
                console.info(flightPointList[i]);
                var div = flightPointList[i].getContent();
                div.childNodes[1].innerHTML = i - 1;
                flightPointList[i].setContent(div);
                flightPointList[i].setMap(map);
                flightPointNoList[i - 1].innerText = i - 1;
                i++;
            }
            Local_count -= 1;
            var temp = marker.getContent();
            temp.childNodes[1].innerText = Local_count;
            marker.setContent(temp);
            marker.setMap(map);
            flightPointList.splice(count, 1);
            flightPointList
            sub.remove();
        }
    }
    /* 生成航点 */
var flightPointList = [];
var createFlightPoint = function(count, lnglat, color) {
        var number = 0;
        if (count) {
            number = count;
        } else if (count == 0) {
            number = "S";
        } else {
            number = Local_count++;
        }
        var mark_div_t = document.createElement('div');
        mark_div_t.className = 'map-marker';
        var mark_div_Count_t = document.createElement('div');
        mark_div_Count_t.innerHTML = number;
        var mark_div_img_t = document.createElement('img');
        if (color) {
            if (color.toUpperCase() == "E") {
                mark_div_t.className = 'map-marker end';
                mark_div_img_t.src = '../images/mark_bs_red.png';
            } else {
                mark_div_t.className = 'map-marker point';
                mark_div_img_t.src = '../images/mark_bs_yellow.png';
            }
        } else {
            mark_div_img_t.src = '../images/mark_bs.png';
        }
        mark_div_t.appendChild(mark_div_img_t);
        mark_div_t.appendChild(mark_div_Count_t);
        var position = clickLnglat;
        if (lnglat) {
            position = lnglat;
        }
        var taskPoint = new AMap.Marker({
            content: mark_div_t,
            bubble: true,
            draggable: true,
            clickable: true,
            position: position
        });
        //点击事件
        taskPoint.on('click', function() {
            var count = this.H.content.childNodes[1].innerText,
                target = findByFlightCount(count);
            if (target) {
                $('.single-right-up-sub').removeClass('select');
                target.addClass('select');
            }
        });
        //拖动事件
        taskPoint.on('dragend', function() {
            var count = this.H.content.childNodes[1].innerText,
                target = findByFlightCount(count),
                maxLength = $('.single-right-up-sub').length;
            if (target) {
                target = $(target[0]);
                if (!target.hasClass('select')) {
                    $('.single-right-up-sub').removeClass('select');
                    target.addClass('select');
                }
                target.find('input')[0].value = this.Pe.position.lng;
                target.find('input')[1].value = this.Pe.position.lat;
                drawLinesByPoint();
            }
        });
        taskPoint.setMap(map);
        flightPointList[count] = taskPoint;
    }
    /* 根据count找到对应的航点信息框 */
var findByFlightCount = function(count) {
    /*if(count.toUpperCase() == "S"){
     //S表示Start
     return $('.single-right-up-sub:first').addClass('select');
     }else if(count.toUpperCase() == "E"){
     //E表示End
     return $('.single-right-up-sub:last').addClass('select');
     }else if(count*1 > 0){
     return $('.single-right-up-sub').eq(count*1).addClass('select');
     }*/
    if (count * 1 > 0) {
        return $('.single-right-up-sub').eq(count * 1).addClass('select');
    }
    return undefined;
}

var lineArr = [];
lineArr.push(NAV_GPS);
var polyLine = new AMap.Polyline({
    map: map,
    path: lineArr,
    strokeColor: common.colors.PointLine,
    strokeOpacity: 1,
    strokeWeight: 3,
    strokeStyle: "solid"
});
/* 根据航点画出航线 */
var drawLinesByPoint = function(tempRightUps) {
    if (tempRightUps) {
        lineArr.push(tempRightUps);
    } else {
        lineArr = [];
        lineArr.push(NAV_GPS);
        $($('.single-right-up-sub:not(:first)')).each(function() {
            var inputs = $(this).find('input');
            lineArr.push([inputs[0].value, inputs[1].value]);
        });
    }
    polyLine.setPath(lineArr);
    polyLine.setMap(map);
}


//构建坐标图形
var nav = document.createElement('img');
nav.className = 'fly-uav';
nav.src = "../images/uav/flight1.png";
var map, marker_nav, marker;
var resetMarker = function(vlnglat) {
    if (infos.global_position_int && infos.global_position_int.hdg) {
        nav.style.transform = "rotate(" + infos.global_position_int.hdg + "deg)";
    } else {
        nav.style.transform = "rotate(0deg)";
    }
    marker_nav.setPosition(new AMap.LngLat(NAV_GPS[0], NAV_GPS[1]));
    marker_nav.setContent(nav);
    marker_nav.setMap(map);
    new AMap.Polyline({
        map: map,
        path: FilghtPoints,
        strokeColor: common.colors.FlightLine,
        strokeOpacity: 1,
        strokeWeight: 3,
        strokeStyle: "solid"
    });
}
map = new AMap.Map('container', {
    resizeEnable: true,
    zoom: 11,
    center: NAV_GPS
});
map.setCity("杭州市");
map.setDefaultCursor("crosshair");
marker_nav = new AMap.Marker({
    map: map,
    content: nav,
    bubble: true,
    position: NAV_GPS
});
marker = new AMap.Marker({
    map: map,
    content: mark_div,
    bubble: true
});


AMap.plugin(['AMap.Geocoder', 'AMap.CustomLayer'], function() {
    map.on('click', function(e) {
        Point_GPS = new AMap.LngLat(NAV_GPS[0], NAV_GPS[1]);
        clickLnglat = e.lnglat;
        marker.setContent(mark_div);
        marker.setPosition(e.lnglat);
        Point_GPS = e.lnglat;
    });
    map.on('rightclick', function(e) {
        if (Local_count == 1) {
            lineArr = [];
            lineArr.push(NAV_GPS);
        }
        addFlightPoint();
    });
    canvas = document.createElement('canvas');
    canvas.width = map.getSize().width;
    canvas.height = map.getSize().height;
    cus = new AMap.CustomLayer(canvas, {
        zooms: [3, 18],
        zIndex: 2000
    });
    cus.render = onRender();
    cus.setMap(map);
});
AMap.event.addDomListener(document.getElementById('addStartEndPoint'), 'click', function() {}, false);
$('#addStartEndPoint').on('click', function() {
    var outside = $('<div class="single-right-up-sub select"></div>'),
        upInfo = $('<div class="single-right-up-block" onclick="flightPointClick(this)"><span class="sanjiao glyphicon glyphicon-remove-circle" title="close">&nbsp;</span></div>'),
        upInfoNumber = $('<span class="number">' + +'</span>'),
        upInfoTitleStart = $('<span class="infos">起飞点</span>'),
        upInfoTitleEnd = $('<span class="infos">着陆点</span>'),
        downinfo = $('<div class="single-right-up-hidden"><table><tbody><tr><td>速度 :</td><td><input name="speed" type="text" value="2"/><span>m/s</span></td></tr><tr><td>高度 :</td><td><input name="altitude" value="25" type="text"/><span style="float: right;">meters</span></td></tr></tbody></table></div>')
    $('.single-right-up').append(outside.append(upInfo.prepend(upInfoTitleStart).prepend(upInfoNumber)).append(downinfo));
    $('.single-right-up').append(outside.append(upInfo.prepend(upInfoTitleEnd).prepend(upInfoNumber)).append(downinfo));
});

//页面控件事件
$('#addFlightLine').on('click', function() {
    if ($(document.getElementById('heartbeat.base_mode')).eq(0).attr('data-value') == 1) {
        var points = $('.single-right-up-sub');
        var length = 7 + 16 * points.length;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        var result = '';
        buffer.setUint8(1, document.getElementById('heartbeat.id_uav_xyi').innerText * 1);
        buffer.setUint8(0, 105);
        buffer.setUint8(2, 0);
        buffer.setUint16(3, points.length, true);
        buffer.setUint8(5, 1);
        result += buffer.getUint8(0) + ',';
        result += buffer.getUint8(1) + ',';
        result += buffer.getUint8(2) + ',';
        result += buffer.getUint16(3, true) + ',';
        result += buffer.getUint8(5) + ',';
        var bc = 6;
        for (var i = 0; i < points.length; i++) {
            var inputs = points.eq(i).find('input');
            console.info(inputs[1].value);
            console.info(inputs[0].value);
            console.info(inputs[3].value);
            console.info(inputs[2].value);
            buffer.setFloat32(bc + 16 * i, inputs[1].value, true);
            result += buffer.getFloat32(bc + 16 * i, true) + ',';

            buffer.setFloat32(bc + 16 * i + 4, inputs[0].value, true);
            result += buffer.getFloat32(bc + 16 * i + 4, true) + ',';

            buffer.setFloat32(bc + 16 * i + 8, inputs[3].value, true);
            result += buffer.getFloat32(bc + 16 * i + 8, true) + ',';

            buffer.setFloat32(bc + 16 * i + 12, inputs[2].value, true);
            result += buffer.getFloat32(bc + 16 * i + 12, true) + ',';
        }
        ws.send(buffer);
        console.info('sent ' + result);
    }
});

var canvas, cur;
var params_T;
var onRender = function() {
    var group = $('.single-right-up-sub:not(:last)');
    if (group.length > 0) {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 10;
        ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        var grouplist = group.eq(0).attr('data-flightPoint').split(',');
        var p0 = map.lnglatTocontainer([grouplist[0], grouplist[1]]);
        ctx.moveTo(p0.getX(), p0.getY());
        for (var c = 1; c < group.length; c++) {
            var groupsub = group.eq(c).attr('data-flightPoint').split(',');
            var tp = map.lnglatTocontainer([groupsub[0], groupsub[1]]);
            ctx.lineTo(tp.getX(), tp.getY());
        }
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        ctx.stroke();
    }
}

$('#satellite').on('click', function() {
    if ($(this).attr('data-satellite')) {
        map.setLayers([new AMap.TileLayer({
            detectRetina: true
        })]);
        $(this).removeAttr('data-satellite');
    } else {
        map.setLayers([new AMap.TileLayer.Satellite({
            detectRetina: true
        }), new AMap.TileLayer({
            detectRetina: true
        })]);
        $(this).attr('data-satellite', true);
    }

});
$('#searchFlightPoint').on('click', function() {
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
    }
});
var drawSearchPoint = function() {
    var counts = infos.mission_ack_2.count;
    var points = infos.mission_ack_2.point;
    Local_count = 1;
    lineArr = [];
    lineArr.push(NAV_GPS);
    flightPointList = [];
    map.clearMap();
    $('.single-right-up').empty();
    for (var i = 0; i < counts; i++) {
        $('.single-right-up-sub').removeClass('select');
        drawLinesByPoint([points[i].lon, points[i].lat]);
        createFlightPoint(i + 1, [points[i].lon, points[i].lat], 'S');
        var outside = $('<div class="single-right-up-sub select"></div>'),
            upDel = $('<span class="sanjiao glyphicon glyphicon-remove-circle" title="close" onclick="flightPointDelete(this)">&nbsp;</span>'),
            upInfo = $('<div class="single-right-up-block" onclick="flightPointClick(this)"></div>'),
            upInfoNumber = $('<span class="number">' + Local_count++ + '</span>'),
            upInfoTitle = $('<span class="infos">航点</span>'),
            downinfo = $('<div class="single-right-up-hidden"><table><tbody><tr><td class="info">lon :</td><td class="input"><input name="lon" onkeyup="enterLonLatValues(this)" type="text" style="width: 100%;" value="' + points[i].lon + '"/></td></tr><tr><td class="info">lat :</td><td class="input"><input name="lat" onkeyup="enterLonLatValues(this)" style="width: 100%;" value="' + points[i].lat + '" type="text"/></td></tr><tr><td class="info">速度 :</td><td class="input"><input name="speed" type="text" value="' + points[i].v + '"/><span>m/s</span></td></tr><tr><td class="info">高度 :</td><td class="input"><input name="altitude" value="' + points[i].alt + '" type="text"/><span>m</span></td></tr></tbody></table></div>')
        mark_div.childNodes[1].innerText = Local_count;
        $('.single-right-up').append(outside.append(upDel).append(upInfo.prepend(upInfoTitle).prepend(upInfoNumber)).append(downinfo));
    }
    resetMarker([1, 0]);
}
$('#searchFlightEnd').on('click', function() {
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
        //drawSearchEnd();
        console.info('sent SearchEndResult is :' + result);
    }
});
var drawSearchEnd = function() {
    var counts = infos.mission_ack_3.count;
    var points = infos.mission_ack_3.point;
    var result = []
    for (var t in points) {
        result[t] = {};
        result[t]['lnglat'] = [points[t].lon, points[t].lat];
        result[t]['name'] = t + 1;
        result[t]['id'] = t + 1;

    }
    var mass = new AMap.MassMarks(result, {
        url: '../images/mark_bs_red.png',
        size: new AMap.Size(33, 33),
        anchor: new AMap.Pixel(17, 33)
    });
    var layers = map.getLayers();
    layers.push(mass);
    map.setLayers(layers);
}
var changeCtlIcons = function(params) {
    var origin = window.location.href.split('/pages/')[0];
    if (params == 0) {
        $('#ctlIcons img').each(function(i) {
            this.src = origin + '/images/ctrlogo/' + control_icons.status[0] + '/' + this.id + '.png';
        });
    } else {
        var count = 0,
            length = params.toString().length;
        params = params.toString();
        while (count < length) {
            var type = params.slice(count++, count);
            $('#' + control_icons.ids[length - count + 1]).attr('src', origin + '/images/ctrlogo/' + control_icons.status[parseInt(type)] + '/' + control_icons.icons[control_icons.ids[length - count + 1]])
        }
    }
};
var loseWSTime = window.setInterval(function() {
    if (Math.abs(infos['local_position_ned']['time_std_s'] - infos['local_position_ned']['loseWSTime']) > 100000) {
        document.getElementById('heartbeat.base_mode').innerHTML = '<span style="color:red">失去连接</span>';
        alert('抱歉，您已经失去了对该无人机的连接，请重新选择后重试');
        window.clearInterval(loseWSTime);
    } else if (Math.abs(infos['local_position_ned']['time_std_s'] - infos['local_position_ned']['loseWSTime']) > 20000) {
        document.getElementById('heartbeat.base_mode').innerHTML = '<span style="color:red">失去连接</span>';
        infos['local_position_ned']['loseWSTime'] += 3000;
    } else if (Math.abs(infos['local_position_ned']['time_std_s'] - infos['local_position_ned']['loseWSTime']) > 10000) {
        document.getElementById('heartbeat.base_mode').innerHTML = '<span style="color:yellow">丢失信号</span>';
        infos['local_position_ned']['loseWSTime'] += 3000;
    } else if (infos['local_position_ned']['time_std_s'] > 0) {
        infos['local_position_ned']['loseWSTime'] += 3000;
    }
}, 3000);
var realTimeData = function() {
    if (document.getElementById('heartbeat.id_uav_xyi').innerText) {
        window.location.href = '/pages/realtimedata.html?' + document.getElementById('heartbeat.id_uav_xyi').innerText;
    } else {
        window.location.href = '/pages/realtimedata.html?' + 1;
    }
};
var backToMain = function() {
    window.location.href = 'main.html';
}
var canvasDraw = function(vn, ve, beforevn, beforeve) {

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
var giveupControl = function() {
    if (confirm('确认放弃控制飞行器？')) {
        var length = 5;
        var ab = new ArrayBuffer(length);
        var buffer = new DataView(ab);
        buffer.setUint8(0, 252);
        buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'], LE);
        ws.send(buffer);
        console.log('give up control');
    }
};
var getControl = function() {
    var length = 5;
    var ab = new ArrayBuffer(length);
    var buffer = new DataView(ab);
    var result = '';
    buffer.setUint8(0, 253);
    buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'], LE);
    ws.send(buffer);
    console.log('get control');
}
$('#confirm #ok').on('click', function() {
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