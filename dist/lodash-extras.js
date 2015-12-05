(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Collection of all the utils in here. Add to this as you go.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var lodashUtils = {};

/**
 * Helper for JS types and defaults for each type
 *
 * @method typeDefaults
 * @return {PlainObject}
 */
var typeDefaults = function typeDefaults() {
  return {
    'String': '',
    'Array': [],
    'PlainObject': {},
    'Boolean': false,
    'Number': 1
  };
};
exports.typeDefaults = typeDefaults;
lodashUtils.typeDefaults = typeDefaults;

/**
 * Helper to make `_.isEmber{Class}`
 *
 * @method makeIsType
 * @param {*} klass: A class to check instanceof against
 * @return {Function}
 */
var makeIsType = function makeIsType(klass) {
  return function (value) {
    return value instanceof klass;
  };
};
exports.makeIsType = makeIsType;
lodashUtils.makeIsType = makeIsType;

/**
 * Helper to make `_.ensureType`
 *
 * @method makeEnsureType
 * @param {String} condition: Lodash method to apply
 * @return {Function}
 */
var makeEnsureType = function makeEnsureType(condition) {
  var defaults = lodashUtils.typeDefaults();

  // Check params: condition
  if (!_.isString(condition)) condition = '';
  condition = _.capitalize(condition);
  if (!_.contains(_.keys(defaults), condition)) {
    throw new Error('`condition` not supported: ' + condition);
  }

  // Shortcut
  var isCondition = _['is' + condition];

  /**
   * Interface for `ensureType` methods
   *
   * @method `ensure${type}`
   * @param {*} value: To check
   * @param {*} [valueDefault=defaults[condition]: What to default to
   * @return {*} Defaulted value, or the value itself if pass
   */
  return function (value, valueDefault) {
    // Determine `valueDefault`: if nothing provided, or provided doesn't match type
    if (_.isUndefined(valueDefault) || !isCondition(valueDefault)) {
      valueDefault = _.clone(defaults[condition]);
    }

    // Actual "ensure" check
    if (!_['is' + condition](value)) value = valueDefault;

    return value;
  };
};
exports.makeEnsureType = makeEnsureType;
lodashUtils.makeEnsureType = makeEnsureType;

/**
 * Helper to make `_.deepEnsure{Type}`
 *
 * @method makeDeepEnsureType
 * @param {Function} condition: Lodash method to apply
 * @param {*} valueDefault: What to assign when not of the desired type
 * @return {Function}
 */
var makeDeepEnsureType = function makeDeepEnsureType(condition) {
  return function (collection, propString, valueDefault) {
    return _.set(collection, propString, lodashUtils.makeEnsureType(condition)(_.get(collection, propString), valueDefault));
  };
};
exports.makeDeepEnsureType = makeDeepEnsureType;
lodashUtils.makeDeepEnsureType = makeDeepEnsureType;

/**
 * Determined if lodash key/method is valid to make deep (`is` methods that only have one argument)
 * NOTE: Assumes `this` === is the namespace to check for the function on
 *
 * @method validIsMethod
 * @param {String} key: method name
 * @return {Boolean}
 */
var validIsMethod = function validIsMethod(key) {
  return _.startsWith(key, 'is') && this[key].length === 1;
};
exports.validIsMethod = validIsMethod;
lodashUtils.validIsMethod = validIsMethod;

/**
 * Filter out all valid `is` methods from a namespace
 *
 * @method filterIsMethods
 * @param {String} namespace: Collection of methods
 * @return {Object} `namespace` with just the "is" methods
 */
var filterIsMethods = function filterIsMethods(namespace) {
  return _.chain(namespace).keys().filter(validIsMethod, namespace).value();
};
exports.filterIsMethods = filterIsMethods;
lodashUtils.filterIsMethods = filterIsMethods;

/**
 * Overload normal lodash methods to handle deep syntax
 * TODO: No need to take the first param
 *
 * @method overloadMethods
 * @param {Object} isMethods: Collection of is methods
 * @param {String} namespace: Original namespace isMethods came from
 * @param {Object} target: namespace to overload methods on
 * @return {Undefined}
 */
var overloadMethods = function overloadMethods(isMethods, namespace, target) {
  var oldMethod = {};

  _.forEach(isMethods, function (method) {
    // Save old method
    oldMethod[method] = namespace[method];

    // Make new method that also handles `get`. Apply method to exports.
    target[method] = function (value, propString) {
      if (_.size(arguments) === 2) {
        var _ref;

        return namespace[method]((_ref = _).get.apply(_ref, arguments));
      }
      return oldMethod[method].apply(oldMethod, arguments);
    };
  });
};
exports.overloadMethods = overloadMethods;
lodashUtils.overloadMethods = overloadMethods;

/**
 * Build `isMethods`
 *
 * @method buildIsMethods
 * @param {String} namespace: Namespace to pull `is` methods from
 * @param {Object} target: namespace to overload methods on
 * @return {Undefined}
 */
var buildIsMethods = function buildIsMethods(namespace, target) {
  overloadMethods(filterIsMethods(namespace), namespace, target);
};
exports.buildIsMethods = buildIsMethods;
lodashUtils.buildIsMethods = buildIsMethods;

/**
 * Build `before` and `after` methods for moment
 *
 * @method buildInclusiveCompare
 * @param {String} method: either 'isBefore' or 'isAfter'
 * @param {Object} target: namespace to overload methods on
 * @return {Function}
 */
var buildInclusiveCompare = function buildInclusiveCompare(method, target) {
  return function (date, dateToCompare) {
    if (!target.isMoment(date)) return false;
    if (!target.isMoment(dateToCompare)) return false;

    return date[method](dateToCompare) || date.isSame(dateToCompare);
  };
};
exports.buildInclusiveCompare = buildInclusiveCompare;
lodashUtils.buildInclusiveCompare = buildInclusiveCompare;

exports['default'] = lodashUtils;

},{}],2:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashExtras = require('./lodash-extras');

var _lodashExtras2 = _interopRequireDefault(_lodashExtras);

// Only mixin moment-extras if available

var _lodashMoment = require('./lodash-moment');

var _lodashMoment2 = _interopRequireDefault(_lodashMoment);

// Only mixin ember-extras if available

var _lodashEmber = require('./lodash-ember');

var _lodashEmber2 = _interopRequireDefault(_lodashEmber);

// Must be last to override above methods programmatically

var _lodashDeepExtras = require('./lodash-deep-extras');

var _lodashDeepExtras2 = _interopRequireDefault(_lodashDeepExtras);

