// TODO: Create a more generic module transpiler and perform asyn reads.
const postcss = require('postcss');
const Values = require('postcss-modules-values');
const LocalByDefault = require('postcss-modules-local-by-default');
const ExtractImports = require('postcss-modules-extract-imports');
const Scope = require('postcss-modules-scope');
const Parser = require('postcss-modules-parser');
const genericNames = require('generic-names');
const stylus = require('stylus');
const { readFileSync } = require('fs');

let result;

/**
 * Specify post css plugins and process the generated css.
 *
 * @method extractor
 * @param  {Function}   compileStylus function which generates the css.
 * @return {Processor}  Postcss processor specified with which plugins to run on the generated css.
 */
function extractor(compileStylus) {
  const generateScopedName = genericNames('[name]__[local]___[hash:base64:5]');

  const plugins = ([
    Values,
    LocalByDefault,
    ExtractImports,
    new Scope({ generateScopedName })
  ]).concat(new Parser({ compileStylus }));

  return postcss(plugins);
}

/**
 * Reads and parses the required file through the stylus compiler. In order to receive valid css.
 *
 * @method compileStylus
 * @param  {String} filename Path to the require file.
 * @return {Object} Generated css scoped module names.
 */
function compileStylus(filename, preTransformer, postTrasformer) {
  let css;
  // FIXME: Read files async.
  let fileContent = readFileSync(filename, 'utf8', { filename });

  if (typeof preTransformer === 'function') {
    fileContent = preTransformer(fileContent);
  }

  css = stylus.render(fileContent);

  if (typeof postTrasformer === 'function') {
    css = postTrasformer(css);
  }

  result = extractor(compileStylus).process(css, { from: filename });

  return result.root.tokens;
}

/**
 * This function specifies what node should do when it comes
 * accross `extention` in a file import.
 *
 * @method createStyleRequireHook
 * @param  {function} compile Handels the imported filename.
 * @param  {String}   extension Specifes what type of file `compile` should be used on.
 */
function createStyleRequireHook(styleCompiler, preTransformer, postTrasformer) {
  require.extensions['.styl'] = function(module, filename) {
    const tokens = styleCompiler(filename, preTransformer, postTrasformer);

    module._compile('module.exports = ' + JSON.stringify(tokens), filename);
  };
}

module.exports = function stylusRequire(preTransformer) {
  return (postTrasformer) => {
    return createStyleRequireHook(
      compileStylus,
      preTransformer,
      postTrasformer
    );
  }
}
