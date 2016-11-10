# node-stylus-css-modules-require [![Build Status](https://travis-ci.org/JoelRoxell/node-stylus-css-modules-require.svg?branch=master)](https://travis-ci.org/JoelRoxell/node-stylus-css-modules-require)

Allows `require` to import CSS-Module objects from `stylus` files.

### usage
```javascript
nodeStylusRequire(
  /* pre-transformer */
  function preTransformer(fileContent) {
    /* ... */
    return fileContent;
  }
)(
  /* post-transformer */
  function postTransformer(css) {
    /* ... */
    return css;
  }
);

const style = require('./some-style.styl');

```
