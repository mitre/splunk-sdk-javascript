
// Copyright 2014 Splunk, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"): you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

var assert = require('chai').assert;
var ET = require("elementtree");

var splunkjs = require('../../index');
var testUtils = require("./utils");

exports.setup = function () {
    var ModularInput = splunkjs.ModularInputs;
    var Scheme = ModularInput.Scheme;
    var Argument = ModularInput.Argument;
    var utils = ModularInput.utils;

    splunkjs.Logger.setLevel("ALL");

    return (
        describe("Scheme tests", function () {

            it("Generate XML from scheme with default values", function () {
                // Checks the Scheme generated by creating a Scheme object and setting no fields on it.
                // This test checks for sane defaults in the Scheme class.

                var myScheme = new Scheme("abcd");

                var constructed = myScheme.toXML();
                var expected = ET.parse(utils.readFile(__filename, "../data/scheme_with_defaults.xml")).getroot();

                assert.equal(myScheme.title, "abcd");
                assert.equal(myScheme.description, null);
                assert.equal(myScheme.useExternalValidation, true);
                assert.equal(myScheme.useSingleInstance, false);
                assert.equal(myScheme.streamingMode, Scheme.streamingModeXML);
                assert.ok(testUtils.XMLCompare(expected, constructed));
                ;
            });

            it("Generate XML from scheme", function () {
                // Checks that the XML generated by a Scheme object with all its fields set and
                // some arguments added matches what we expect

                var myScheme = new Scheme("abcd");
                myScheme.description = "쎼 and 쎶 and <&> für";
                myScheme.streamingMode = Scheme.streamingModeSimple;
                myScheme.useExternalValidation = false;
                myScheme.useSingleInstance = true;

                assert.equal(myScheme.title, "abcd");
                assert.equal(myScheme.description, "쎼 and 쎶 and <&> für");
                assert.equal(myScheme.streamingMode, Scheme.streamingModeSimple);
                assert.equal(myScheme.useExternalValidation, false);
                assert.equal(myScheme.useSingleInstance, true);

                var arg1 = new Argument({
                    name: "arg1"
                });
                myScheme.addArgument(arg1);

                assert.equal(myScheme.args[0].name, arg1.name);
                assert.equal(myScheme.args[0].requiredOnEdit, arg1.requiredOnEdit);
                assert.equal(myScheme.args[0].requiredOnCreate, arg1.requiredOnCreate);

                var arg2 = new Argument({
                    name: "arg2",
                    description: "쎼 and 쎶 and <&> für",
                    validation: "is_pos_int('some_name')",
                    dataType: Argument.dataTypeNumber,
                    requiredOnEdit: true,
                    requiredOnCreate: true
                });
                myScheme.addArgument(arg2);

                assert.equal(myScheme.args[1].name, arg2.name);
                assert.equal(myScheme.args[1].requiredOnEdit, arg2.requiredOnEdit);
                assert.equal(myScheme.args[1].requiredOnCreate, arg2.requiredOnCreate);

                assert.equal(myScheme.args.length, 2);

                var constructed = myScheme.toXML();
                var expected = ET.parse(utils.readFile(__filename, "../data/scheme_without_defaults.xml")).getroot();

                assert.ok(testUtils.XMLCompare(expected, constructed));
                ;
            });

            it("Generate XML from argument with default values", function () {
                // Checks that the XML produced from an Argument object that is initialized has
                // is what we expect. This is mostly a check of the default values.

                var myArg = new Argument({ name: "some_name" });

                var root = ET.Element("");
                var constructed = myArg.addToDocument(root);

                var expected = ET.parse(utils.readFile(__filename, "../data/argument_with_defaults.xml")).getroot();

                assert.equal(myArg.name, "some_name");
                assert.equal(myArg.requiredOnEdit, false);
                assert.equal(myArg.requiredOnCreate, false);
                assert.ok(testUtils.XMLCompare(expected, constructed));
                ;
            });

            it("Generate XML from argument", function () {
                // Checks that the XML generated by an Argument object with all possible set matches what
                // we expect.

                var myArg = new Argument({
                    name: "some_name",
                    description: "쎼 and 쎶 and <&> für",
                    validation: "is_pos_int('some_name')",
                    dataType: Argument.dataTypeBoolean,
                    requiredOnEdit: true,
                    requiredOnCreate: true
                });

                assert.equal(myArg.name, "some_name");
                assert.equal(myArg.description, "쎼 and 쎶 and <&> für");
                assert.equal(myArg.validation, "is_pos_int('some_name')");
                assert.equal(myArg.dataType, Argument.dataTypeBoolean);
                assert.equal(myArg.requiredOnEdit, true);
                assert.equal(myArg.requiredOnCreate, true);

                var root = ET.Element("");
                var constructed = myArg.addToDocument(root);

                var expected = ET.parse(utils.readFile(__filename, "../data/argument_without_defaults.xml")).getroot();
                assert.ok(testUtils.XMLCompare(expected, constructed));
                ;
            });
        })
    );
};

// Run the individual test suite
if (module.id === __filename && module.parent.id.includes('mocha')) {
    module.exports = exports.setup();
}