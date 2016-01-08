"use strict";

var _ = require('lodash');

// A collection of optional JSONSchema parsers. See below.
//

// https://github.com/epoberezkin/ajv
//
var ajv = require('ajv')({
    allErrors:        false,
    removeAdditional: false,
    verbose:          false,
    format:           'fast',
    formats:          {},
    schemas:          {},
    meta:             true,
    validateSchema:   true,
    inlineRefs:       true,
    missingRefs:      true,
    uniqueItems:      true,
    unicode:          true,
    beautify:         false,
    jsonPointers:     false,
    i18n:             false,
    messages:         true
});

// https://github.com/bugventure/jsen
//
var jsen = require('jsen');

// https://github.com/mafintosh/is-my-json-valid
//
var isMyJSONValid = require('is-my-json-valid');

var validators = {
    ajv : function $ajv(schema) {
        return ajv.compile(schema);
    },
    jsen : function $jsen(schema) {
        return jsen(schema);
    },
    isMyJSONValid : function $isMyJSONValid(schema) {
        return isMyJSONValid(schema, {
            // #verbose ensures .errors property on error
            //
            verbose: true,
            greedy: true
        });
    }
};

module.exports = function(opts) {

    opts = opts || {};

    var compiledSchemas = {};

    // Default; using 'ajv' if none sent.
    //
    var selectedValidator;

    if(!use(opts.useValidator)) {
        use('ajv');
    }

    function set(key, schema) {

        if(!_.isPlainObject(schema)) {
            throw new Error('Non-object sent as #schema to strategist.set');
        };

        if(!_.isString(key)) {
            throw new Error('Non-string sent as #key to strategist.key');
        };

        return (compiledSchemas[key] = selectedValidator(schema));
    }

    function get(key) {

        if(!compiledSchemas[key]) {
            throw new Error('Non-existent #key sent to strategist.get');
        };

        return compiledSchemas[key];
    }

    function use(validator) {
        if(validators[validator]) {
            selectedValidator = validators[validator];
            return true;
        }
        return false;
    }

    function validate(key, json) {

        if(!_.isPlainObject(json)) {
            throw new Error('Non-object sent as #json to strategist.validate');
        };

        if(!_.isString(key)) {
            throw new Error('Non-string sent as #key to strategist.validate');
        };

        if(!compiledSchemas[key]) {
            throw new Error('Non-existent #key sent to strategist.validate');
        };

        return compiledSchemas[key](json) ? true : compiledSchemas[key].errors;
    }

    return {
        set : set,
        get : get,
        validate : validate,
        use: use
    };
}
