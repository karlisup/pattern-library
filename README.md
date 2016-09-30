# pattern-library
Tool for organizing pattern library and generating documentation.
```
$ cd wp-content/themes/starter-theme/
$ mkdir documentation-generator
$ cd documentation-generator/
$ git clone https://github.com/karlisup/component-library.git .
Cloning into '.'...
```

1. create 'pattern-library' directory in templates folder
2. and copy src (demo) folder contents in there.
This is the place from where documentation will be generated.
3. In gulpfile.js change:
```js
var src = '../templates/pattern-library/'
var dest = '../documentation/'
```
4. in documentation-generator folder run `npm install`
5. to generate documentation run `gulp`

```js
/* documentation task should look like this */
gulp.task('documentation', function (done) {
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
```
