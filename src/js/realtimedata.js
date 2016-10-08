/**
 * Created by Administrator on 2016/6/2 0002.
 */
if(window.location.search.split('?')[1]){
    document.getElementById('heartbeat.id_uav_xyi').innerText = window.location.search.split('?')[1];
}else{
    alert('操作有误，查找不到对应的无人机');
}
var infos = {
    heartbeat: {
        id_iso_xyi: '',
        system_status: '',
        xylink_version: '',
        base_mode: ''
    },
    battery_status: {
        time_std_s: [],
        voltages: [],
        current_battery: [],
        battery_remaining: [],
        data_x_value: $('#battery_status_x option[selected]').text() + $('#battery_status_x option[selected]').attr('data-others'),
        data_x_key: document.getElementById('battery_status_x').value,
        data_y_value: $('#battery_status_y option[selected]').text() + $('#battery_status_y option[selected]').attr('data-others'),
        data_y_key: document.getElementById('battery_status_y').value
    },
    local_position_ned: {
        time_std_s: [],
        x: [],
        y: [],
        z: [],
        vx: [],
        vy: [],
        vz: [],
        dis_m: [],
        data_x_value: $('#local_position_ned_x option[selected]').text() + $('#local_position_ned_x option[selected]').attr('data-others'),
        data_x_key: document.getElementById('local_position_ned_x').value,
        data_y_value: $('#local_position_ned_y option[selected]').text() + $('#local_position_ned_y option[selected]').attr('data-others'),
        data_y_key: document.getElementById('local_position_ned_y').value,
        time_std_s_start:Date.parse(new Date())/1000,
        loseWSTime:Date.parse(new Date())/1000
    },
    global_position_int: {
        time_std_s: [],
        relative_alt: [],
        hdg: [],
        data_x_value: $('#global_position_int_x option[selected]').text() + $('#global_position_int_x option[selected]').attr('data-others'),
        data_x_key: document.getElementById('global_position_int_x').value,
        data_y_value: $('#global_position_int_y option[selected]').text() + $('#global_position_int_y option[selected]').attr('data-others'),
        data_y_key: document.getElementById('global_position_int_y').value
    },
    gps_raw: {
        time_std_s: [],
        fix_type: [],
        lat_gps: [],
        lon_gps: [],
        alt_gps: [],
        eph: [],
        epv: [],
        vel_gps: [],
        cog: [],
        satellites_visible: [],
        data_x_value: $('#gps_raw_x option[selected]').text() + $('#gps_raw_x option[selected]').attr('data-others'),
        data_x_key: document.getElementById('gps_raw_x').value,
        data_y_value: $('#gps_raw_y option[selected]').text() + $('#gps_raw_y option[selected]').attr('data-others'),
        data_y_key: document.getElementById('gps_raw_y').value
    },
};
// 电池状态分析
var battery_status = echarts.init(document.getElementById('battery_status'));
var battery_status_option = {
    /*backgroundColor:'rgba(4, 33, 54, 0.6)',*/
    title: {
        text: '电池状态分析',
        x: 'left'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            animation: false
        }
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            start: 30,
            end: 70
        }
    ],
    xAxis: {
        name: infos.battery_status.data_x_value,
        type: 'category',
        boundaryGap: false,
        axisLine: {onZero: true},
        data: infos.battery_status[infos.battery_status.data_x_key]
    },
    yAxis: {
        name: infos.battery_status.data_y_value,
        type: 'value'
    },
    series: [{
        name: infos.battery_status.data_y_value,
        type: 'line',
        symbolSize: 8,
        hoverAnimation: false,
        data: infos.battery_status[infos.battery_status.data_y_key]
    }]
};

// 使用刚指定的配置项和数据显示图表。
battery_status.setOption(battery_status_option);