_.mixin(_lodashExtras2['default']);
if (_.isPresent(window.moment)) _.moment = _lodashMoment2['default'];
if (_.isPresent(window.Ember)) _.mixin(_lodashEmber2['default']);
_.mixin(_lodashDeepExtras2['default']);

},{"./lodash-deep-extras":3,"./lodash-ember":4,"./lodash-extras":5,"./lodash-moment":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreLodashUtils = require('./_core/lodash-utils');

var _coreLodashUtils2 = _interopRequireDefault(_coreLodashUtils);

var _lodashExtras = require('./lodash-extras');

var _lodashExtras2 = _interopRequireDefault(_lodashExtras);

// All lodash extraDeep methods to export
var lodashDeepExtras = {};

/**
 * Generate deep `is` methods and override standard methods to handle both
 *
 * @method is{Condition}
 * @param {Object} value: Base value to look through
 * @param {String} propString: Property string to apply to `get`
 * @return {Boolean}
 */
_coreLodashUtils2['default'].buildIsMethods(_, lodashDeepExtras);
_coreLodashUtils2['default'].buildIsMethods(_lodashExtras2['default'], lodashDeepExtras);

/**
 * Generate `ensure` methods- Ensure that value is of type x, deeply
 *
 * @method deepEnsure{Type}
 * @param {Object|Array} collection: The root collection of the tree.
 * @param {String} propString: Nested property path of value to check
 * @param {*} [valueDefault=defaults[condition]: What to default to
 * @return {*} Collection, with ensured property
 */
_.forEach(_.keys(_coreLodashUtils2['default'].typeDefaults()), function (type) {
  _lodashExtras2['default']['deepEnsure' + type] = _coreLodashUtils2['default'].makeDeepEnsureType(type);
});

/**
 * Delete deeply nested properties without checking existence down the tree first
 * TODO: TEST TEST TEST. This is experimental (WIP)
 *
 * @method deepDelete
 * @param {*} value: Value to check
 * @param {String} propString: Property string to apply to `get`
 * @return {undefined} Doesn't return success/failure, to match `delete`'s return
 */
var deepDelete = function deepDelete(value, propString) {
  var currentValue = undefined,
      i = undefined;

  // Delete if present
  if (_.isPresent(value, propString)) {
    currentValue = value;
    propString = _(propString).toString().split('.');

    for (i = 0; i < propString.length - 1; i++) {
      currentValue = currentValue[propString[i]];
    }

    delete currentValue[propString[i]];
  }
};
exports.deepDelete = deepDelete;
lodashDeepExtras.deepDelete = deepDelete;

exports['default'] = lodashDeepExtras;

},{"./_core/lodash-utils":1,"./lodash-extras":5}],4:[function(require,module,exports){
/**
 * This utility assumes `Ember` exists globally
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreLodashUtils = require('./_core/lodash-utils');

var _coreLodashUtils2 = _interopRequireDefault(_coreLodashUtils);

/**
 * Collection of all the utils in here. Add to this as you go.
 */
var lodashEmber = {};

exports.lodashEmber = lodashEmber;
/**
 * Check that a value is an instance, as designated by Ember
 *
 * @method isEmberInstance
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isEmberInstance = function isEmberInstance(value) {
  return Ember.typeOf(value) === 'instance';
};
exports.isEmberInstance = isEmberInstance;
lodashEmber.isEmberInstance = isEmberInstance;

/**
 * Check that a value is, at least, a subclass of Ember.Object
 *
 * @method isEmberObject
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isEmberObject = _coreLodashUtils2['default'].makeIsType(Ember.Object);
exports.isEmberObject = isEmberObject;
lodashEmber.isEmberObject = isEmberObject;

/**
 * NOTE: isEmberArray has been excluded as Ember.Array is not an Ember.Object
 */

/**
 * Check that a value is, at least, a subclass of Ember.ObjectProxy
 *
 * @method isEmberObjectProxy
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isEmberObjectProxy = _coreLodashUtils2['default'].makeIsType(Ember.ObjectProxy);
exports.isEmberObjectProxy = isEmberObjectProxy;
lodashEmber.isEmberObjectProxy = isEmberObjectProxy;

/**
 * Check that a value is, at least, a subclass of Ember.ArrayProxy
 *
 * @method isEmberArrayProxy
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isEmberArrayProxy = _coreLodashUtils2['default'].makeIsType(Ember.ArrayProxy);
exports.isEmberArrayProxy = isEmberArrayProxy;
lodashEmber.isEmberArrayProxy = isEmberArrayProxy;

/**
 * Check that the value is a descendent of an Ember Class
 * TODO: Check that `_.isEmberInstance` doesn't already yield the same result
 *
 * @method isEmberCollection
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isEmberCollection = function isEmberCollection(value) {
  return _.isEmberObject(value) || _.isEmberObjectProxy(value) || _.isEmberArrayProxy(value);
};
exports.isEmberCollection = isEmberCollection;
lodashEmber.isEmberCollection = isEmberCollection;

/**
 * Check that value is Ember Transition
 *
 * @method isEmberTransition
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isEmberTransition = function isEmberTransition(value) {
  return _.isFunction(value, 'toString') && _.contains(value.toString(), 'Transition');
};
exports.isEmberTransition = isEmberTransition;
lodashEmber.isEmberTransition = isEmberTransition;

/**
 * Lodash forEach
 *
 * @method _forEach
 * @param {Array|Object|String} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|String} Returns `collection`.
 */
var _forEach = _.forEach;
exports._forEach = _forEach;
lodashEmber._forEach = _forEach;

/**
 * Override lodash `forEach` to support ember arrays/objects
 *
 * @method forEach
 * @param {Array|Object|String} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|String} Returns `collection`.
 */
var forEach = function forEach(collection, callback, thisArg) {
  if (_.isEmberArrayProxy(collection)) {
    return collection.forEach(callback, this);
  }
  if (_.isEmberObjectProxy(collection) && _.isObject(collection.get('content'))) {
    return _forEach(collection.get('content'), callback, thisArg);
  }
  return _forEach(collection, callback, thisArg);
};
exports.forEach = forEach;
lodashEmber.forEach = forEach;

/**
 * Lodash reduce
 *
 * @method _reduce
 * @param {Array|Object|String} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [currentValue] value at beginning of iteration
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|String} Returns `collection`.
 */
var _reduce = _.reduce;
exports._reduce = _reduce;
lodashEmber._reduce = _reduce;

/**
 * Override lodash `reduce` to support ember arrays/objects
 *
 * @method reduce
 * @param {Array|Object|String} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [currentValue] value at beginning of iteration
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|String} Returns `collection`.
 */
var reduce = function reduce(collection, callback, currentValue, thisArg) {
  if (_.isEmberArrayProxy(collection)) {
    return collection.reduce(callback, currentValue, this);
  }
  if (_.isEmberObjectProxy(collection) && _.isObject(collection.get('content'))) {
    return _reduce(collection.get('content'), callback, currentValue, thisArg);
  }
  return _reduce(collection, callback, currentValue, thisArg);
};
exports.reduce = reduce;
lodashEmber.reduce = reduce;

/**
 * Lodash map
 *
 * @method _map
 * @param {Array|Object|String} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|String} Returns `collection`.
 */
var _map = _.map;
exports._map = _map;
lodashEmber._map = _map;

/**
 * Override lodash `map` to support ember arrays/objects
 *
 * @method map
 * @param {Array|Object|String} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|String} Returns `collection`.
 */
var map = function map(collection, callback, thisArg) {
  if (_.isEmberArrayProxy(collection)) {
    return collection.map(callback, this);
  }
  return _map(collection, callback, thisArg);
};
exports.map = map;
lodashEmber.map = map;

/**
 * Lodash `get` alias to private namespace
 *
 * @method _get
 * @param {Object|Array} collection: The root collection of the tree.
 * @param {String|Array} propertyPath: The property path in the collection.
 * @returns {*} The value, or undefined if it doesn't exists.
 */
var _get = _.get;
exports._get = _get;
lodashEmber._get = _get;

/**
 * Retrieves the value of a property in an object tree.
 *
 * @method get
 * @param {Object|Array} collection: The root collection of the tree.
 * @param {String|Array} propertyPath: The property path in the collection.
 * @returns {*} The value, or undefined if it doesn't exists.
 */
var get = function get(collection, propertyPath) {
  // Handle Ember Objects
  if (isEmberObject(collection) || isEmberObjectProxy(collection)) {
    return collection.get(propertyPath);
  }

  return _get.apply(undefined, arguments);
};
exports.get = get;
lodashEmber.get = get;

/**
 * Lodash `set` alias to private namespace
 *
 * @method _set
 * @param {Object|Array} collection: The root collection of the tree.
 * @param {String|Array} propertyPath: The property path in the collection.
 * @param {*} value: The property path in the collection.
 * @returns {*} The `collection` passed in with value set.
 */
var _set = _.set;
exports._set = _set;
lodashEmber._set = _set;

/**
 * Retrieves the value of a property in an object tree.
 *
 * @method set
 * @param {Object|Array} collection: The root collection of the tree.
 * @param {String|Array} propertyPath: The property path in the collection.
 * @param {*} value: Value to set on the collection.
 * @returns {*} The `collection` passed in with value set.
 */
var set = function set(collection, propertyPath, value) {
  // Handle Ember Objects
  if (isEmberObject(collection) || isEmberObjectProxy(collection)) {
    collection.set(propertyPath, value);
    return collection;
  }

  return _set.apply(undefined, arguments);
};
exports.set = set;
lodashEmber.set = set;

/**
 * Original lodash isEmpty
 *
 * @method _isEmpty
 * @param {*} value
 * @return {Boolean}
 */
var _isEmpty = _.isEmpty;
exports._isEmpty = _isEmpty;
lodashEmber._isEmpty = _isEmpty;

/**
 * Determines if the value is empty or not
 *
 * @method isEmpty
 * @param {*} value
 * @return {Boolean}
 */
var isEmpty = function isEmpty(value) {
  if (_.isEmberArrayProxy(value) && _.isFunction(value.isEmpty)) {
    return value.isEmpty();
  }

  return _isEmpty.apply(undefined, arguments);
};
exports.isEmpty = isEmpty;
lodashEmber.isEmpty = isEmpty;

/**
 * Original lodash clone
 *
 * @method _clone
 * @param {*} value
 * @return {*}
 */
var _clone = _.clone;
exports._clone = _clone;
lodashEmber._clone = _clone;

/**
 * Returns a cloned copy of value
 *
 * @method clone
 * @param {*} value
 * @return {*}
 */
var clone = function clone(value) {
  // TODO: Create some sort of clone for Ember Objects and Arrays
  return _clone.apply(undefined, arguments);
};
exports.clone = clone;
lodashEmber.clone = clone;

/**
 * Alias for `array.pop` or `arrayProxy.popObject`
 *
 * @method pop
 * @param {Array|Ember.ArrayProxy} value
 * @return {*}
 */
var pop = function pop(value) {
  return _.isEmberArrayProxy(value) ? value.popObject() : value.pop();
};
exports.pop = pop;
lodashEmber.pop = pop;

/**
 * Alias for `array.shift` or `arrayProxy.shiftObject`
 *
 * @method shift
 * @param {Array|Ember.ArrayProxy} value
 * @return {*}
 */
var shift = function shift(value) {
  return _.isEmberArrayProxy(value) ? value.shiftObject() : value.shift();
};
exports.shift = shift;
lodashEmber.shift = shift;

/**
 * Ember `typeOf` alias
 *
 * @method typeOf
 * @param {*} value: Value to check
 * @return {String} The type of `value`
 */
var typeOf = function typeOf(value) {
  return Ember.typeOf(value);
};
exports.typeOf = typeOf;
lodashEmber.typeOf = typeOf;

/**
 * RSVP resolve helper
 *
 * @method promiseResolve
 * @param {*} value: Value to resolve with
 * @return {Promise}
 */
var promiseResolve = function promiseResolve(value) {
  return Ember.RSVP.resolve(value);
};
exports.promiseResolve = promiseResolve;
lodashEmber.promiseResolve = promiseResolve;

/**
 * RSVP reject helper
 *
 * @method promiseReject
 * @param {*} value: Value to resolve with
 * @return {Promise}
 */
var promiseReject = function promiseReject(message) {
  message = _.ensureString(message);
  return Ember.RSVP.reject(console.error(message));
};
exports.promiseReject = promiseReject;
lodashEmber.promiseReject = promiseReject;

/**
 * Generate deep `is` methods and override standard methods to handle both
 *
 * @method is{Condition}
 * @param {Object} value: Base value to look through
 * @param {String} propString: Property string to apply to `get`
 * @return {Boolean}
 */
_coreLodashUtils2['default'].buildIsMethods(lodashEmber, lodashEmber);

var lodashEmber;
exports.lodashEmber = lodashEmber;
exports['default'] = lodashEmber;

},{"./_core/lodash-utils":1}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreLodashUtils = require('./_core/lodash-utils');

var _coreLodashUtils2 = _interopRequireDefault(_coreLodashUtils);

/**
 * Collection of all the utils in here. Add to this as you go.
 */
var lodashExtras = {};

/**
 * Helper to check if a variable is defined and present
 *
 * @method isPresent
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isPresent = function isPresent(value) {
  return !_.isUndefined(value) && !_.isNull(value);
};
exports.isPresent = isPresent;
lodashExtras.isPresent = isPresent;

/**
 * Helper to check if a variable is defined and present
 *
 * @method isBlank
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isBlank = function isBlank(value) {
  return !_.isPresent(value);
};
exports.isBlank = isBlank;
lodashExtras.isBlank = isBlank;

/**
 * Helper to check if a variable is a date
 *
 * @method isDate
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isDate = function isDate(value) {
  return _.typeOf(value) === 'date';
};
exports.isDate = isDate;
lodashExtras.isDate = isDate;

/**
 * Helper to check if a variable is a promise
 *
 * @method isPromise
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isPromise = function isPromise(value) {
  return _.isFunction(value, 'then');
};
exports.isPromise = isPromise;
lodashExtras.isPromise = isPromise;

/**
 * Helper to check a value for an array of LoDash boolean conditions
 * TODO: Name this `isAnd` and create `isOr`...
 *
 * @method is
 * @param {*} value: Value to check
 * @param {Array} conditions: LoDash methods to have value tested against (as strings)
 * @return {Boolean}
 */
var is = function is(value, conditions) {
  if (_.isString(conditions)) conditions = [conditions];
  if (_.isPresent(conditions) && !_.isArray(conditions)) conditions = [];
  if (conditions.length <= 1) console.error("Don't call `is` helper with just one condition- use that condition directly");
  return _.every(conditions, function (condition) {
    var result = undefined,
        not = undefined;

    // Check for valid condition
    if (!_.isString(condition)) {
      console.warn("`condition` was not a string: " + condition);
      return false;
    }

    // Handle not condition
    not = false;
    if (_.startsWith(condition, '!')) {
      not = true;
      condition = condition.replace('!', '');
    }

    // Be EXTRA (too) helpful (prepend 'is' if ommitted)
    if (!_.startsWith(condition, 'is')) {
      condition = 'is' + condition;
    }

    // Make sure `condition` is a valid lodash method
    if (!_.isFunction(_[condition])) {
      console.warn("`condition` was not a valid lodash method: " + condition);
      return false;
    }

    // Determine result and return
    result = _[condition](value);
    if (not === true) return !result;

    return result;
  });
};
exports.is = is;
lodashExtras.is = is;

/**
 * Generate `ensure` methods- Ensure that value is of type x
 *
 * @method ensure{Type}
 * @param {*} value: To check
 * @param {*} [valueDefault=defaults[condition]: What to default to
 * @return {*} Ensured value
 */
_.forEach(_.keys(_coreLodashUtils2['default'].typeDefaults()), function (type) {
  lodashExtras['ensure' + type] = _coreLodashUtils2['default'].makeEnsureType(type);
});

/**
 * Javascript `typeof` alias
 *
 * @method typeOf
 * @param {*} value: Value to check
 * @return {String} The type of `value`
 */
var typeOf = function typeOf(value) {
  return typeof value;
};
exports.typeOf = typeOf;
lodashExtras.typeOf = typeOf;

exports['default'] = lodashExtras;

},{"./_core/lodash-utils":1}],6:[function(require,module,exports){
/**
 * This utility assumes `Ember` exists globally
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreLodashUtils = require('./_core/lodash-utils');

var _coreLodashUtils2 = _interopRequireDefault(_coreLodashUtils);

/**
 * Collection of all the utils in here. Add to this as you go.
 */
var lodashMoment = {};

/**
 * Check if a variable is a moment date object
 *
 * @method isMoment
 * @param {*} value: Value to check
 * @return {Boolean}
 */
var isMoment = function isMoment(value) {
  return moment.isMoment(value);
};
exports.isMoment = isMoment;
lodashMoment.isMoment = isMoment;

/**
 * Ensure value is a moment object.
 * If not, tries to create a moment object from value,
 * otherwise returns moment().
 *
 * @method ensureMoment
 * @param {*} value: Value to check
 * @param {*} valueDefault: What to default to
 * @return {Moment}
 */
var ensureMoment = function ensureMoment(value, valueDefault) {
  if (isMoment(value)) return value;
  value = moment(value);
  if (value.isValid()) return value;
  if (isMoment(valueDefault)) return valueDefault;
  return moment();
};
exports.ensureMoment = ensureMoment;
lodashMoment.ensureMoment = ensureMoment;

/**
 * Check if `date` is after or same as `dateToCompare`
 * Returns false if either is not `Moment`
 *
 * @method after
 * @param {Moment} date
 * @param {Moment} dateToCompare
 * @return {Boolean}
 */
var after = _coreLodashUtils2['default'].buildInclusiveCompare('isAfter', lodashMoment);
exports.after = after;
lodashMoment.after = after;

/**
 * Check if `date` is before or same as `dateToCompare`
 * Returns false if either is not `Moment`
 *
 * @method before
 * @param {Moment} date
 * @param {Moment} dateToCompare
 * @return {Boolean}
 */
var before = _coreLodashUtils2['default'].buildInclusiveCompare('isBefore', lodashMoment);
exports.before = before;
lodashMoment.before = before;

/**
 * Generate deep `is` methods and override standard methods to handle both
 *
 * @method is{Condition}
 * @param {Object} value: Base value to look through
 * @param {String} propString: Property string to apply to `get`
 * @return {Boolean}
 */
_coreLodashUtils2['default'].buildIsMethods(lodashMoment, lodashMoment);

exports['default'] = lodashMoment;

},{"./_core/lodash-utils":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvQW5kcmV3L1ppcHNjZW5lL2xvZGFzaC1leHRyYXMvc3JjL19jb3JlL2xvZGFzaC11dGlscy5qcyIsIi9Vc2Vycy9BbmRyZXcvWmlwc2NlbmUvbG9kYXNoLWV4dHJhcy9zcmMvaW5kZXguanMiLCIvVXNlcnMvQW5kcmV3L1ppcHNjZW5lL2xvZGFzaC1leHRyYXMvc3JjL2xvZGFzaC1kZWVwLWV4dHJhcy5qcyIsIi9Vc2Vycy9BbmRyZXcvWmlwc2NlbmUvbG9kYXNoLWV4dHJhcy9zcmMvbG9kYXNoLWVtYmVyLmpzIiwiL1VzZXJzL0FuZHJldy9aaXBzY2VuZS9sb2Rhc2gtZXh0cmFzL3NyYy9sb2Rhc2gtZXh0cmFzLmpzIiwiL1VzZXJzL0FuZHJldy9aaXBzY2VuZS9sb2Rhc2gtZXh0cmFzL3NyYy9sb2Rhc2gtbW9tZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNHQSxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7Ozs7Ozs7O0FBU2QsSUFBSSxZQUFZLEdBQUcsU0FBZixZQUFZLEdBQVM7QUFDOUIsU0FBTztBQUNMLFlBQVEsRUFBRSxFQUFFO0FBQ1osV0FBTyxFQUFFLEVBQUU7QUFDWCxpQkFBYSxFQUFFLEVBQUU7QUFDakIsYUFBUyxFQUFFLEtBQUs7QUFDaEIsWUFBUSxFQUFFLENBQUM7R0FDWixDQUFDO0NBQ0gsQ0FBQzs7QUFDRixXQUFXLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQzs7Ozs7Ozs7O0FBVWpDLElBQUksVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFJLEtBQUssRUFBSztBQUNqQyxTQUFPLFVBQVMsS0FBSyxFQUFFO0FBQ3JCLFdBQVEsS0FBSyxZQUFZLEtBQUssQ0FBRTtHQUNqQyxDQUFDO0NBQ0gsQ0FBQzs7QUFDRixXQUFXLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQzs7Ozs7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ImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENvbGxlY3Rpb24gb2YgYWxsIHRoZSB1dGlscyBpbiBoZXJlLiBBZGQgdG8gdGhpcyBhcyB5b3UgZ28uXG4gKi9cbmxldCBsb2Rhc2hVdGlscyA9IHt9O1xuXG5cbi8qKlxuICogSGVscGVyIGZvciBKUyB0eXBlcyBhbmQgZGVmYXVsdHMgZm9yIGVhY2ggdHlwZVxuICpcbiAqIEBtZXRob2QgdHlwZURlZmF1bHRzXG4gKiBAcmV0dXJuIHtQbGFpbk9iamVjdH1cbiAqL1xuZXhwb3J0IHZhciB0eXBlRGVmYXVsdHMgPSAoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgJ1N0cmluZyc6ICcnLFxuICAgICdBcnJheSc6IFtdLFxuICAgICdQbGFpbk9iamVjdCc6IHt9LFxuICAgICdCb29sZWFuJzogZmFsc2UsXG4gICAgJ051bWJlcic6IDFcbiAgfTtcbn07XG5sb2Rhc2hVdGlscy50eXBlRGVmYXVsdHMgPSB0eXBlRGVmYXVsdHM7XG5cblxuLyoqXG4gKiBIZWxwZXIgdG8gbWFrZSBgXy5pc0VtYmVye0NsYXNzfWBcbiAqXG4gKiBAbWV0aG9kIG1ha2VJc1R5cGVcbiAqIEBwYXJhbSB7Kn0ga2xhc3M6IEEgY2xhc3MgdG8gY2hlY2sgaW5zdGFuY2VvZiBhZ2FpbnN0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IHZhciBtYWtlSXNUeXBlID0gKGtsYXNzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiAodmFsdWUgaW5zdGFuY2VvZiBrbGFzcyk7XG4gIH07XG59O1xubG9kYXNoVXRpbHMubWFrZUlzVHlwZSA9IG1ha2VJc1R5cGU7XG5cblxuLyoqXG4gKiBIZWxwZXIgdG8gbWFrZSBgXy5lbnN1cmVUeXBlYFxuICpcbiAqIEBtZXRob2QgbWFrZUVuc3VyZVR5cGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb25kaXRpb246IExvZGFzaCBtZXRob2QgdG8gYXBwbHlcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5leHBvcnQgdmFyIG1ha2VFbnN1cmVUeXBlID0gKGNvbmRpdGlvbikgPT4ge1xuICBsZXQgZGVmYXVsdHMgPSBsb2Rhc2hVdGlscy50eXBlRGVmYXVsdHMoKTtcblxuICAvLyBDaGVjayBwYXJhbXM6IGNvbmRpdGlvblxuICBpZiAoIV8uaXNTdHJpbmcoY29uZGl0aW9uKSkgY29uZGl0aW9uID0gJyc7XG4gIGNvbmRpdGlvbiA9IF8uY2FwaXRhbGl6ZShjb25kaXRpb24pO1xuICBpZiAoIV8uY29udGFpbnMoXy5rZXlzKGRlZmF1bHRzKSwgY29uZGl0aW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXFxgY29uZGl0aW9uXFxgIG5vdCBzdXBwb3J0ZWQ6ICR7Y29uZGl0aW9ufWApO1xuICB9XG5cbiAgLy8gU2hvcnRjdXRcbiAgbGV0IGlzQ29uZGl0aW9uID0gX1tgaXMke2NvbmRpdGlvbn1gXTtcblxuICAvKipcbiAgICogSW50ZXJmYWNlIGZvciBgZW5zdXJlVHlwZWAgbWV0aG9kc1xuICAgKlxuICAgKiBAbWV0aG9kIGBlbnN1cmUke3R5cGV9YFxuICAgKiBAcGFyYW0geyp9IHZhbHVlOiBUbyBjaGVja1xuICAgKiBAcGFyYW0geyp9IFt2YWx1ZURlZmF1bHQ9ZGVmYXVsdHNbY29uZGl0aW9uXTogV2hhdCB0byBkZWZhdWx0IHRvXG4gICAqIEByZXR1cm4geyp9IERlZmF1bHRlZCB2YWx1ZSwgb3IgdGhlIHZhbHVlIGl0c2VsZiBpZiBwYXNzXG4gICAqL1xuICByZXR1cm4gKHZhbHVlLCB2YWx1ZURlZmF1bHQpID0+IHtcbiAgICAvLyBEZXRlcm1pbmUgYHZhbHVlRGVmYXVsdGA6IGlmIG5vdGhpbmcgcHJvdmlkZWQsIG9yIHByb3ZpZGVkIGRvZXNuJ3QgbWF0Y2ggdHlwZVxuICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbHVlRGVmYXVsdCkgfHwgIWlzQ29uZGl0aW9uKHZhbHVlRGVmYXVsdCkpIHtcbiAgICAgIHZhbHVlRGVmYXVsdCA9IF8uY2xvbmUoZGVmYXVsdHNbY29uZGl0aW9uXSk7XG4gICAgfVxuXG4gICAgLy8gQWN0dWFsIFwiZW5zdXJlXCIgY2hlY2tcbiAgICBpZiAoIV9bYGlzJHtjb25kaXRpb259YF0odmFsdWUpKSB2YWx1ZSA9IHZhbHVlRGVmYXVsdDtcblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn07XG5sb2Rhc2hVdGlscy5tYWtlRW5zdXJlVHlwZSA9IG1ha2VFbnN1cmVUeXBlO1xuXG5cbi8qKlxuICogSGVscGVyIHRvIG1ha2UgYF8uZGVlcEVuc3VyZXtUeXBlfWBcbiAqXG4gKiBAbWV0aG9kIG1ha2VEZWVwRW5zdXJlVHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY29uZGl0aW9uOiBMb2Rhc2ggbWV0aG9kIHRvIGFwcGx5XG4gKiBAcGFyYW0geyp9IHZhbHVlRGVmYXVsdDogV2hhdCB0byBhc3NpZ24gd2hlbiBub3Qgb2YgdGhlIGRlc2lyZWQgdHlwZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmV4cG9ydCB2YXIgbWFrZURlZXBFbnN1cmVUeXBlID0gKGNvbmRpdGlvbikgPT4ge1xuICByZXR1cm4gKGNvbGxlY3Rpb24sIHByb3BTdHJpbmcsIHZhbHVlRGVmYXVsdCkgPT4ge1xuICAgIHJldHVybiBfLnNldChcbiAgICAgIGNvbGxlY3Rpb24sXG4gICAgICBwcm9wU3RyaW5nLFxuICAgICAgbG9kYXNoVXRpbHMubWFrZUVuc3VyZVR5cGUoY29uZGl0aW9uKShcbiAgICAgICAgXy5nZXQoY29sbGVjdGlvbiwgcHJvcFN0cmluZyksXG4gICAgICAgIHZhbHVlRGVmYXVsdFxuICAgICAgKVxuICAgICk7XG4gIH07XG59O1xubG9kYXNoVXRpbHMubWFrZURlZXBFbnN1cmVUeXBlID0gbWFrZURlZXBFbnN1cmVUeXBlO1xuXG5cbi8qKlxuICogRGV0ZXJtaW5lZCBpZiBsb2Rhc2gga2V5L21ldGhvZCBpcyB2YWxpZCB0byBtYWtlIGRlZXAgKGBpc2AgbWV0aG9kcyB0aGF0IG9ubHkgaGF2ZSBvbmUgYXJndW1lbnQpXG4gKiBOT1RFOiBBc3N1bWVzIGB0aGlzYCA9PT0gaXMgdGhlIG5hbWVzcGFjZSB0byBjaGVjayBmb3IgdGhlIGZ1bmN0aW9uIG9uXG4gKlxuICogQG1ldGhvZCB2YWxpZElzTWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5OiBtZXRob2QgbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0IHZhciB2YWxpZElzTWV0aG9kID0gZnVuY3Rpb24oa2V5KSB7XG4gIHJldHVybiAoXG4gICAgXy5zdGFydHNXaXRoKGtleSwgJ2lzJykgJiZcbiAgICAodGhpc1trZXldLmxlbmd0aCA9PT0gMSlcbiAgKTtcbn07XG5sb2Rhc2hVdGlscy52YWxpZElzTWV0aG9kID0gdmFsaWRJc01ldGhvZDtcblxuXG4vKipcbiAqIEZpbHRlciBvdXQgYWxsIHZhbGlkIGBpc2AgbWV0aG9kcyBmcm9tIGEgbmFtZXNwYWNlXG4gKlxuICogQG1ldGhvZCBmaWx0ZXJJc01ldGhvZHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2U6IENvbGxlY3Rpb24gb2YgbWV0aG9kc1xuICogQHJldHVybiB7T2JqZWN0fSBgbmFtZXNwYWNlYCB3aXRoIGp1c3QgdGhlIFwiaXNcIiBtZXRob2RzXG4gKi9cbmV4cG9ydCB2YXIgZmlsdGVySXNNZXRob2RzID0gKG5hbWVzcGFjZSkgPT4ge1xuICByZXR1cm4gXy5jaGFpbihuYW1lc3BhY2UpXG4gICAgLmtleXMoKVxuICAgIC5maWx0ZXIodmFsaWRJc01ldGhvZCwgbmFtZXNwYWNlKVxuICAgIC52YWx1ZSgpO1xufTtcbmxvZGFzaFV0aWxzLmZpbHRlcklzTWV0aG9kcyA9IGZpbHRlcklzTWV0aG9kcztcblxuXG4vKipcbiAqIE92ZXJsb2FkIG5vcm1hbCBsb2Rhc2ggbWV0aG9kcyB0byBoYW5kbGUgZGVlcCBzeW50YXhcbiAqIFRPRE86IE5vIG5lZWQgdG8gdGFrZSB0aGUgZmlyc3QgcGFyYW1cbiAqXG4gKiBAbWV0aG9kIG92ZXJsb2FkTWV0aG9kc1xuICogQHBhcmFtIHtPYmplY3R9IGlzTWV0aG9kczogQ29sbGVjdGlvbiBvZiBpcyBtZXRob2RzXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlOiBPcmlnaW5hbCBuYW1lc3BhY2UgaXNNZXRob2RzIGNhbWUgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRhcmdldDogbmFtZXNwYWNlIHRvIG92ZXJsb2FkIG1ldGhvZHMgb25cbiAqIEByZXR1cm4ge1VuZGVmaW5lZH1cbiAqL1xuZXhwb3J0IHZhciBvdmVybG9hZE1ldGhvZHMgPSAoaXNNZXRob2RzLCBuYW1lc3BhY2UsIHRhcmdldCkgPT4ge1xuICBsZXQgb2xkTWV0aG9kID0ge307XG5cbiAgXy5mb3JFYWNoKGlzTWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgIC8vIFNhdmUgb2xkIG1ldGhvZFxuICAgIG9sZE1ldGhvZFttZXRob2RdID0gbmFtZXNwYWNlW21ldGhvZF07XG5cbiAgICAvLyBNYWtlIG5ldyBtZXRob2QgdGhhdCBhbHNvIGhhbmRsZXMgYGdldGAuIEFwcGx5IG1ldGhvZCB0byBleHBvcnRzLlxuICAgIHRhcmdldFttZXRob2RdID0gZnVuY3Rpb24odmFsdWUsIHByb3BTdHJpbmcpIHtcbiAgICAgIGlmIChfLnNpemUoYXJndW1lbnRzKSA9PT0gMikge1xuICAgICAgICByZXR1cm4gbmFtZXNwYWNlW21ldGhvZF0oXy5nZXQoLi4uYXJndW1lbnRzKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2xkTWV0aG9kW21ldGhvZF0oLi4uYXJndW1lbnRzKTtcbiAgICB9O1xuICB9KTtcbn07XG5sb2Rhc2hVdGlscy5vdmVybG9hZE1ldGhvZHMgPSBvdmVybG9hZE1ldGhvZHM7XG5cblxuLyoqXG4gKiBCdWlsZCBgaXNNZXRob2RzYFxuICpcbiAqIEBtZXRob2QgYnVpbGRJc01ldGhvZHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2U6IE5hbWVzcGFjZSB0byBwdWxsIGBpc2AgbWV0aG9kcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0OiBuYW1lc3BhY2UgdG8gb3ZlcmxvYWQgbWV0aG9kcyBvblxuICogQHJldHVybiB7VW5kZWZpbmVkfVxuICovXG5leHBvcnQgdmFyIGJ1aWxkSXNNZXRob2RzID0gKG5hbWVzcGFjZSwgdGFyZ2V0KSA9PiB7XG4gIG92ZXJsb2FkTWV0aG9kcyhmaWx0ZXJJc01ldGhvZHMobmFtZXNwYWNlKSwgbmFtZXNwYWNlLCB0YXJnZXQpO1xufVxubG9kYXNoVXRpbHMuYnVpbGRJc01ldGhvZHMgPSBidWlsZElzTWV0aG9kcztcblxuXG4vKipcbiAqIEJ1aWxkIGBiZWZvcmVgIGFuZCBgYWZ0ZXJgIG1ldGhvZHMgZm9yIG1vbWVudFxuICpcbiAqIEBtZXRob2QgYnVpbGRJbmNsdXNpdmVDb21wYXJlXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kOiBlaXRoZXIgJ2lzQmVmb3JlJyBvciAnaXNBZnRlcidcbiAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQ6IG5hbWVzcGFjZSB0byBvdmVybG9hZCBtZXRob2RzIG9uXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IHZhciBidWlsZEluY2x1c2l2ZUNvbXBhcmUgPSAobWV0aG9kLCB0YXJnZXQpID0+IHtcbiAgcmV0dXJuIChkYXRlLCBkYXRlVG9Db21wYXJlKSA9PiB7XG4gICAgaWYgKCF0YXJnZXQuaXNNb21lbnQoZGF0ZSkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIXRhcmdldC5pc01vbWVudChkYXRlVG9Db21wYXJlKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIChkYXRlW21ldGhvZF0oZGF0ZVRvQ29tcGFyZSkgfHwgZGF0ZS5pc1NhbWUoZGF0ZVRvQ29tcGFyZSkpO1xuICB9O1xufTtcbmxvZGFzaFV0aWxzLmJ1aWxkSW5jbHVzaXZlQ29tcGFyZSA9IGJ1aWxkSW5jbHVzaXZlQ29tcGFyZTtcblxuXG5leHBvcnQgZGVmYXVsdCBsb2Rhc2hVdGlscztcbiIsImltcG9ydCBsb2Rhc2hFeHRyYXMgZnJvbSAnLi9sb2Rhc2gtZXh0cmFzJztcbl8ubWl4aW4obG9kYXNoRXh0cmFzKTtcblxuLy8gT25seSBtaXhpbiBtb21lbnQtZXh0cmFzIGlmIGF2YWlsYWJsZVxuaW1wb3J0IGxvZGFzaE1vbWVudCBmcm9tICcuL2xvZGFzaC1tb21lbnQnO1xuaWYgKF8uaXNQcmVzZW50KHdpbmRvdy5tb21lbnQpKSBfLm1vbWVudCA9IGxvZGFzaE1vbWVudDtcblxuLy8gT25seSBtaXhpbiBlbWJlci1leHRyYXMgaWYgYXZhaWxhYmxlXG5pbXBvcnQgbG9kYXNoRW1iZXIgZnJvbSAnLi9sb2Rhc2gtZW1iZXInO1xuaWYgKF8uaXNQcmVzZW50KHdpbmRvdy5FbWJlcikpIF8ubWl4aW4obG9kYXNoRW1iZXIpO1xuXG4vLyBNdXN0IGJlIGxhc3QgdG8gb3ZlcnJpZGUgYWJvdmUgbWV0aG9kcyBwcm9ncmFtbWF0aWNhbGx5XG5pbXBvcnQgbG9kYXNoRGVlcEV4dHJhcyBmcm9tICcuL2xvZGFzaC1kZWVwLWV4dHJhcyc7XG5fLm1peGluKGxvZGFzaERlZXBFeHRyYXMpO1xuIiwiaW1wb3J0IGxvZGFzaFV0aWxzIGZyb20gJy4vX2NvcmUvbG9kYXNoLXV0aWxzJztcbmltcG9ydCBsb2Rhc2hFeHRyYXMgZnJvbSAnLi9sb2Rhc2gtZXh0cmFzJztcblxuXG4vLyBBbGwgbG9kYXNoIGV4dHJhRGVlcCBtZXRob2RzIHRvIGV4cG9ydFxubGV0IGxvZGFzaERlZXBFeHRyYXMgPSB7fTtcblxuXG4vKipcbiAqIEdlbmVyYXRlIGRlZXAgYGlzYCBtZXRob2RzIGFuZCBvdmVycmlkZSBzdGFuZGFyZCBtZXRob2RzIHRvIGhhbmRsZSBib3RoXG4gKlxuICogQG1ldGhvZCBpc3tDb25kaXRpb259XG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWU6IEJhc2UgdmFsdWUgdG8gbG9vayB0aHJvdWdoXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFN0cmluZzogUHJvcGVydHkgc3RyaW5nIHRvIGFwcGx5IHRvIGBnZXRgXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5sb2Rhc2hVdGlscy5idWlsZElzTWV0aG9kcyhfLCBsb2Rhc2hEZWVwRXh0cmFzKTtcbmxvZGFzaFV0aWxzLmJ1aWxkSXNNZXRob2RzKGxvZGFzaEV4dHJhcywgbG9kYXNoRGVlcEV4dHJhcyk7XG5cblxuLyoqXG4gKiBHZW5lcmF0ZSBgZW5zdXJlYCBtZXRob2RzLSBFbnN1cmUgdGhhdCB2YWx1ZSBpcyBvZiB0eXBlIHgsIGRlZXBseVxuICpcbiAqIEBtZXRob2QgZGVlcEVuc3VyZXtUeXBlfVxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IGNvbGxlY3Rpb246IFRoZSByb290IGNvbGxlY3Rpb24gb2YgdGhlIHRyZWUuXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFN0cmluZzogTmVzdGVkIHByb3BlcnR5IHBhdGggb2YgdmFsdWUgdG8gY2hlY2tcbiAqIEBwYXJhbSB7Kn0gW3ZhbHVlRGVmYXVsdD1kZWZhdWx0c1tjb25kaXRpb25dOiBXaGF0IHRvIGRlZmF1bHQgdG9cbiAqIEByZXR1cm4geyp9IENvbGxlY3Rpb24sIHdpdGggZW5zdXJlZCBwcm9wZXJ0eVxuICovXG5fLmZvckVhY2goXy5rZXlzKGxvZGFzaFV0aWxzLnR5cGVEZWZhdWx0cygpKSwgKHR5cGUpID0+IHtcbiAgbG9kYXNoRXh0cmFzW2BkZWVwRW5zdXJlJHt0eXBlfWBdID0gbG9kYXNoVXRpbHMubWFrZURlZXBFbnN1cmVUeXBlKHR5cGUpO1xufSk7XG5cblxuLyoqXG4gKiBEZWxldGUgZGVlcGx5IG5lc3RlZCBwcm9wZXJ0aWVzIHdpdGhvdXQgY2hlY2tpbmcgZXhpc3RlbmNlIGRvd24gdGhlIHRyZWUgZmlyc3RcbiAqIFRPRE86IFRFU1QgVEVTVCBURVNULiBUaGlzIGlzIGV4cGVyaW1lbnRhbCAoV0lQKVxuICpcbiAqIEBtZXRob2QgZGVlcERlbGV0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZTogVmFsdWUgdG8gY2hlY2tcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wU3RyaW5nOiBQcm9wZXJ0eSBzdHJpbmcgdG8gYXBwbHkgdG8gYGdldGBcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH0gRG9lc24ndCByZXR1cm4gc3VjY2Vzcy9mYWlsdXJlLCB0byBtYXRjaCBgZGVsZXRlYCdzIHJldHVyblxuICovXG5leHBvcnQgdmFyIGRlZXBEZWxldGUgPSBmdW5jdGlvbih2YWx1ZSwgcHJvcFN0cmluZykge1xuICBsZXQgY3VycmVudFZhbHVlLCBpO1xuXG4gIC8vIERlbGV0ZSBpZiBwcmVzZW50XG4gIGlmIChfLmlzUHJlc2VudCh2YWx1ZSwgcHJvcFN0cmluZykpIHtcbiAgICBjdXJyZW50VmFsdWUgPSB2YWx1ZTtcbiAgICBwcm9wU3RyaW5nID0gXyhwcm9wU3RyaW5nKS50b1N0cmluZygpLnNwbGl0KCcuJyk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgKHByb3BTdHJpbmcubGVuZ3RoIC0gMSk7IGkrKykge1xuICAgICAgY3VycmVudFZhbHVlID0gY3VycmVudFZhbHVlW3Byb3BTdHJpbmdbaV1dO1xuICAgIH1cblxuICAgIGRlbGV0ZSBjdXJyZW50VmFsdWVbcHJvcFN0cmluZ1tpXV07XG4gIH1cbn07XG5sb2Rhc2hEZWVwRXh0cmFzLmRlZXBEZWxldGUgPSBkZWVwRGVsZXRlO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGxvZGFzaERlZXBFeHRyYXM7XG4iLCIvKipcbiAqIFRoaXMgdXRpbGl0eSBhc3N1bWVzIGBFbWJlcmAgZXhpc3RzIGdsb2JhbGx5XG4gKi9cbmltcG9ydCBsb2Rhc2hVdGlscyBmcm9tICcuL19jb3JlL2xvZGFzaC11dGlscyc7XG5cblxuLyoqXG4gKiBDb2xsZWN0aW9uIG9mIGFsbCB0aGUgdXRpbHMgaW4gaGVyZS4gQWRkIHRvIHRoaXMgYXMgeW91IGdvLlxuICovXG5leHBvcnQgdmFyIGxvZGFzaEVtYmVyID0ge307XG5cblxuLyoqXG4gKiBDaGVjayB0aGF0IGEgdmFsdWUgaXMgYW4gaW5zdGFuY2UsIGFzIGRlc2lnbmF0ZWQgYnkgRW1iZXJcbiAqXG4gKiBAbWV0aG9kIGlzRW1iZXJJbnN0YW5jZVxuICogQHBhcmFtIHsqfSB2YWx1ZTogVmFsdWUgdG8gY2hlY2tcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydCB2YXIgaXNFbWJlckluc3RhbmNlID0gKHZhbHVlKSA9PiBFbWJlci50eXBlT2YodmFsdWUpID09PSAnaW5zdGFuY2UnO1xubG9kYXNoRW1iZXIuaXNFbWJlckluc3RhbmNlID0gaXNFbWJlckluc3RhbmNlO1xuXG5cbi8qKlxuICogQ2hlY2sgdGhhdCBhIHZhbHVlIGlzLCBhdCBsZWFzdCwgYSBzdWJjbGFzcyBvZiBFbWJlci5PYmplY3RcbiAqXG4gKiBAbWV0aG9kIGlzRW1iZXJPYmplY3RcbiAqIEBwYXJhbSB7Kn0gdmFsdWU6IFZhbHVlIHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgdmFyIGlzRW1iZXJPYmplY3QgPSBsb2Rhc2hVdGlscy5tYWtlSXNUeXBlKEVtYmVyLk9iamVjdCk7XG5sb2Rhc2hFbWJlci5pc0VtYmVyT2JqZWN0ID0gaXNFbWJlck9iamVjdDtcblxuXG4vKipcbiAqIE5PVEU6IGlzRW1iZXJBcnJheSBoYXMgYmVlbiBleGNsdWRlZCBhcyBFbWJlci5BcnJheSBpcyBub3QgYW4gRW1iZXIuT2JqZWN0XG4gKi9cblxuXG4vKipcbiAqIENoZWNrIHRoYXQgYSB2YWx1ZSBpcywgYXQgbGVhc3QsIGEgc3ViY2xhc3Mgb2YgRW1iZXIuT2JqZWN0UHJveHlcbiAqXG4gKiBAbWV0aG9kIGlzRW1iZXJPYmplY3RQcm94eVxuICogQHBhcmFtIHsqfSB2YWx1ZTogVmFsdWUgdG8gY2hlY2tcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydCB2YXIgaXNFbWJlck9iamVjdFByb3h5ID0gbG9kYXNoVXRpbHMubWFrZUlzVHlwZShFbWJlci5PYmplY3RQcm94eSk7XG5sb2Rhc2hFbWJlci5pc0VtYmVyT2JqZWN0UHJveHkgPSBpc0VtYmVyT2JqZWN0UHJveHk7XG5cblxuLyoqXG4gKiBDaGVjayB0aGF0IGEgdmFsdWUgaXMsIGF0IGxlYXN0LCBhIHN1YmNsYXNzIG9mIEVtYmVyLkFycmF5UHJveHlcbiAqXG4gKiBAbWV0aG9kIGlzRW1iZXJBcnJheVByb3h5XG4gKiBAcGFyYW0geyp9IHZhbHVlOiBWYWx1ZSB0byBjaGVja1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0IHZhciBpc0VtYmVyQXJyYXlQcm94eSA9IGxvZGFzaFV0aWxzLm1ha2VJc1R5cGUoRW1iZXIuQXJyYXlQcm94eSk7XG5sb2Rhc2hFbWJlci5pc0VtYmVyQXJyYXlQcm94eSA9IGlzRW1iZXJBcnJheVByb3h5O1xuXG5cbi8qKlxuICogQ2hlY2sgdGhhdCB0aGUgdmFsdWUgaXMgYSBkZXNjZW5kZW50IG9mIGFuIEVtYmVyIENsYXNzXG4gKiBUT0RPOiBDaGVjayB0aGF0IGBfLmlzRW1iZXJJbnN0YW5jZWAgZG9lc24ndCBhbHJlYWR5IHlpZWxkIHRoZSBzYW1lIHJlc3VsdFxuICpcbiAqIEBtZXRob2QgaXNFbWJlckNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7Kn0gdmFsdWU6IFZhbHVlIHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgdmFyIGlzRW1iZXJDb2xsZWN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIChcbiAgICBfLmlzRW1iZXJPYmplY3QodmFsdWUpIHx8XG4gICAgXy5pc0VtYmVyT2JqZWN0UHJveHkodmFsdWUpIHx8XG4gICAgXy5pc0VtYmVyQXJyYXlQcm94eSh2YWx1ZSlcbiAgKTtcbn07XG5sb2Rhc2hFbWJlci5pc0VtYmVyQ29sbGVjdGlvbiA9IGlzRW1iZXJDb2xsZWN0aW9uO1xuXG5cbi8qKlxuICogQ2hlY2sgdGhhdCB2YWx1ZSBpcyBFbWJlciBUcmFuc2l0aW9uXG4gKlxuICogQG1ldGhvZCBpc0VtYmVyVHJhbnNpdGlvblxuICogQHBhcmFtIHsqfSB2YWx1ZTogVmFsdWUgdG8gY2hlY2tcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydCB2YXIgaXNFbWJlclRyYW5zaXRpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gKFxuICAgIF8uaXNGdW5jdGlvbih2YWx1ZSwgJ3RvU3RyaW5nJykgJiZcbiAgICBfLmNvbnRhaW5zKHZhbHVlLnRvU3RyaW5nKCksICdUcmFuc2l0aW9uJylcbiAgKTtcbn07XG5sb2Rhc2hFbWJlci5pc0VtYmVyVHJhbnNpdGlvbiA9IGlzRW1iZXJUcmFuc2l0aW9uO1xuXG5cbi8qKlxuICogTG9kYXNoIGZvckVhY2hcbiAqXG4gKiBAbWV0aG9kIF9mb3JFYWNoXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxTdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R8U3RyaW5nfSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqL1xuZXhwb3J0IHZhciBfZm9yRWFjaCA9IF8uZm9yRWFjaDtcbmxvZGFzaEVtYmVyLl9mb3JFYWNoID0gX2ZvckVhY2g7XG5cblxuLyoqXG4gKiBPdmVycmlkZSBsb2Rhc2ggYGZvckVhY2hgIHRvIHN1cHBvcnQgZW1iZXIgYXJyYXlzL29iamVjdHNcbiAqXG4gKiBAbWV0aG9kIGZvckVhY2hcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fFN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdHxTdHJpbmd9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICovXG5leHBvcnQgdmFyIGZvckVhY2ggPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICBpZiAoXy5pc0VtYmVyQXJyYXlQcm94eShjb2xsZWN0aW9uKSkge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLmZvckVhY2goY2FsbGJhY2ssIHRoaXMpO1xuICB9XG4gIGlmIChfLmlzRW1iZXJPYmplY3RQcm94eShjb2xsZWN0aW9uKSAmJiBfLmlzT2JqZWN0KGNvbGxlY3Rpb24uZ2V0KCdjb250ZW50JykpKSB7XG4gICAgcmV0dXJuIF9mb3JFYWNoKGNvbGxlY3Rpb24uZ2V0KCdjb250ZW50JyksIGNhbGxiYWNrLCB0aGlzQXJnKTtcbiAgfVxuICByZXR1cm4gX2ZvckVhY2goY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpO1xufTtcbmxvZGFzaEVtYmVyLmZvckVhY2ggPSBmb3JFYWNoO1xuXG5cbi8qKlxuICogTG9kYXNoIHJlZHVjZVxuICpcbiAqIEBtZXRob2QgX3JlZHVjZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R8U3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbY3VycmVudFZhbHVlXSB2YWx1ZSBhdCBiZWdpbm5pbmcgb2YgaXRlcmF0aW9uXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R8U3RyaW5nfSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqL1xuZXhwb3J0IHZhciBfcmVkdWNlID0gXy5yZWR1Y2U7XG5sb2Rhc2hFbWJlci5fcmVkdWNlID0gX3JlZHVjZTtcblxuXG4vKipcbiAqIE92ZXJyaWRlIGxvZGFzaCBgcmVkdWNlYCB0byBzdXBwb3J0IGVtYmVyIGFycmF5cy9vYmplY3RzXG4gKlxuICogQG1ldGhvZCByZWR1Y2VcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fFN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2N1cnJlbnRWYWx1ZV0gdmFsdWUgYXQgYmVnaW5uaW5nIG9mIGl0ZXJhdGlvblxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fFN0cmluZ30gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKi9cbmV4cG9ydCB2YXIgcmVkdWNlID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgY2FsbGJhY2ssIGN1cnJlbnRWYWx1ZSwgdGhpc0FyZykge1xuICBpZiAoXy5pc0VtYmVyQXJyYXlQcm94eShjb2xsZWN0aW9uKSkge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLnJlZHVjZShjYWxsYmFjaywgY3VycmVudFZhbHVlLCB0aGlzKTtcbiAgfVxuICBpZiAoXy5pc0VtYmVyT2JqZWN0UHJveHkoY29sbGVjdGlvbikgJiYgXy5pc09iamVjdChjb2xsZWN0aW9uLmdldCgnY29udGVudCcpKSkge1xuICAgIHJldHVybiBfcmVkdWNlKGNvbGxlY3Rpb24uZ2V0KCdjb250ZW50JyksIGNhbGxiYWNrLCBjdXJyZW50VmFsdWUsIHRoaXNBcmcpO1xuICB9XG4gIHJldHVybiBfcmVkdWNlKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCBjdXJyZW50VmFsdWUsIHRoaXNBcmcpO1xufTtcbmxvZGFzaEVtYmVyLnJlZHVjZSA9IHJlZHVjZTtcblxuXG4vKipcbiAqIExvZGFzaCBtYXBcbiAqXG4gKiBAbWV0aG9kIF9tYXBcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fFN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdHxTdHJpbmd9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICovXG5leHBvcnQgdmFyIF9tYXAgPSBfLm1hcDtcbmxvZGFzaEVtYmVyLl9tYXAgPSBfbWFwO1xuXG5cbi8qKlxuICogT3ZlcnJpZGUgbG9kYXNoIGBtYXBgIHRvIHN1cHBvcnQgZW1iZXIgYXJyYXlzL29iamVjdHNcbiAqXG4gKiBAbWV0aG9kIG1hcFxuICogQHBhcmFtIHtBcnJheXxPYmplY3R8U3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fFN0cmluZ30gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKi9cbmV4cG9ydCB2YXIgbWFwID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgaWYgKF8uaXNFbWJlckFycmF5UHJveHkoY29sbGVjdGlvbikpIHtcbiAgICByZXR1cm4gY29sbGVjdGlvbi5tYXAoY2FsbGJhY2ssIHRoaXMpO1xuICB9XG4gIHJldHVybiBfbWFwKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKTtcbn07XG5sb2Rhc2hFbWJlci5tYXAgPSBtYXA7XG5cblxuLyoqXG4gKiBMb2Rhc2ggYGdldGAgYWxpYXMgdG8gcHJpdmF0ZSBuYW1lc3BhY2VcbiAqXG4gKiBAbWV0aG9kIF9nZXRcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBjb2xsZWN0aW9uOiBUaGUgcm9vdCBjb2xsZWN0aW9uIG9mIHRoZSB0cmVlLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHByb3BlcnR5UGF0aDogVGhlIHByb3BlcnR5IHBhdGggaW4gdGhlIGNvbGxlY3Rpb24uXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHZhbHVlLCBvciB1bmRlZmluZWQgaWYgaXQgZG9lc24ndCBleGlzdHMuXG4gKi9cbmV4cG9ydCB2YXIgX2dldCA9IF8uZ2V0O1xubG9kYXNoRW1iZXIuX2dldCA9IF9nZXQ7XG5cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYW4gb2JqZWN0IHRyZWUuXG4gKlxuICogQG1ldGhvZCBnZXRcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBjb2xsZWN0aW9uOiBUaGUgcm9vdCBjb2xsZWN0aW9uIG9mIHRoZSB0cmVlLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHByb3BlcnR5UGF0aDogVGhlIHByb3BlcnR5IHBhdGggaW4gdGhlIGNvbGxlY3Rpb24uXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHZhbHVlLCBvciB1bmRlZmluZWQgaWYgaXQgZG9lc24ndCBleGlzdHMuXG4gKi9cbmV4cG9ydCB2YXIgZ2V0ID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgcHJvcGVydHlQYXRoKSB7XG4gIC8vIEhhbmRsZSBFbWJlciBPYmplY3RzXG4gIGlmIChpc0VtYmVyT2JqZWN0KGNvbGxlY3Rpb24pIHx8IGlzRW1iZXJPYmplY3RQcm94eShjb2xsZWN0aW9uKSkge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLmdldChwcm9wZXJ0eVBhdGgpO1xuICB9XG5cbiAgcmV0dXJuIF9nZXQoLi4uYXJndW1lbnRzKTtcbn07XG5sb2Rhc2hFbWJlci5nZXQgPSBnZXQ7XG5cblxuLyoqXG4gKiBMb2Rhc2ggYHNldGAgYWxpYXMgdG8gcHJpdmF0ZSBuYW1lc3BhY2VcbiAqXG4gKiBAbWV0aG9kIF9zZXRcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBjb2xsZWN0aW9uOiBUaGUgcm9vdCBjb2xsZWN0aW9uIG9mIHRoZSB0cmVlLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHByb3BlcnR5UGF0aDogVGhlIHByb3BlcnR5IHBhdGggaW4gdGhlIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0geyp9IHZhbHVlOiBUaGUgcHJvcGVydHkgcGF0aCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqIEByZXR1cm5zIHsqfSBUaGUgYGNvbGxlY3Rpb25gIHBhc3NlZCBpbiB3aXRoIHZhbHVlIHNldC5cbiAqL1xuZXhwb3J0IHZhciBfc2V0ID0gXy5zZXQ7XG5sb2Rhc2hFbWJlci5fc2V0ID0gX3NldDtcblxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhbiBvYmplY3QgdHJlZS5cbiAqXG4gKiBAbWV0aG9kIHNldFxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IGNvbGxlY3Rpb246IFRoZSByb290IGNvbGxlY3Rpb24gb2YgdGhlIHRyZWUuXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcHJvcGVydHlQYXRoOiBUaGUgcHJvcGVydHkgcGF0aCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWU6IFZhbHVlIHRvIHNldCBvbiB0aGUgY29sbGVjdGlvbi5cbiAqIEByZXR1cm5zIHsqfSBUaGUgYGNvbGxlY3Rpb25gIHBhc3NlZCBpbiB3aXRoIHZhbHVlIHNldC5cbiAqL1xuZXhwb3J0IHZhciBzZXQgPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBwcm9wZXJ0eVBhdGgsIHZhbHVlKSB7XG4gIC8vIEhhbmRsZSBFbWJlciBPYmplY3RzXG4gIGlmIChpc0VtYmVyT2JqZWN0KGNvbGxlY3Rpb24pIHx8IGlzRW1iZXJPYmplY3RQcm94eShjb2xsZWN0aW9uKSkge1xuICAgIGNvbGxlY3Rpb24uc2V0KHByb3BlcnR5UGF0aCwgdmFsdWUpO1xuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9XG5cbiAgcmV0dXJuIF9zZXQoLi4uYXJndW1lbnRzKTtcbn07XG5sb2Rhc2hFbWJlci5zZXQgPSBzZXQ7XG5cblxuLyoqXG4gKiBPcmlnaW5hbCBsb2Rhc2ggaXNFbXB0eVxuICpcbiAqIEBtZXRob2QgX2lzRW1wdHlcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydCB2YXIgX2lzRW1wdHkgPSBfLmlzRW1wdHk7XG5sb2Rhc2hFbWJlci5faXNFbXB0eSA9IF9pc0VtcHR5O1xuXG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgdmFsdWUgaXMgZW1wdHkgb3Igbm90XG4gKlxuICogQG1ldGhvZCBpc0VtcHR5XG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgdmFyIGlzRW1wdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoXG4gICAgXy5pc0VtYmVyQXJyYXlQcm94eSh2YWx1ZSkgJiZcbiAgICBfLmlzRnVuY3Rpb24odmFsdWUuaXNFbXB0eSlcbiAgKSB7XG4gICAgcmV0dXJuIHZhbHVlLmlzRW1wdHkoKTtcbiAgfVxuXG4gIHJldHVybiBfaXNFbXB0eSguLi5hcmd1bWVudHMpO1xufTtcbmxvZGFzaEVtYmVyLmlzRW1wdHkgPSBpc0VtcHR5O1xuXG5cbi8qKlxuICogT3JpZ2luYWwgbG9kYXNoIGNsb25lXG4gKlxuICogQG1ldGhvZCBfY2xvbmVcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4geyp9XG4gKi9cbmV4cG9ydCB2YXIgX2Nsb25lID0gXy5jbG9uZTtcbmxvZGFzaEVtYmVyLl9jbG9uZSA9IF9jbG9uZTtcblxuXG4vKipcbiAqIFJldHVybnMgYSBjbG9uZWQgY29weSBvZiB2YWx1ZVxuICpcbiAqIEBtZXRob2QgY2xvbmVcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4geyp9XG4gKi9cbmV4cG9ydCB2YXIgY2xvbmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAvLyBUT0RPOiBDcmVhdGUgc29tZSBzb3J0IG9mIGNsb25lIGZvciBFbWJlciBPYmplY3RzIGFuZCBBcnJheXNcbiAgcmV0dXJuIF9jbG9uZSguLi5hcmd1bWVudHMpO1xufTtcbmxvZGFzaEVtYmVyLmNsb25lID0gY2xvbmU7XG5cblxuLyoqXG4gKiBBbGlhcyBmb3IgYGFycmF5LnBvcGAgb3IgYGFycmF5UHJveHkucG9wT2JqZWN0YFxuICpcbiAqIEBtZXRob2QgcG9wXG4gKiBAcGFyYW0ge0FycmF5fEVtYmVyLkFycmF5UHJveHl9IHZhbHVlXG4gKiBAcmV0dXJuIHsqfVxuICovXG5leHBvcnQgdmFyIHBvcCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiAoXy5pc0VtYmVyQXJyYXlQcm94eSh2YWx1ZSkpID8gdmFsdWUucG9wT2JqZWN0KCkgOiB2YWx1ZS5wb3AoKTtcbn07XG5sb2Rhc2hFbWJlci5wb3AgPSBwb3A7XG5cblxuLyoqXG4gKiBBbGlhcyBmb3IgYGFycmF5LnNoaWZ0YCBvciBgYXJyYXlQcm94eS5zaGlmdE9iamVjdGBcbiAqXG4gKiBAbWV0aG9kIHNoaWZ0XG4gKiBAcGFyYW0ge0FycmF5fEVtYmVyLkFycmF5UHJveHl9IHZhbHVlXG4gKiBAcmV0dXJuIHsqfVxuICovXG5leHBvcnQgdmFyIHNoaWZ0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIChfLmlzRW1iZXJBcnJheVByb3h5KHZhbHVlKSkgPyB2YWx1ZS5zaGlmdE9iamVjdCgpIDogdmFsdWUuc2hpZnQoKTtcbn07XG5sb2Rhc2hFbWJlci5zaGlmdCA9IHNoaWZ0O1xuXG5cbi8qKlxuICogRW1iZXIgYHR5cGVPZmAgYWxpYXNcbiAqXG4gKiBAbWV0aG9kIHR5cGVPZlxuICogQHBhcmFtIHsqfSB2YWx1ZTogVmFsdWUgdG8gY2hlY2tcbiAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHR5cGUgb2YgYHZhbHVlYFxuICovXG5leHBvcnQgdmFyIHR5cGVPZiA9ICh2YWx1ZSkgPT4gRW1iZXIudHlwZU9mKHZhbHVlKTtcbmxvZGFzaEVtYmVyLnR5cGVPZiA9IHR5cGVPZjtcblxuXG4vKipcbiAqIFJTVlAgcmVzb2x2ZSBoZWxwZXJcbiAqXG4gKiBAbWV0aG9kIHByb21pc2VSZXNvbHZlXG4gKiBAcGFyYW0geyp9IHZhbHVlOiBWYWx1ZSB0byByZXNvbHZlIHdpdGhcbiAqIEByZXR1cm4ge1Byb21pc2V9XG4gKi9cbmV4cG9ydCB2YXIgcHJvbWlzZVJlc29sdmUgPSAodmFsdWUpID0+IHtcbiAgcmV0dXJuIEVtYmVyLlJTVlAucmVzb2x2ZSh2YWx1ZSk7XG59O1xubG9kYXNoRW1iZXIucHJvbWlzZVJlc29sdmUgPSBwcm9taXNlUmVzb2x2ZTtcblxuXG4vKipcbiAqIFJTVlAgcmVqZWN0IGhlbHBlclxuICpcbiAqIEBtZXRob2QgcHJvbWlzZVJlamVjdFxuICogQHBhcmFtIHsqfSB2YWx1ZTogVmFsdWUgdG8gcmVzb2x2ZSB3aXRoXG4gKiBAcmV0dXJuIHtQcm9taXNlfVxuICovXG5leHBvcnQgdmFyIHByb21pc2VSZWplY3QgPSAobWVzc2FnZSkgPT4ge1xuICBtZXNzYWdlID0gXy5lbnN1cmVTdHJpbmcobWVzc2FnZSk7XG4gIHJldHVybiBFbWJlci5SU1ZQLnJlamVjdChjb25zb2xlLmVycm9yKG1lc3NhZ2UpKTtcbn07XG5sb2Rhc2hFbWJlci5wcm9taXNlUmVqZWN0ID0gcHJvbWlzZVJlamVjdDtcblxuXG4vKipcbiAqIEdlbmVyYXRlIGRlZXAgYGlzYCBtZXRob2RzIGFuZCBvdmVycmlkZSBzdGFuZGFyZCBtZXRob2RzIHRvIGhhbmRsZSBib3RoXG4gKlxuICogQG1ldGhvZCBpc3tDb25kaXRpb259XG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWU6IEJhc2UgdmFsdWUgdG8gbG9vayB0aHJvdWdoXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFN0cmluZzogUHJvcGVydHkgc3RyaW5nIHRvIGFwcGx5IHRvIGBnZXRgXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5sb2Rhc2hVdGlscy5idWlsZElzTWV0aG9kcyhsb2Rhc2hFbWJlciwgbG9kYXNoRW1iZXIpO1xuXG5cbmV4cG9ydCB2YXIgbG9kYXNoRW1iZXI7XG5leHBvcnQgZGVmYXVsdCBsb2Rhc2hFbWJlcjtcbiIsImltcG9ydCBsb2Rhc2hVdGlscyBmcm9tICcuL19jb3JlL2xvZGFzaC11dGlscyc7XG5cblxuLyoqXG4gKiBDb2xsZWN0aW9uIG9mIGFsbCB0aGUgdXRpbHMgaW4gaGVyZS4gQWRkIHRvIHRoaXMgYXMgeW91IGdvLlxuICovXG5sZXQgbG9kYXNoRXh0cmFzID0ge307XG5cblxuLyoqXG4gKiBIZWxwZXIgdG8gY2hlY2sgaWYgYSB2YXJpYWJsZSBpcyBkZWZpbmVkIGFuZCBwcmVzZW50XG4gKlxuICogQG1ldGhvZCBpc1ByZXNlbnRcbiAqIEBwYXJhbSB7Kn0gdmFsdWU6IFZhbHVlIHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgdmFyIGlzUHJlc2VudCA9ICh2YWx1ZSkgPT4gKCFfLmlzVW5kZWZpbmVkKHZhbHVlKSAmJiAhXy5pc051bGwodmFsdWUpKTtcbmxvZGFzaEV4dHJhcy5pc1ByZXNlbnQgPSBpc1ByZXNlbnQ7XG5cblxuLyoqXG4gKiBIZWxwZXIgdG8gY2hlY2sgaWYgYSB2YXJpYWJsZSBpcyBkZWZpbmVkIGFuZCBwcmVzZW50XG4gKlxuICogQG1ldGhvZCBpc0JsYW5rXG4gKiBAcGFyYW0geyp9IHZhbHVlOiBWYWx1ZSB0byBjaGVja1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0IHZhciBpc0JsYW5rID0gKHZhbHVlKSA9PiAhXy5pc1ByZXNlbnQodmFsdWUpO1xubG9kYXNoRXh0cmFzLmlzQmxhbmsgPSBpc0JsYW5rO1xuXG5cbi8qKlxuICogSGVscGVyIHRvIGNoZWNrIGlmIGEgdmFyaWFibGUgaXMgYSBkYXRlXG4gKlxuICogQG1ldGhvZCBpc0RhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWU6IFZhbHVlIHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgdmFyIGlzRGF0ZSA9ICh2YWx1ZSkgPT4gXy50eXBlT2YodmFsdWUpID09PSAnZGF0ZSc7XG5sb2Rhc2hFeHRyYXMuaXNEYXRlID0gaXNEYXRlO1xuXG5cbi8qKlxuICogSGVscGVyIHRvIGNoZWNrIGlmIGEgdmFyaWFibGUgaXMgYSBwcm9taXNlXG4gKlxuICogQG1ldGhvZCBpc1Byb21pc2VcbiAqIEBwYXJhbSB7Kn0gdmFsdWU6IFZhbHVlIHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgdmFyIGlzUHJvbWlzZSA9ICh2YWx1ZSkgPT4gXy5pc0Z1bmN0aW9uKHZhbHVlLCAndGhlbicpO1xubG9kYXNoRXh0cmFzLmlzUHJvbWlzZSA9IGlzUHJvbWlzZTtcblxuXG4vKipcbiAqIEhlbHBlciB0byBjaGVjayBhIHZhbHVlIGZvciBhbiBhcnJheSBvZiBMb0Rhc2ggYm9vbGVhbiBjb25kaXRpb25zXG4gKiBUT0RPOiBOYW1lIHRoaXMgYGlzQW5kYCBhbmQgY3JlYXRlIGBpc09yYC4uLlxuICpcbiAqIEBtZXRob2QgaXNcbiAqIEBwYXJhbSB7Kn0gdmFsdWU6IFZhbHVlIHRvIGNoZWNrXG4gKiBAcGFyYW0ge0FycmF5fSBjb25kaXRpb25zOiBMb0Rhc2ggbWV0aG9kcyB0byBoYXZlIHZhbHVlIHRlc3RlZCBhZ2FpbnN0IChhcyBzdHJpbmdzKVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0IHZhciBpcyA9IGZ1bmN0aW9uKHZhbHVlLCBjb25kaXRpb25zKSB7XG4gIGlmIChfLmlzU3RyaW5nKGNvbmRpdGlvbnMpKSBjb25kaXRpb25zID0gW2NvbmRpdGlvbnNdO1xuICBpZiAoXy5pc1ByZXNlbnQoY29uZGl0aW9ucykgJiYgIV8uaXNBcnJheShjb25kaXRpb25zKSkgY29uZGl0aW9ucyA9IFtdO1xuICBpZiAoY29uZGl0aW9ucy5sZW5ndGggPD0gMSkgY29uc29sZS5lcnJvcihcIkRvbid0IGNhbGwgYGlzYCBoZWxwZXIgd2l0aCBqdXN0IG9uZSBjb25kaXRpb24tIHVzZSB0aGF0IGNvbmRpdGlvbiBkaXJlY3RseVwiKTtcbiAgcmV0dXJuIF8uZXZlcnkoY29uZGl0aW9ucywgZnVuY3Rpb24oY29uZGl0aW9uKSB7XG4gICAgbGV0IHJlc3VsdCwgbm90O1xuXG4gICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbmRpdGlvblxuICAgIGlmICghXy5pc1N0cmluZyhjb25kaXRpb24pKSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJgY29uZGl0aW9uYCB3YXMgbm90IGEgc3RyaW5nOiBcIiArIGNvbmRpdGlvbik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIG5vdCBjb25kaXRpb25cbiAgICBub3QgPSBmYWxzZTtcbiAgICBpZiAoXy5zdGFydHNXaXRoKGNvbmRpdGlvbiwgJyEnKSkge1xuICAgICAgbm90ID0gdHJ1ZTtcbiAgICAgIGNvbmRpdGlvbiA9IGNvbmRpdGlvbi5yZXBsYWNlKCchJywgJycpO1xuICAgIH1cblxuICAgIC8vIEJlIEVYVFJBICh0b28pIGhlbHBmdWwgKHByZXBlbmQgJ2lzJyBpZiBvbW1pdHRlZClcbiAgICBpZiAoIV8uc3RhcnRzV2l0aChjb25kaXRpb24sICdpcycpKSB7XG4gICAgICBjb25kaXRpb24gPSAnaXMnICsgY29uZGl0aW9uO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSBgY29uZGl0aW9uYCBpcyBhIHZhbGlkIGxvZGFzaCBtZXRob2RcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihfW2NvbmRpdGlvbl0pKSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJgY29uZGl0aW9uYCB3YXMgbm90IGEgdmFsaWQgbG9kYXNoIG1ldGhvZDogXCIgKyBjb25kaXRpb24pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSByZXN1bHQgYW5kIHJldHVyblxuICAgIHJlc3VsdCA9IF9bY29uZGl0aW9uXSh2YWx1ZSk7XG4gICAgaWYgKG5vdCA9PT0gdHJ1ZSkgcmV0dXJuICFyZXN1bHQ7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcbn07XG5sb2Rhc2hFeHRyYXMuaXMgPSBpcztcblxuXG4vKipcbiAqIEdlbmVyYXRlIGBlbnN1cmVgIG1ldGhvZHMtIEVuc3VyZSB0aGF0IHZhbHVlIGlzIG9mIHR5cGUgeFxuICpcbiAqIEBtZXRob2QgZW5zdXJle1R5cGV9XG4gKiBAcGFyYW0geyp9IHZhbHVlOiBUbyBjaGVja1xuICogQHBhcmFtIHsqfSBbdmFsdWVEZWZhdWx0PWRlZmF1bHRzW2NvbmRpdGlvbl06IFdoYXQgdG8gZGVmYXVsdCB0b1xuICogQHJldHVybiB7Kn0gRW5zdXJlZCB2YWx1ZVxuICovXG5fLmZvckVhY2goXG4gIF8ua2V5cyhsb2Rhc2hVdGlscy50eXBlRGVmYXVsdHMoKSksXG4gICh0eXBlKSA9PiB7XG4gICAgbG9kYXNoRXh0cmFzW2BlbnN1cmUke3R5cGV9YF0gPSBsb2Rhc2hVdGlscy5tYWtlRW5zdXJlVHlwZSh0eXBlKTtcbiAgfVxuKTtcblxuXG4vKipcbiAqIEphdmFzY3JpcHQgYHR5cGVvZmAgYWxpYXNcbiAqXG4gKiBAbWV0aG9kIHR5cGVPZlxuICogQHBhcmFtIHsqfSB2YWx1ZTogVmFsdWUgdG8gY2hlY2tcbiAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHR5cGUgb2YgYHZhbHVlYFxuICovXG5leHBvcnQgdmFyIHR5cGVPZiA9ICh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlO1xubG9kYXNoRXh0cmFzLnR5cGVPZiA9IHR5cGVPZjtcblxuXG5leHBvcnQgZGVmYXVsdCBsb2Rhc2hFeHRyYXM7XG4iLCIvKipcbiAqIFRoaXMgdXRpbGl0eSBhc3N1bWVzIGBFbWJlcmAgZXhpc3RzIGdsb2JhbGx5XG4gKi9cbmltcG9ydCBsb2Rhc2hVdGlscyBmcm9tICcuL19jb3JlL2xvZGFzaC11dGlscyc7XG5cblxuLyoqXG4gKiBDb2xsZWN0aW9uIG9mIGFsbCB0aGUgdXRpbHMgaW4gaGVyZS4gQWRkIHRvIHRoaXMgYXMgeW91IGdvLlxuICovXG5sZXQgbG9kYXNoTW9tZW50ID0ge307XG5cblxuLyoqXG4gKiBDaGVjayBpZiBhIHZhcmlhYmxlIGlzIGEgbW9tZW50IGRhdGUgb2JqZWN0XG4gKlxuICogQG1ldGhvZCBpc01vbWVudFxuICogQHBhcmFtIHsqfSB2YWx1ZTogVmFsdWUgdG8gY2hlY2tcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydCB2YXIgaXNNb21lbnQgPSAodmFsdWUpID0+IHtcbiAgcmV0dXJuIG1vbWVudC5pc01vbWVudCh2YWx1ZSk7XG59O1xubG9kYXNoTW9tZW50LmlzTW9tZW50ID0gaXNNb21lbnQ7XG5cblxuLyoqXG4gKiBFbnN1cmUgdmFsdWUgaXMgYSBtb21lbnQgb2JqZWN0LlxuICogSWYgbm90LCB0cmllcyB0byBjcmVhdGUgYSBtb21lbnQgb2JqZWN0IGZyb20gdmFsdWUsXG4gKiBvdGhlcndpc2UgcmV0dXJucyBtb21lbnQoKS5cbiAqXG4gKiBAbWV0aG9kIGVuc3VyZU1vbWVudFxuICogQHBhcmFtIHsqfSB2YWx1ZTogVmFsdWUgdG8gY2hlY2tcbiAqIEBwYXJhbSB7Kn0gdmFsdWVEZWZhdWx0OiBXaGF0IHRvIGRlZmF1bHQgdG9cbiAqIEByZXR1cm4ge01vbWVudH1cbiAqL1xuZXhwb3J0IHZhciBlbnN1cmVNb21lbnQgPSAodmFsdWUsIHZhbHVlRGVmYXVsdCkgPT4ge1xuICBpZiAoaXNNb21lbnQodmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gIHZhbHVlID0gbW9tZW50KHZhbHVlKTtcbiAgaWYgKHZhbHVlLmlzVmFsaWQoKSkgcmV0dXJuIHZhbHVlO1xuICBpZiAoaXNNb21lbnQodmFsdWVEZWZhdWx0KSkgcmV0dXJuIHZhbHVlRGVmYXVsdDtcbiAgcmV0dXJuIG1vbWVudCgpO1xufTtcbmxvZGFzaE1vbWVudC5lbnN1cmVNb21lbnQgPSBlbnN1cmVNb21lbnQ7XG5cblxuLyoqXG4gKiBDaGVjayBpZiBgZGF0ZWAgaXMgYWZ0ZXIgb3Igc2FtZSBhcyBgZGF0ZVRvQ29tcGFyZWBcbiAqIFJldHVybnMgZmFsc2UgaWYgZWl0aGVyIGlzIG5vdCBgTW9tZW50YFxuICpcbiAqIEBtZXRob2QgYWZ0ZXJcbiAqIEBwYXJhbSB7TW9tZW50fSBkYXRlXG4gKiBAcGFyYW0ge01vbWVudH0gZGF0ZVRvQ29tcGFyZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZXhwb3J0IHZhciBhZnRlciA9IGxvZGFzaFV0aWxzLmJ1aWxkSW5jbHVzaXZlQ29tcGFyZSgnaXNBZnRlcicsIGxvZGFzaE1vbWVudCk7XG5sb2Rhc2hNb21lbnQuYWZ0ZXIgPSBhZnRlcjtcblxuXG4vKipcbiAqIENoZWNrIGlmIGBkYXRlYCBpcyBiZWZvcmUgb3Igc2FtZSBhcyBgZGF0ZVRvQ29tcGFyZWBcbiAqIFJldHVybnMgZmFsc2UgaWYgZWl0aGVyIGlzIG5vdCBgTW9tZW50YFxuICpcbiAqIEBtZXRob2QgYmVmb3JlXG4gKiBAcGFyYW0ge01vbWVudH0gZGF0ZVxuICogQHBhcmFtIHtNb21lbnR9IGRhdGVUb0NvbXBhcmVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydCB2YXIgYmVmb3JlID0gbG9kYXNoVXRpbHMuYnVpbGRJbmNsdXNpdmVDb21wYXJlKCdpc0JlZm9yZScsIGxvZGFzaE1vbWVudCk7XG5sb2Rhc2hNb21lbnQuYmVmb3JlID0gYmVmb3JlO1xuXG5cbi8qKlxuICogR2VuZXJhdGUgZGVlcCBgaXNgIG1ldGhvZHMgYW5kIG92ZXJyaWRlIHN0YW5kYXJkIG1ldGhvZHMgdG8gaGFuZGxlIGJvdGhcbiAqXG4gKiBAbWV0aG9kIGlze0NvbmRpdGlvbn1cbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZTogQmFzZSB2YWx1ZSB0byBsb29rIHRocm91Z2hcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wU3RyaW5nOiBQcm9wZXJ0eSBzdHJpbmcgdG8gYXBwbHkgdG8gYGdldGBcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmxvZGFzaFV0aWxzLmJ1aWxkSXNNZXRob2RzKGxvZGFzaE1vbWVudCwgbG9kYXNoTW9tZW50KTtcblxuXG5leHBvcnQgZGVmYXVsdCBsb2Rhc2hNb21lbnQ7XG4iXX0=
