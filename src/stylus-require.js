// TODO: Create a more generic module transpiler.

const postcss = require('postcss');
const Values = require('postcss-modules-values');
const LocalByDefault = require('postcss-modules-local-by-default');
const ExtractImports = require('postcss-modules-extract-imports');
const Scope = require('postcss-modules-scope');
const Parser = require('postcss-modules-parser');
const genericNames = require('generic-names');
const stylus = require('stylus');
const { readFileSync } = require('fs');
const prependStyleLoader = require('prepend-style-loader');

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
function compileStylus(filename, prepend) {
  let fileContent = readFileSync(filename, 'utf8', { filename });

  // TODO: pre-transformer hook
  if (prepend.length > 0) {
    fileContent = prependStyleLoader.apply({
      query: 'prepend=[' + prepend.toString() +']',
      cacheable: function() {}
    }, [fileContent]);
  }

  // TODO: compile hook
  const css = stylus.render(fileContent);

  // TODO: post-compile hook
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
function createStyleRequireHook(styleCompiler, extension, prependFiles) {
  require.extensions[extension] = function(module, filename) {
    const tokens = styleCompiler(filename, prependFiles);

    module._compile('module.exports = ' + JSON.stringify(tokens), filename);
  };
}

module.exports = function stylusRequire(prenedFiles = []) {
  return (transformer) => {
    return (postTrasformer) => {
      return createStyleRequireHook(
        compileStylus,
        '.styl',
        prenedFiles,
        transformer,
        postTrasformer
      );
    }
  }
}