// 相对坐标分析
var local_position_ned = echarts.init(document.getElementById('local_position_ned'));
var local_position_ned_option = {
    title: {
        text: '相对坐标分析',
        x: 'left'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            animation: false
        }
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            start: 30,
            end: 70
        }
    ],
    xAxis: {
        name: infos.local_position_ned.data_x_value,
        type: 'category',
        boundaryGap: false,
        axisLine: {onZero: true},
        data: infos.local_position_ned[infos.local_position_ned.data_x_key]
    },
    yAxis: {
        name: infos.local_position_ned.data_y_value,
        type: 'value'
    },
    series: [{
        name: infos.local_position_ned.data_y_value,
        type: 'line',
        symbolSize: 8,
        hoverAnimation: false,
        data: infos.local_position_ned[infos.local_position_ned.data_y_key]
    }]
};
local_position_ned.setOption(local_position_ned_option);


// 绝对坐标分析
var global_position_int = echarts.init(document.getElementById('global_position_int'));
var global_position_int_option = {
    title: {
        text: '绝对坐标分析',
        x: 'center'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            animation: false
        }
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            start: 30,
            end: 70
        }
    ],
    xAxis: {
        name: infos.global_position_int.data_x_value,
        type: 'category',
        boundaryGap: false,
        axisLine: {onZero: true},
        data: infos.global_position_int[infos.global_position_int.data_x_key]
    },
    yAxis: {
        name: infos.global_position_int.data_y_value,
        type: 'value'
    },
    series: [{
        name: infos.global_position_int.data_y_value,
        type: 'line',
        symbolSize: 8,
        hoverAnimation: false,
        data: infos.global_position_int[infos.global_position_int.data_y_key]
    }]
};
global_position_int.setOption(global_position_int_option);


// GPS数据分析
var gps_raw = echarts.init(document.getElementById('gps_raw'));
var gps_raw_option = {
    title: {
        text: 'GPS数据分析',
        x: 'center'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            animation: false
        }
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            start: 30,
            end: 70
        }
    ],
    xAxis: {
        name: infos.gps_raw.data_x_value,
        type: 'category',
        boundaryGap: false,
        axisLine: {onZero: true},
        data: infos.gps_raw[infos.gps_raw.data_x_key]
    },
    yAxis: {
        name: infos.gps_raw.data_y_value,
        type: 'value'
    },
    series: [{
        name: infos.gps_raw.data_y_value,
        type: 'line',
        symbolSize: 8,
        hoverAnimation: false,
        data: infos.gps_raw[infos.gps_raw.data_y_key]
    }]
};
gps_raw.setOption(gps_raw_option);
$('select').on('change', function () {
    var params = infos[$(this).attr('data-target')], options = $(this).children();
    if ($(this).hasClass('X')) {
        if (params['data_x_key'] != $(this).val()) {
            params['data_x_key'] = $(this).val();
            options.each(function () {
                if ($(this).val() == params['data_x_key']) {
                    params['data_x_value'] = $(this).text() + $(this).attr('data-others');
                    return;
                }
            });
        }
    } else {
        if (params['data_y_key'] != $(this).val()) {
            params['data_y_key'] = $(this).val();
            options.each(function () {
                if ($(this).val() == params['data_y_key']) {
                    params['data_y_value'] = $(this).text() + $(this).attr('data-others');
                    return;

                }
            });
        }
    }
    if ($(this).attr('data-target').toLowerCase() == 'gps_raw') {
        resetData(gps_raw, infos.gps_raw);
    } else if ($(this).attr('data-target').toLowerCase() == 'global_position_int') {
        resetData(global_position_int, infos.global_position_int);
    } else if ($(this).attr('data-target').toLowerCase() == 'local_position_ned') {
        resetData(local_position_ned, infos.local_position_ned);
    } else if ($(this).attr('data-target').toLowerCase() == 'battery_status') {
        resetData(battery_status, infos.battery_status);
    }
});

