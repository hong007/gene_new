/**
 * Created by Quanta on 2016/7/14 0014.
 */
function CustomMarker(latlng, map, args) {
    this.latlng = latlng;
    this.args = args;
    this.setMap(map);
}

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.draw = function() {
    var self = this;
    var div = this.div;
    var id=this.args.id;
    var title=this.args.title;
    var deg=this.args.deg;
    if (!div) {
        div = this.div = document.createElement('div');
        var img = document.createElement('img');
        var span=document.createElement('span');
        img.src = '../images/uav/flight5.png';
        img.style.width = '100px';
        img.style.height = '100px';
        div.className = 'marker';
        div.style.position = 'absolute';
        div.style.cursor = 'pointer';
        div.style.width = '100px';
        div.style.height = '100px';
        div.setAttribute("title",title);
        span.setAttribute("id","spanId"+id);
        span.innerText = id;
        span.style.position = 'absolute';
        span.style.left = '43px';
        span.style.top = '45px';
        span.style.color = '#bbfbfc';
        span.style.width = '14px';
        span.style.display = 'block';
        span.style.textAlign = 'center';

        div.appendChild(img);
        div.appendChild(span);
        if (typeof(self.args.id) !== 'undefined') {
            div.id = self.args.id;
        }
        // google.maps.event.addDomListener(img, "click", function(event) {
        //     var object = flights[$(this).parent().attr('id')];
        //     var marker = object.marker;
        //     var info = object.info;
        //     if(marker.clicked){
        //         info.close();
        //         this.src = '../images/uav/flight1.png';
        //     }else{
        //         this.src = '../../images/airplanesel.png';
        //         info.refeash();
        //         info.open(map, marker);
        //     }
        //     marker.clicked = !marker.clicked;
        // });
        google.maps.event.addDomListener(div, "click", function(event) {
            // alert('You clicked on a custom marker!');           
            google.maps.event.trigger(self, "click");
        });
        
        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
    }
    // if(flights[self.args.id]['points'].length > 1){
    //     var e = flights[self.args.id]['points'][1].lng - flights[self.args.id]['points'][0].lng;
    //     var n = flights[self.args.id]['points'][1].lat - flights[self.args.id]['points'][0].lat;
    //     var deg = Math.atan2(e, n) * (180 / Math.PI);
    //     $(div).css('transform','rotate('+deg+'deg)');
    // }
    // console.log("this.latlng is",this.latlng);
    var point = this.getProjection().fromLatLngToDivPixel(this.latlng);
    // console.log(point);

    if (point) {
        div.style.left = point.x-50 + 'px';
        div.style.top = point.y-50 + 'px';
    }
};

CustomMarker.prototype.remove = function() {
    if (this.div) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
    }
};

CustomMarker.prototype.getPosition = function() {
    return this.latlng;
};
CustomMarker.prototype.setPosition = function(latLng) {
    if(this.div){
        this.latlng = new google.maps.LatLng(latLng);
        this.draw();
    }
};
CustomMarker.prototype.setRotate = function(deg) {
    if(this.div){
        $(this.div).css('transform','rotate('+deg+'deg)');
    }
};
