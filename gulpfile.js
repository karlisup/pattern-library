// setting general settings
var src = '/pattern-library/'
var dest = '/documentation/'
var tmplEngine = '.twig'

// gulp general modules
var gulp = require('gulp')
var sass = require('gulp-sass')
var postcss = require('gulp-postcss')
var autoprefixer = require('autoprefixer')
var browserSync = require('browser-sync').create()
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var styleguide = require('component-library-core')

/* -------------------------------------
  Gulp tasks
------------------------------------- */

// STYLEGUIDE
gulp.task('styleguide', function (done) {
  styleguide({
    location: {
      src: src + '/components/',
      dest: dest + '/components/',
      styleguide: src + '/styleguide/'
    },
    extensions: {
      template: tmplEngine
    }
  })
})

// STYLE
gulp.task('style', function (done) {
  var processors = [
    autoprefixer({browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']})
  ]
  return gulp.src(src + '/style/style.scss')
    .pipe(sass({
      sourceComments: true
    }).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest(dest + '/assets/css/'))
    .pipe(browserSync.stream())
})

// JAVASCRIPT
gulp.task('javascript', function (done) {
  return gulp.src(src + '/components/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(concat('components.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest + '/assets/js/'))
})

// SERVER
gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: dest
    },
    port: 9999,
    open: false,
    notify: false
  })
})

/* ----------------------------------------------
  STYLE & JAVASCRIPT generation for Documentation
------------------------------------------------- */
// generate documentation javascript on gulp:default
gulp.task('javascript:documentation', function (done) {
  return gulp.src([
    src + '/styleguide/js/*.js', // vendor
    src + '/styleguide/themes/github/components/**/*.js' // theme related js
  ])
    .pipe(sourcemaps.init())
      .pipe(concat('styleguide.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest + '/assets/js/component-library/'))
})

// generate documantation style on gulp:default
gulp.task('style:documentation', function (done) {
  var processors = [
    autoprefixer({browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']})
  ]
  return gulp.src(src + '/styleguide/style/styleguide.scss')
    .pipe(sass({
      sourceComments: true
    }).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest(dest + '/assets/css/'))
})

/* ----------------------------------------------
  WATCH
------------------------------------------------- */

gulp.task('watch', function (done) {
  gulp.watch(src + '/components/**/*.{json,md,markdown,twig}', ['styleguide']) //, browserSync.reload)
  gulp.watch([src + '/components/**/*.scss', src + '/style/**/*.scss'], ['style'])
  gulp.watch(src + '/components/**/*.js', ['javascript'])
})

// DEFAULT
gulp.task('default', ['style:documentation', 'javascript:documentation', 'watch', 'styleguide', 'style', 'browser-sync'])
