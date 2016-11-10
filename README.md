# node-stylus-css-modules-require [![Build Status](https://travis-ci.org/JoelRoxell/node-stylus-css-modules-require.svg?branch=master)](https://travis-ci.org/JoelRoxell/node-stylus-css-modules-require)

Allows require to import css-module objects(tokens) from stylus files. The module provides a simple way to transform content before it’ll begin compiling. A post-hook is also available if any changes should be done after the stylus compiler finishes and before the generation of css-module tokens starts. All parameters are optional.

### install
`npm install --save node-stylus-css-modules-require`

### usage
```javascript
nodeStylusRequire(
  /* scope naming */
)(
  /* pre-transformer */
)(
  /* post-transformer */
);
```

```javascript
nodeStylusRequire('[name]__[local]___[hash:base64:5]')(
  function preTransformer(fileContent) {
    /* ... */
    return fileContent;
  }
)(
  function postTransformer(css) {
    /* ... */
    return css;
  }
);

const style = require('./some-style.styl');

```
