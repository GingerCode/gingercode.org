'use strict';

var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    debug = require('gulp-debug'),
    replace = require('gulp-replace'),
    jasmine = require('gulp-jasmine');

gulp.task('client-generation', function () {
    return gulp.src('gingercode.js')
        .pipe(debug({title: 'client-generation (Scope):'}))
        .pipe(replace(/module.exports = {(.|\n)*?};/, ''))
        .pipe(gulp.dest('client'));
});

gulp.task('test', function () {
    gulp.src('test/spec.js')
        .pipe(debug({title: 'test (Scope):'}))
        .pipe(jasmine())
});


gulp.task('lint', function() {
    var filesToLint = [
        '**/*.js',
        '!tests/protractor.conf.js',
        '!dist/**/*',
        '!docs/**/*',
        '!node_modules/**/*',
        '!tmp/**/*',
        '!coverage/**/*'
    ];

    return gulp.src(filesToLint)
            .pipe(debug({title: 'eslint (Scope):'}))
            .pipe(eslint())
            .pipe(eslint({fix:true}))
            .pipe(eslint.format())
            .pipe(gulp.dest('.'));
});