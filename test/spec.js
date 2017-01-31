var gingercode = require('../gingercode.js');
var fs = require('fs');

beforeEach(function () {
    jasmine.addMatchers(require('jasmine-diff-matchers').diffChars);
});


describe("General Conversion", function() {
  var full_features_ginger = fs.readFileSync('./test/asserts/full_features.ginger', 'utf8');
  var full_features_js = fs.readFileSync('./test/asserts/full_features.js', 'utf8');
  
  it("Full example", function() {
            expect(gingercode.compile(full_features_ginger)).diffChars(full_features_js);
  });
});