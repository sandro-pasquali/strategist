"use strict";

var path = require('path');
var _ = require('lodash');
var strategist = require('../../lib')();

module.exports = function(test, Promise) {

    var testkey = 'testkey';
    var testSchema = this;

    var goodJSON = {
        firstName: 'Jack',
        lastName: 'Spratt'
    };

    var badJSON = {
        firstName: 'Jack',
        lastName: 'Spratt',
        age: "eighteeen" // Error! Schema expects an Integer
    };

    var badSchema = {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "strategist test",
        "type": "object",
        "properties": {
            "foobar": {
                type: "this is an invalid type"
            }
        }
    };

    // Test against all validators
    //
    ['ajv','isMyJSONValid'].forEach(function(validator) {

        strategist.use(validator);

        test.throws(function() {
            strategist.compile(badSchema);
        }, 'Correctly throws when invalid schema sent to #validateSchema using -> ' + validator);


        var schemaSet = strategist.set(testkey, testSchema);
        var schemaGet = strategist.get(testkey);
        var good = strategist.validate(testkey, goodJSON);
        var bad = strategist.validate(testkey, badJSON);

        test.ok(schemaGet, 'schema was successfully #set using -> ' + validator);

        test.equal(schemaSet, schemaGet, '#get got the same schema that was #set using -> ' + validator);

        test.equal(good.valid, true, 'valid JSON is passing using -> ' + validator);

        test.notEqual(bad.valid, true, 'invalid JSON is failing using -> ' + validator);

        test.ok(_.isArray(bad.errors), 'Error array being returned on failed validations using -> ' + validator);
    })

    // Test API call signature error handling
    //

    // #set
    //
    test.throws(function() {
        strategist.set('foo', 2)
    }, 'Schemap throws if non-object schema sent to #set');

    test.throws(function() {
        strategist.set(1, {})
    }, 'Schemap throws if non-string key sent to #set');

    // #get
    //
    test.throws(function() {
        strategist.get('foo')
    }, 'Schemap throws if non-existent key sent to #get');

    // #original
    //
    test.deepEqual(strategist.original('testkey'), testSchema, 'Correctly storing #original Schema');

    // #defaults
    //
    test.deepEqual({age:18}, strategist.defaults('testkey'), 'Correctly fetching #defaults');

    // #use
    //
    test.throws(function() {
        strategist.use('foo');
    }, 'Schemap throws on unrecognized validator #use');

    test.ok(_.isFunction(strategist.use('ajv')), 'Schemap returns validator on recognized validator name');

    // #validate
    //
    test.throws(function() {
        strategist.validate('foo', 2)
    }, 'Schemap throws if non-object schema sent to #validate');

    test.throws(function() {
        strategist.validate(1, {})
    }, 'Schemap throws if non-string key sent to #validate');

    test.throws(function() {
        strategist.validate('foo', {})
    }, 'Schemap throws if non-existent key sent to #validate');

    return Promise.resolve();
};
