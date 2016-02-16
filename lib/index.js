"use strict";

var _ = require('lodash');
var schemaDefaults = require('json-schema-defaults');

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

// https://github.com/mafintosh/is-my-json-valid
//
var isMyJSONValid = require('is-my-json-valid');

var validators = {
    ajv : function $ajv(schema) {
        return ajv.compile(schema);
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
    var originalSchemas = {};

    // Default; using 'ajv' if none sent.
    //
    var selectedValidator;

    if(opts.validator) {
        use(opts.validator);
    } else {
        use('ajv');
    }

    function set(key, schema) {

        if(!_.isPlainObject(schema)) {
            throw new Error('Non-object sent as #schema to strategist.set');
        };

        if(!_.isString(key)) {
            throw new Error('Non-string sent as #key to strategist.key');
        };

        compiledSchemas[key] = selectedValidator(schema);
        originalSchemas[key] = schema;

        return compiledSchemas[key];
    }

    function get(key) {

        if(!compiledSchemas[key]) {
            throw new Error('Non-existent #key sent to strategist.get');
        };

        return compiledSchemas[key];
    }

    function original(key) {

        if(!originalSchemas[key]) {
            throw new Error('Non-existent #key sent to strategist.getOriginal');
        };

        return originalSchemas[key];
    }

    function defaults(key) {

        if(!originalSchemas[key]) {
            throw new Error('Non-existent #key sent to strategist.key');
        };

        return schemaDefaults(originalSchemas[key]);
    }

    function use(validator) {

        if(!validators[validator]) {
            throw new Error('Attempt to #use unsupported validator: ' + validator)
        }
        return (selectedValidator = validators[validator]);
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

        var valid = compiledSchemas[key](json);

        return {

            // Boolean
            //
            valid : valid,

            // Diff implementations set #errors variously so set explicitly.
            //
            errors : valid ? false : compiledSchemas[key].errors
        };
    }

    function compile(schema) {

        if(!_.isPlainObject(schema)) {
            throw new Error('Non-object sent as #schema to strategist.compile');
        };

        // If this fails, it will throw
        //
        return selectedValidator(schema);
    }

    return {
        set : set,
        get : get,
        original : original,
        defaults : defaults,
        validate : validate,
        compile : compile,
        use: use
    };
}
