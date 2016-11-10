const expect = require('chai').expect;
const prependStyleLoader = require('prepend-style-loader');

const nodeStylusRequire = require('../src');

nodeStylusRequire(
  /* pre-tranformer */
  function preTransformer(fileContent) {
    fileContent = prependStyleLoader.apply({
     query: 'prepend=[tests/variables.styl]',
     cacheable: function() {}
   }, [fileContent]);

    return fileContent;
  }
)(
  /* post-tranformer */
  function postTrasformer(css) {
    return css;
  }
);

describe('node-stylus-css-module-require', function() {
  it('should load a style sheet', function() {
    const style = require('./isolate-style.styl');

    expect(style.app).to.exist;
  });

  it('should load second style sheet', function() {
    const style = require('./another-isolated-style.styl');

    expect(style.wrapper).to.exist;
  });
});
