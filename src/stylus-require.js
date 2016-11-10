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
 * @param  {String}     scopeNaming default: [name]__[local]___[hash:base64:5]
 * @return {Processor}  Postcss processor specified with which plugins to run on the generated css.
 */
function extractor(compileStylus, scopeNaming = '[name]__[local]___[hash:base64:5]') {
  const generateScopedName = genericNames(scopeNaming);
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
 * @param  {Function} preTransformer hook used to perform additional changes to the style before stylus compilation.
 * @param  {Function} postTrasformer hook used to perform actions after compilation.
 * @return {Object} Generated css scoped module names.
 */
function compileStylus(filename, preTransformer, postTrasformer, scopeNaming) {
  let css;
  let fileContent = readFileSync(filename, 'utf8', { filename });

  if (typeof preTransformer === 'function') {
    fileContent = preTransformer(fileContent);
  }

  css = stylus.render(fileContent);

  if (typeof postTrasformer === 'function') {
    css = postTrasformer(css);
  }

  result = extractor(compileStylus, scopeNaming).process(css, { from: filename });

  return result.root.tokens;
}

/**
 * This function specifies what node should do when it comes
 * accross `extention` in a file import.
 *
 * @method createStyleRequireHook
 * @param  {function} compile Handels the imported filename.
 * @param  {Function} preTransformer hook used to perform additional changes to the style before stylus compilation.
 * @param  {Function} postTrasformer hook used to perform actions after compilation.
 */
function createStyleRequireHook(styleCompiler, preTransformer, postTrasformer, scopeNaming) {
  require.extensions['.styl'] = function(module, filename) {
    const tokens = styleCompiler(filename, preTransformer, postTrasformer, scopeNaming);

    module._compile('module.exports = ' + JSON.stringify(tokens), filename);
  };
}

module.exports = function stylusRequire(scopeNaming) {
  return (preTransformer) => {
    return (postTrasformer) => {
      return createStyleRequireHook(
        compileStylus,
        preTransformer,
        postTrasformer,
        scopeNaming
      );
    }
  }
}
