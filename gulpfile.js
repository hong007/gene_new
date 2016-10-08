/**
 * Created by hongty on 16/10/8.
 */
    //引入插件
var gulp = require('gulp');
var connect = require('gulp-connect');


//使用connect启动一个Web服务器
gulp.task('connect', function () {
    connect.server({
        root: 'src',
        livereload: true
    });
});

gulp.task('html', function () {
    gulp.src('./src/**/*.html')
        .pipe(connect.reload());
});
gulp.task('css', function () {
    gulp.src('./src/**/*.css')
        .pipe(connect.reload());
});

//创建watch任务去检测html文件,其定义了当html改动之后，去调用一个Gulp的Task
gulp.task('watch', function () {
    gulp.watch(['./src/**/*.html'], ['html']);
    gulp.watch(['./src/**/*.css'], ['css']);
});

//运行Gulp时，默认的Task∂∂∂
gulp.task('default', ['connect', 'watch']);