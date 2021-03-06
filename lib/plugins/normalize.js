const { isPlainObject, isFunction, noop, cloneDeep, omit } = require('lodash');
const debug = require('debug')('semantic-release:plugins');
const getError = require('../get-error');
const { extractErrors } = require('../utils');
const PLUGINS_DEFINITIONS = require('../definitions/plugins');
const { loadPlugin, parseConfig } = require('./utils');

module.exports = (context, type, pluginOpt, pluginsPath) => {
  const { stdout, stderr, options } = context;
  if (!pluginOpt) {
    return noop;
  }

  const [name, config] = parseConfig(pluginOpt);
  const pluginName = name.pluginName ? name.pluginName : isFunction(name) ? `[Function: ${name.name}]` : name;
  const plugin = loadPlugin(context, name, pluginsPath);

  debug(`options for ${pluginName}/${type}: %O`, config);

  let func;
  if (isFunction(plugin)) {
    func = plugin.bind(null, cloneDeep({ ...options, ...config }));
  } else if (isPlainObject(plugin) && plugin[type] && isFunction(plugin[type])) {
    func = plugin[type].bind(null, cloneDeep({ ...options, ...config }));
  } else {
    throw getError('EPLUGIN', { type, pluginName });
  }

  const validator = async (input) => {
    const { dryRun, outputValidator } = PLUGINS_DEFINITIONS[type] || {};
    try {
      if (!input.options.dryRun || dryRun) {
        console.log(`Start step "${type}" of plugin "${pluginName}"`);
        const result = await func({
          ...cloneDeep(omit(input, ['stdout', 'stderr', 'logger'])),
          stdout,
          stderr,
        });
        if (outputValidator && !outputValidator(result)) {
          throw getError(`E${type.toUpperCase()}OUTPUT`, { result, pluginName });
        }

        console.log(`Completed step "${type}" of plugin "${pluginName}"`);
        return result;
      }

      console.warn(`Skip step "${type}" of plugin "${pluginName}" in dry-run mode`);
    } catch (error) {
      console.error(`Failed step "${type}" of plugin "${pluginName}"`);
      extractErrors(error).forEach((err) => Object.assign(err, { pluginName }));
      throw error;
    }
  };

  Reflect.defineProperty(validator, 'pluginName', { value: pluginName, writable: false, enumerable: true });

  if (!isFunction(pluginOpt)) {
    if (pluginsPath[name]) {
      console.log(`Loaded plugin "${type}" from "${pluginName}" in shareable config "${pluginsPath[name]}"`);
    } else {
      console.log(`Loaded plugin "${type}" from "${pluginName}"`);
    }
  }

  return validator;
};
