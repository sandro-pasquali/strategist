"use strict";

var path = require('path');
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

    // Test against all validators
    //
    ['ajv','jsen','isMyJSONValid'].forEach(function(validator) {

        strategist.use(validator)

        var schemaSet = strategist.set(testkey, testSchema);
        var schemaGet = strategist.get(testkey);

        test.ok(schemaSet, 'schema was successfully #set using -> ' + validator);

        test.equal(schemaSet, schemaGet, '#get got the same schema that was #set using -> ' + validator);

        test.equal(strategist.validate(testkey, goodJSON), true, 'valid JSON is passing using -> ' + validator);

        test.notEqual(strategist.validate(testkey, badJSON), true, 'invalid JSON is failing using -> ' + validator);
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

    // #use
    //
    test.equal(strategist.use('foo'), false, 'Schemap returns false on unrecognized validator name');

    test.equal(strategist.use('ajv'), true, 'Schemap returns true on recognized validator name');

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
