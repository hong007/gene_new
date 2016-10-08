/**
 * Created by Administrator on 2016/6/2 0002.
 */
var formatDateFromInt = function(int,all){
    if(int){
        var now = new Date(parseInt(int) * 1000);
        if(all){
            var year=now.getFullYear(),
                month=(now.getMonth()<9)?'0'+(now.getMonth()+1):now.getMonth()+1,
                date=(now.getDate()<10)?'0'+(now.getDate()):now.getDate(),
                hour=(now.getHours()<10)?('0'+now.getHours()):now.getHours(),
                minute=(now.getMinutes()<10)?('0'+now.getMinutes()):now.getMinutes(),
                second=(now.getSeconds()<10)?('0'+now.getSeconds()):now.getSeconds();
            return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
        }else{
            var hour=(now.getHours()<10)?('0'+now.getHours()):now.getHours(),
                minute=(now.getMinutes()<10)?('0'+now.getMinutes()):now.getMinutes(),
                second=(now.getSeconds()<10)?('0'+now.getSeconds()):now.getSeconds();
            return hour+":"+minute+":"+second;
        }
    }else{
        return "";
    }
}
var setValueFromInfos = function (id1, id2, value, needTrueValue) {

    if (needTrueValue && needTrueValue == true) {
        $(document.getElementById(id1 + "." + id2)).text(value).attr('data-value', infos[id1][id2]);
    } else {
        $(document.getElementById(id1 + "." + id2)).text(infos[id1][id2]);
    }
}