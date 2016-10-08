/**
 * Created by Administrator on 2016/7/1 0001.
 */
var NAV_GPS = [120.001524, 30.279998];
var map,polyLine,lineArr = [],clickPointLatLng;
lineArr.push({lng:NAV_GPS[0],lat:NAV_GPS[1]});
var common = {
    colors: {
        PointLine: '#e63f00',
        FlightLine: '#1188fa'
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('container'), {
        center: {lat: NAV_GPS[1], lng: NAV_GPS[0]},
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM,
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
        },
        zoom: 13
    });
    polyLine = new google.maps.Polyline({
        map: map,
        path: lineArr,
        strokeColor: common.colors.PointLine,
        strokeOpacity: 1,
        strokeWeight: 3,
        strokeStyle: "solid"
    });
}
initMap();
$('#search').on('click',function () {
    if($('#id').val()){

    }else{
        alert('请输入唯一标识');
    }
});
