const expect = require('chai').expect;

const nodeStylusRequire = require('../src');

describe('node-stylus-css-module-require', function() {
  it('should init the hook with correct parameters', function() {
    nodeStylusRequire(
      /* post-tranformer */
    )(
      /* post-tranformer */
    )(
      /* init */
    );

    const style = require('./isolate-style.styl');

    console.log('_____');
    console.log(style);
    console.log('_____');
  });
});
