/**
 * Created by Administrator on 2016/6/16 0016.
 */
//common params
var system_status_flag = {
    0: '离线', 1: '上线', 2: '装订', 52: '待飞', 3: '起飞', 4: '爬升', 5: '航路', 55: '识别', 6: '下降', 7: '投放', 8: '返航爬升', 9: '返航航路', 10: '返航下降',
    11: '着陆', 18: '完毕', 20: '悬停等待',
    30: '应急航路', 31: '应急下降', 32: '应急着陆',33:'人工操控',34:'遥控'
};
var control_icons = {
    icons: {
        mmc: '/mmc.png',
        fc: '/fc.png',
        '3g': '/3g.png',
        local: '/local.png',
        camera: '/camera.png',
        ultrasonic: '/ultrasonic.png',
        b1: '/mmc.png',
        b2: '/mmc.png'
    },
    status: ['ok', 'error', 'warning', 'nor'],
    ids: ['mmc', 'fc', 'b1', 'ultrasonic', 'camera', 'b2', 'local', '3g']
};
var mission_ack_flag = {
    0: ['任务加载成功'],
    1: ['任务加载失败'],
    2: ['坐标系不支持'],
    3: ['指令不支持'],
    4: ['航路点越界'],
    5: ['非法参数1'],
    6: ['非法参数2'],
    7: ['任务拒绝']
};
var command_ack_flag = {
    0: ['执行成功'],
    1: ['临时拒绝'],
    2: ['永久拒绝'],
    3: ['不支持'],
    4: ['执行失败']
};
var command_flag = {
    1: ['开始起飞'],
    2: ['应急着陆']
};
/* 服务相关 */
// var server = 'ws://121.40.103.198:443/',ws;
//var server = 'ws://121.40.103.198:8848/',ws;
// var server = 'ws://121.199.53.63:443/',ws;
var server = 'ws://g1.xyitech.com:443/',ws;

var LE = true;
var pointurl='http://g1.xyitech.com:9999/';
// var pointurl='http://121.199.53.63:9999/';