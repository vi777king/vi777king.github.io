"use strict"
const isDevelop = true;

const 
	gulp = require('gulp'),
	del = require('del'),
	prefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	less = require('gulp-less'),
	sourcemaps = require('gulp-sourcemaps'),
	rigger = require('gulp-rigger'),
	cssmin = require('gulp-clean-css'),
	gcmq = require('gulp-group-css-media-queries'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	mozjpeg = require('imagemin-mozjpeg'),
	svgmin = require('gulp-svgmin'),
	cheerio = require('gulp-cheerio'),
	svgSprite = require('gulp-svg-sprite'),
	replace = require('gulp-replace'),
	browserSync = require("browser-sync").create(),
	reload = browserSync.reload,
	plumber = require('gulp-plumber');


const path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/style/main.less',
		img: ['src/img/**/*.jpg', 'src/img/**/*.gif', 'src/img/**/*.png'], 
		svg: 'src/img/**/*.svg',
		// вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.less',
        img: ['src/img/**/*.jpg', 'src/img/**/*.gif', 'src/img/**/*.png'],
		svg: 'src/img/**/*.svg',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

const config = {
    server: {
        baseDir: "./build"
    }
};

function htmlBuild (done) {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
	.pipe(rigger()) //Прогоним через rigger
	.pipe(plumber())
    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
    done();
}

function jsBuild (done) {
	if(isDevelop){
		gulp.src(path.src.js) //Найдем наш main файл
		.pipe(rigger()) //Прогоним через rigger
		.pipe(plumber())
	    .pipe(sourcemaps.init()) //Инициализируем sourcemap
	    .pipe(uglify()) //Сожмем наш js
	    .pipe(sourcemaps.write()) //Пропишем карты
	    .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
	    .pipe(reload({stream: true})); //И перезагрузим сервер
	    done();
	}
	else {
		gulp.src(path.src.js) //Найдем наш main файл
		.pipe(rigger()) //Прогоним через rigger
		.pipe(plumber())
	    .pipe(uglify()) //Сожмем наш js
	    .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
	    .pipe(reload({stream: true})); //И перезагрузим сервер
	    done();
	}
}

function styleBuild (done) {
	if(isDevelop){
		gulp.src(path.src.style) //Выберем наш main.less
		.pipe(plumber())
	    .pipe(less()) //Скомпилируем
	    .pipe(gulp.dest(path.build.css)) //И в build
	    .pipe(reload({stream: true}));
	    done();
	}
	else {
		gulp.src(path.src.style) //Выберем наш main.less
		.pipe(plumber())
		.pipe(sourcemaps.init()) //Инициализируем sourcemap
		.pipe(less()) //Скомпилируем
		.pipe(prefixer()) //Добавим вендорные префиксы
	    .pipe(gcmq()) // Сгруппируем медиа-запросы
	    .pipe(cssmin()) //Сожмем
	    .pipe(sourcemaps.write()) //Пропишем карты
	    .pipe(gulp.dest(path.build.css)) //И в build
	    .pipe(reload({stream: true}));
	    done();
	}
}

// Таск для сборки картинок
function imageBuild (done) {
	if(isDevelop) {
		gulp.src(path.src.img) //Выберем наши картинки
		.pipe(gulp.dest(path.build.img)) //И бросим в build
		.pipe(reload({stream: true}));
		done();
	}
	else {
		gulp.src(path.src.img) //Выберем наши картинки
		.pipe(plumber())
		.pipe(
			imagemin([
				imagemin.gifsicle({
					interlaced: true,
					optimizationLevel: 3
				}),
				pngquant({
					quality: [0.3, 0.5],
					verbose: true
				}),
				mozjpeg({
					quality: 70
				}),
				imagemin.svgo({
					plugins: [
						{removeViewBox: true},
						{cleanupIDs: false}
					]
				})
			], {progressive: true})
		)
		.pipe(gulp.dest(path.build.img)) //И бросим в build
		.pipe(reload({stream: true}));
		done();
	}
}

function svgBuild(done) {
	return gulp.src(path.src.svg)
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parseOptions: {xmlMode: true}
		}))
		.pipe(replace('&gt', '>'))
		.pipe(svgSprite(
			{
				mode: {
					symbol: {
						sprite: 'sprite.svg'
					}
				}
			}))
		.pipe(gulp.dest(path.build.img)) //И бросим в build
		.pipe(reload({stream: true}))
		done();
}

function fontsBuild (done) {
    gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
    done();
}

function watch (done){
    browserSync.init(config);
    gulp.watch(path.watch.html, htmlBuild);
    gulp.watch(path.watch.style, styleBuild);
    gulp.watch(path.watch.js, jsBuild);
    gulp.watch(path.watch.img, imageBuild);
	gulp.watch(path.watch.svg, svgBuild);
    gulp.watch(path.watch.fonts, fontsBuild);
    done();
}

gulp.task('build', gulp.parallel(
		htmlBuild,
	    jsBuild,
	    styleBuild,
	    fontsBuild,
	    imageBuild,
		svgBuild
	)
);

gulp.task('del', function () {
	return del('build');
});

gulp.task('default', gulp.series('build', watch));