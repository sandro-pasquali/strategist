'use strict';

module.exports = function(test) {

    return {
        "title": "Example Schema",
        "type": "object",
        "properties": {
            "firstName": {
                "type": "string"
            },
            "lastName": {
                "type": "string"
            },
            "age": {
                "description": "Age in years",
                "type": "integer",
                "minimum": 0,
                "default": 18
            }
        },
        "required": ["firstName", "lastName"]
    };
};