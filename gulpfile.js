// Исходная папка и конечная папка
let project_folder = 'dist';
let source_folder = '#src';

// Переменная для подключения шрифтов к css
let fs = require('fs');

// Пути к файлом
let path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts",
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/script.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.ttf",
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
	},
	clean: "./" + project_folder + "/"
};

//Обозначение переменных
let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require("browser-sync").create(),
	del = require('del'),
	fileinclude = require('gulp-file-include'),
	scss = require('gulp-sass')(require('sass')),
	autoprefixer = require("gulp-autoprefixer"),
	groupmedia = require('gulp-group-css-media-queries'),
	cleancss = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify-es').default,
	imagesmin = require('gulp-imagemin'),
	webp = require("gulp-webp"),
	webphtml = require('gulp-webp-html'),
	webpcss = require('gulp-webpcss'),
	svgSprite = require('gulp-svg-sprite'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter');

// Лайв сервер
function browserSync(params) {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	})
}
// Обработка html
function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
};

// Обработка картинок
function images() {
	return src(path.src.img)
		.pipe(webp({
			quality: 90
		}))
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(imagesmin({
			progressive: true,
			svgPlugins: [{ removeViewBox: false }],
			interlaced: true,
			optimizationLevel: 3
		}))
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
};

// Обработка js
function js() {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(rename({
			extname: ".min.css"
		}))
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
};

// Обработка шрифтов
function fonts(params) {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts))
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))
}

// Обработка CSS
function css() {
	return src(path.src.css)
		.pipe(scss({ outputStyle: 'expanded' })).on('error', scss.logError)
		.pipe(groupmedia())
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(webpcss({ webpClass: '.webp', noWebpClass: '.no-webp' }))
		.pipe(dest(path.build.css))
		.pipe(cleancss())
		.pipe(rename({
			extname: ".min.css"
		}))
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
};

// Функция очистки папок
function clean(params) {
	return del(path.clean)
};

// работа с svg
gulp.task('svgSprite', function () {
	return gulp.src([source_folder + '/iconsprite/*.svg'])
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../icons/icons.svg',
					// example: true
				}
			}
		}))
		.pipe(dest(path.build.img))
})
// работа с otf шрифтами
gulp.task('otf2ttf', function () {
	return src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'))
}
);

// Функция подключения шрифтов к css
function fontsStyle(params) {
	let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}

// Callback функция
function cb() {

}

// Отслеживание файлов
function watchFiles(params) {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
}
// Сценарий выполнения 
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

// Переменные и gulp
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;