var resetData = function (target, params) {
    target.setOption({
        xAxis: {
            name: params.data_x_value,
            data: params[params.data_x_key]
        },
        yAxis: {
            name: params.data_y_value,
        },
        series: [{
            name: params.data_y_value,
            data: params[params.data_y_key]
        }]
    });
};
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
        var length = 7;
        if(infos['token']){
            token = infos['token'];
            var ab = new ArrayBuffer(length);
            var buffer = new DataView(ab);
            var result = '';
            buffer.setUint8(0, 249);
            buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'],LE);
            buffer.setUint16(5, token.length, LE);
            for(var i=0;i<token.length;i++){
                buffer.setUint8(7+i, token[i].charCodeAt());
            }
            ws.send(buffer);
        }else{
            var ab = new ArrayBuffer(length);
            var buffer = new DataView(ab);
            var result = '';
            buffer.setUint8(0, 249);
            buffer.setInt32(1, infos['heartbeat']['id_uav_xyi'],LE);
            buffer.setUint16(5, 0, LE);
            ws.send(buffer);
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
        var msgid = dv.getUint8(begin);
        if (msgid == 1) {
            //heartbeat解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText*1) {
                infos['heartbeat'] = {};
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
            setValueFromInfos('heartbeat', 'id_iso_xyi');
            setValueFromInfos('heartbeat', 'system_status');
            setValueFromInfos('heartbeat', 'xylink_version');
            setValueFromInfos('heartbeat', 'base_mode', system_status_flag[infos.heartbeat.base_mode], true);
        } else if (msgid == 2) {
            //battery_status解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText*1) {
                begin += 1;

                /* 20160529新协议，增加time_std_s*/
                infos['battery_status']['time_std_s'].push('' + formatDateFromInt(dv.getUint32(begin, LE)));
                begin += 4;
                /* 20160529新协议，增加time_std_s*/
                infos['battery_status']['voltages'] = [];
                for (var i = 0; i < 10; i++) {
                    infos['battery_status']['voltages'][i] = dv.getUint16(begin, LE);
                    begin += 2;
                }
                infos['battery_status']['current_battery'].push(dv.getInt16(begin, LE));
                begin += 2;
                infos['battery_status']['battery_remaining'].push(dv.getInt8(begin));
                begin += 1;
                resetData(battery_status, infos.battery_status);
            }
        } else if (msgid == 3) {
            //local_position_ned解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText*1) {
                begin += 1;
                infos['local_position_ned']['time_std_s'].push(formatDateFromInt(dv.getUint32(begin, LE)));
                infos['local_position_ned']['time_std_s_start'] = dv.getUint32(begin, LE);
                infos['local_position_ned']['loseWSTime'] = infos['local_position_ned']['time_std_s_start'];
                begin += 4;
                infos['local_position_ned']['x'].push(dv.getFloat32(begin, LE).toFixed(2));
                begin += 4;
                infos['local_position_ned']['y'].push(dv.getFloat32(begin, LE).toFixed(2));
                begin += 4;
                infos['local_position_ned']['z'].push(dv.getFloat32(begin, LE).toFixed(2));
                begin += 4;
                infos['local_position_ned']['vx'].push(dv.getFloat32(begin, LE).toFixed(2));
                begin += 4;
                infos['local_position_ned']['vy'].push(dv.getFloat32(begin, LE).toFixed(2));
                begin += 4;
                infos['local_position_ned']['vz'].push(dv.getFloat32(begin, LE).toFixed(2));
                begin += 4;
                infos['local_position_ned']['dis_m'].push(dv.getFloat32(begin, LE).toFixed(1));
                begin += 4;
                resetData(local_position_ned, infos.local_position_ned);
            }
        } else if (msgid == 4) {
            //global_position_int解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText*1) {
                begin += 1;

                infos['global_position_int']['time_std_s'].push(formatDateFromInt(dv.getUint32(begin, LE)));
                begin += 4;
                infos['global_position_int']['relative_alt'].push(dv.getInt32(begin, LE)/1000);
                begin += 4;
                infos['global_position_int']['hdg'].push(dv.getUint16(begin, LE)/100);
                begin += 2;
                resetData(global_position_int, infos.global_position_int);
            }
        } else if (msgid == 5) {
            //gps_raw解析
            begin += 1;
            if (dv.getUint8(begin) == document.getElementById('heartbeat.id_uav_xyi').innerText*1) {
                begin += 1;

                infos['gps_raw']['time_std_s'].push(formatDateFromInt(dv.getUint32(begin, LE)));
                begin += 4;
                infos['gps_raw']['fix_type'].push(dv.getUint8(begin));
                begin += 1;
                var lat = parseFloat(dv.getInt32(begin, LE)) / 1E7
                infos['gps_raw']['lat_gps'].push(lat);
                begin += 4;
                var lon = parseFloat(dv.getInt32(begin, LE)) / 1E7
                infos['gps_raw']['lon_gps'].push(lon);
                begin += 4;
                var alt = parseFloat(dv.getInt32(begin, LE)) / 1E7
                infos['gps_raw']['alt_gps'].push(alt);
                begin += 4;
                infos['gps_raw']['eph'].push(dv.getUint16(begin, LE));
                begin += 2;
                infos['gps_raw']['epv'].push(dv.getUint16(begin, LE));
                begin += 2;
                infos['gps_raw']['vel_gps'].push(dv.getUint16(begin, LE));
                begin += 2;
                infos['gps_raw']['cog'].push(dv.getUint16(begin, LE));
                begin += 2;
                infos['gps_raw']['satellites_visible'].push(dv.getUint8(begin));
                begin += 1;
                resetData(gps_raw, infos.gps_raw);
            }
        }  else if (msgid == 254) {
            //gps_raw解析
            begin += 1;
            var id = dv.getInt32(begin,LE);
            if (id == document.getElementById('heartbeat.id_uav_xyi').innerText*1) {
                begin += 4;
                var type = dv.getUint8(begin);
                if (type==0) {
                    document.getElementById('heartbeat.loseWSTime').innerHTML = '<span style="color:red;font-weight: bold;">连接已断开...</span>';
                }else if(type==2){
                    document.getElementById('heartbeat.loseWSTime').innerHTML = '<span style="color:orange;">连接失败，正在重新连接...</span>';
                }else{
                    document.getElementById('heartbeat.loseWSTime').innerHTML = '<span style="color:green;">正常</span>';
                }
            }
        } else {
            console.error('Msgid=' + msgid + ' is not found!');
        }
    };
    ws.onclose = function () {
        console.log('websocket disconnected, prepare reconnect');
        ws = null;
        setTimeout(connect, 100);
    };
}
connect();
/*
var loseWSTime = window.setInterval(function () {
    if(Math.abs(infos['local_position_ned']['time_std_s_start'] - infos['local_position_ned']['loseWSTime']) > 100000){
        document.getElementById('heartbeat.loseWSTime').innerHTML = '<span style="color:red;font-weight: bold;">连接已断开...</span>';
        alert('抱歉，您已经失去了对该无人机的连接，请重新选择后重试');
        window.clearInterval(loseWSTime);
    }else if(Math.abs(infos['local_position_ned']['time_std_s_start'] - infos['local_position_ned']['loseWSTime']) > 20000){
        document.getElementById('heartbeat.loseWSTime').innerHTML = '<span style="color:red;">失去连接</span>';
        infos['local_position_ned']['loseWSTime'] += 3000;
    }else if(Math.abs(infos['local_position_ned']['time_std_s_start'] - infos['local_position_ned']['loseWSTime']) > 9000){
        document.getElementById('heartbeat.loseWSTime').innerHTML = '<span style="color:orange;">连接失败，正在重新连接...</span>';
        infos['local_position_ned']['loseWSTime'] += 3000;
    }else if(infos['local_position_ned']['time_std_s_start'] && infos['local_position_ned']['time_std_s'].length > 0){
        document.getElementById('heartbeat.loseWSTime').innerHTML = '<span style="color:green;">正常</span>';
        infos['local_position_ned']['loseWSTime'] += 3000;
    }else{
        document.getElementById('heartbeat.loseWSTime').innerHTML = '<span style="color:grey;">未连接</span>';
    }
},3000);*/
