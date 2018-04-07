/* global describe, it */
'use strict';

var expect = require('expect.js');
var parser = require('../../');

describe('exports', function () {
    it('should have a `parse` export', function () {
        expect(parser).to.have.property('parse');
        expect(parser.parse).to.be.a('function');
    });

    it('should have a `SyntaxError` export', function () {
        expect(parser).to.have.property('SyntaxError');
        expect(parser.SyntaxError).to.be.a('function');
    });
});

describe('parse()', function () {
    var parse = parser.parse;

    it('should expect a String argument', function () {
        expect(parse).withArgs('').to.not.throwException();

        expect(parse).withArgs().to.throwException();
        expect(parse).withArgs(undefined).to.throwException();
        expect(parse).withArgs(null).to.throwException();
    });

    it('should return an AST object', function () {
        var ast = parse('');
        expect(ast).to.be.an('object');
        expect(ast.type).to.equal('messageFormatPattern');
        expect(ast.elements).to.be.an('array');
        expect(ast.elements).to.be.empty(0);
    });

    describe('parse("Hello, World!")', function () {
        var msg = 'Hello, World!';
        var ast = parse(msg);

        it('should contain 1 `elements`', function () {
            expect(ast.elements).to.have.length(1);
        });

        it('should contain a `messageTextElement`', function () {
            var element = ast.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('messageTextElement');
            expect(element).to.have.property('value');
            expect(element.value).to.equal(msg);
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 13, line: 1, column: 14 },
            });
        });
    });

    describe('parse("Hello, {name}!")', function () {
        var msg = 'Hello, {name}!';
        var ast = parse(msg);

        it('should contain 3 `elements`', function () {
            expect(ast.elements).to.have.length(3);
        });

        it('should first contain a `messageTextElement`', function () {
            var element = ast.elements[0];
            expect(element.value).to.equal('Hello, ');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 7, line: 1, column: 8 },
            });
        });

        it('should then contain an `argumentElement`', function () {
            var element = ast.elements[1];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('argumentElement');
            expect(element).to.have.property('id');
            expect(element.id).to.equal('name');
            expect(element).to.have.property('format');
            expect(element.format).to.equal(null);
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 7, line: 1, column: 8 },
                end: { offset: 13, line: 1, column: 14 },
            });
        });

        it('should finally contain a `messageTextElement`', function () {
            var element = ast.elements[2];
            expect(element.value).to.equal('!');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 13, line: 1, column: 14 },
                end: { offset: 14, line: 1, column: 15 },
            });
        });
    });

    describe('parse("Hello, {user.name, highlight}!")', function () {
        var msg = 'Hello, {user.name, highlight}!';
        var ast = parse(msg);

        it('should contain 3 `elements`', function () {
            expect(ast.elements).to.have.length(3);
        });

        it('should first contain a `messageTextElement`', function () {
            var element = ast.elements[0];
            expect(element.value).to.equal('Hello, ');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 7, line: 1, column: 8 },
            });
        });

        it('should then contain an `argumentElement`', function () {
            var element = ast.elements[1];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('argumentElement');
            expect(element).to.have.property('id');
            expect(element.id).to.equal('user.name');
            expect(element).to.have.property('format');
            expect(element.format).to.eql({
                type: 'customFormat',
                formatName: 'highlight',
                args: [],
                location: {
                    start: { offset: 19, line: 1, column: 20 },
                    end: { offset: 28, line: 1, column: 29 }
                }
            });
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 7, line: 1, column: 8 },
                end: { offset: 29, line: 1, column: 30 },
            });
        });

        it('should finally contain a `messageTextElement`', function () {
            var element = ast.elements[2];
            expect(element.value).to.equal('!');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 29, line: 1, column: 30 },
                end: { offset: 30, line: 1, column: 31 },
            });
        });
    });

    describe('parse("{num, number, percent}")', function () {
        var msg = '{num, number, percent}';
        var ast = parse(msg);

        it('should contain 1 `elements`', function () {
            expect(ast.elements).to.have.length(1);
        });

        it('should contain an `argumentElement`', function () {
            var element = ast.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('argumentElement');
            expect(element).to.have.property('id');
            expect(element.id).to.equal('num');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 22, line: 1, column: 23 },
            });
            expect(element).to.have.property('format');

            var format = element.format;
            expect(format).to.be.an('object');
            expect(format).to.have.property('type');
            expect(format.type).to.equal('customFormat');
            expect(format).to.have.property('args');
            expect(format.args).to.eql(['percent']);
            expect(format).to.have.property('location');
            expect(format.location).to.eql({
                start: { offset: 6, line: 1, column: 7 },
                end: { offset: 21, line: 1, column: 22 },
            });
        });
    });

    describe('parse("{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}")', function () {
        var msg = '{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}';
        var ast = parse(msg);

        it('should contain 1 `elements`', function () {
            expect(ast.elements).to.have.length(1);
        });

        it('should contain an `argumentElement`', function () {
            var element = ast.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('argumentElement');
            expect(element).to.have.property('id');
            expect(element.id).to.equal('numPhotos');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 64, line: 1, column: 65 },
            });
            expect(element).to.have.property('format');

            var format = element.format;
            expect(format).to.be.an('object');
            expect(format).to.have.property('type');
            expect(format.type).to.equal('pluralFormat');
            expect(format).to.have.property('offset');
            expect(format.offset).to.equal(0);
            expect(format).to.have.property('location');
            expect(format.location).to.eql({
                start: { offset: 12, line: 1, column: 13 },
                end: { offset: 63, line: 1, column: 64 },
            });
        });

        it('should contain 3 `options`', function () {
            var options = ast.elements[0].format.options;
            expect(options).to.have.length(3);

            var option = options[0];
            expect(option).to.be.an('object');
            expect(option).to.have.property('type');
            expect(option.type).to.equal('optionalFormatPattern');
            expect(option).to.have.property('selector');
            expect(option.selector).to.equal('=0');
            expect(option).to.have.property('value');
            expect(option.value).to.be.an('object');
            expect(option).to.have.property('location');
            expect(option.location).to.eql({
                start: { offset: 20, line: 1, column: 21 },
                end: { offset: 33, line: 1, column: 34 },
            });

            expect(options[1].selector).to.equal('=1');
            expect(options[2].selector).to.equal('other');
        });

        it('should contain nested `messageFormatPattern` values for each option', function () {
            var options = ast.elements[0].format.options;

            var value = options[0].value;
            expect(value).to.have.property('type');
            expect(value.type).to.equal('messageFormatPattern');
            expect(value).to.have.property('elements');
            expect(value.elements).to.be.an('array');
            expect(value.elements).to.have.length(1);

            var element = value.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('messageTextElement');
            expect(element).to.have.property('value');
            expect(element.value).to.equal('no photos');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 23, line: 1, column: 24 },
                end: { offset: 32, line: 1, column: 33 },
            });

            expect(options[1].value.elements[0].value).to.equal('one photo');
            expect(options[2].value.elements[0].value).to.equal('# photos');
        });
    });

    describe('parse("{floor, selectordinal, =0{ground} one{#st} two{#nd} few{#rd} other{#th}} floor")', function () {
        var msg = '{floor, selectordinal, =0{ground} one{#st} two{#nd} few{#rd} other{#th}} floor';
        var ast = parse(msg);

        it('should contain 2 `elements`', function () {
            expect(ast.elements).to.have.length(2);
        });

        it('should contain an `argumentElement`', function () {
            var element = ast.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('argumentElement');
            expect(element).to.have.property('id');
            expect(element.id).to.equal('floor');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 72, line: 1, column: 73 },
            });
            expect(element).to.have.property('format');

            var format = element.format;
            expect(format).to.be.an('object');
            expect(format).to.have.property('type');
            expect(format.type).to.equal('pluralFormat');
            expect(format).to.have.property('offset');
            expect(format.offset).to.equal(0);
            expect(format.ordinal).to.equal(true);
            expect(format).to.have.property('location');
            expect(format.location).to.eql({
                start: { offset: 8, line: 1, column: 9 },
                end: { offset: 71, line: 1, column: 72 },
            });
        });

        it('should contain 5 `options`', function () {
            var options = ast.elements[0].format.options;
            expect(options).to.have.length(5);

            var option = options[0];
            expect(option).to.be.an('object');
            expect(option).to.have.property('type');
            expect(option.type).to.equal('optionalFormatPattern');
            expect(option).to.have.property('selector');
            expect(option.selector).to.equal('=0');
            expect(option).to.have.property('value');
            expect(option.value).to.be.an('object');
            expect(option).to.have.property('location');
            expect(option.location).to.eql({
                start: { offset: 23, line: 1, column: 24 },
                end: { offset: 33, line: 1, column: 34 },
            });

            expect(options[1].selector).to.equal('one');
            expect(options[2].selector).to.equal('two');
            expect(options[3].selector).to.equal('few');
            expect(options[4].selector).to.equal('other');
        });

        it('should contain nested `messageFormatPattern` values for each option', function () {
            var options = ast.elements[0].format.options;

            var value = options[0].value;
            expect(value).to.have.property('type');
            expect(value.type).to.equal('messageFormatPattern');
            expect(value).to.have.property('elements');
            expect(value.elements).to.be.an('array');
            expect(value.elements).to.have.length(1);

            var element = value.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('messageTextElement');
            expect(element).to.have.property('value');
            expect(element.value).to.equal('ground');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 26, line: 1, column: 27 },
                end: { offset: 32, line: 1, column: 33 },
            });

            expect(options[0].value.elements[0].value).to.equal('ground');
            expect(options[1].value.elements[0].value).to.equal('#st');
            expect(options[2].value.elements[0].value).to.equal('#nd');
            expect(options[3].value.elements[0].value).to.equal('#rd');
            expect(options[4].value.elements[0].value).to.equal('#th');
        });
    });

    describe('parse("{gender, select, female {woman} male {man} other {person}}")', function () {
        var msg = '{gender, select, female {woman} male {man} other {person}}';
        var ast = parse(msg);

        it('should contain 1 `elements`', function () {
            expect(ast.elements).to.have.length(1);
        });

        it('should contain an `argumentElement`', function () {
            var element = ast.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('argumentElement');
            expect(element).to.have.property('id');
            expect(element.id).to.equal('gender');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 58, line: 1, column: 59 },
            });
            expect(element).to.have.property('format');

            var format = element.format;
            expect(format).to.be.an('object');
            expect(format).to.have.property('type');
            expect(format.type).to.equal('selectFormat');
            expect(format).to.have.property('location');
            expect(format.location).to.eql({
                start: { offset: 9, line: 1, column: 10 },
                end: { offset: 57, line: 1, column: 58 },
            });
        });

        it('should contain 3 `options`', function () {
            var options = ast.elements[0].format.options;
            expect(options).to.have.length(3);

            var option = options[0];
            expect(option).to.be.an('object');
            expect(option).to.have.property('type');
            expect(option.type).to.equal('optionalFormatPattern');
            expect(option).to.have.property('selector');
            expect(option.selector).to.equal('female');
            expect(option).to.have.property('value');
            expect(option.value).to.be.an('object');
            expect(option).to.have.property('location');
            expect(option.location).to.eql({
                start: { offset: 17, line: 1, column: 18 },
                end: { offset: 31, line: 1, column: 32 },
            });

            expect(options[1].selector).to.equal('male');
            expect(options[2].selector).to.equal('other');
        });

        it('should contain nested `messageFormatPattern` values for each option', function () {
            var options = ast.elements[0].format.options;

            var value = options[0].value;
            expect(value).to.have.property('type');
            expect(value.type).to.equal('messageFormatPattern');
            expect(value).to.have.property('elements');
            expect(value.elements).to.be.an('array');
            expect(value.elements).to.have.length(1);

            var element = value.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('messageTextElement');
            expect(element).to.have.property('value');
            expect(element.value).to.equal('woman');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 25, line: 1, column: 26 },
                end: { offset: 30, line: 1, column: 31 },
            });

            expect(options[1].value.elements[0].value).to.equal('man');
            expect(options[2].value.elements[0].value).to.equal('person');
        });

        it('should accept an empty `other` option', function () {
            var msg = '{gender, select, female {woman} male {man} other {}}';
            var ast = parse(msg);
            var options = ast.elements[0].format.options;

            expect(options[2].selector).to.equal('other');
            expect(options[2].value.elements.length).to.equal(0);
        });

        it('should include "hasOther: true" when an "other" option is defined', function () {
            var msg = '{gender, select, female {woman} male {man} other {}}';
            expect(parse(msg).elements[0].hasOther).to.equal(true);
        });
    });

    describe('parse("{gender, select, female {woman} male {man}}")', function () {
        it('should include "hasOther: false" when missing an "other" option', function () {
            var msg = '{gender, select, female {woman} male {man}}';
            expect(parse(msg).elements[0].hasOther).to.equal(false);
        });
    });

    describe('parse("{name, string, strong}")', function () {
        var msg = '{ name , string , strong }';
        var ast = parse(msg);

        it('should contain 1 `elements`', function () {
            expect(ast.elements).to.have.length(1);
        });

        it('should contain an `argumentElement`', function () {
            var element = ast.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('argumentElement');
            expect(element).to.have.property('id');
            expect(element.id).to.equal('name');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 26, line: 1, column: 27 },
            });
            expect(element).to.have.property('format');

            var format = element.format;
            expect(format).to.be.an('object');
            expect(format).to.have.property('type');
            expect(format.type).to.equal('customFormat');
            expect(format).to.have.property('formatName');
            expect(format.formatName).to.equal('string');
            expect(format).to.have.property('args');
            expect(format.args).to.eql(['strong']);
            expect(format).to.have.property('location');
            expect(format.location).to.eql({
                start: { offset: 9, line: 1, column: 10 },
                end: { offset: 25, line: 1, column: 26 },
            });
        });
    });

    describe('parse("{name, multi, a, b, c}")', function () {
        var msg = '{ name , multi , a,b, c }';
        var ast = parse(msg);

        it('should contain 1 `elements`', function () {
            expect(ast.elements).to.have.length(1);
        });

        it('should contain an `argumentElement`', function () {
            var element = ast.elements[0];
            expect(element).to.be.an('object');
            expect(element).to.have.property('type');
            expect(element.type).to.equal('argumentElement');
            expect(element).to.have.property('id');
            expect(element.id).to.equal('name');
            expect(element).to.have.property('location');
            expect(element.location).to.eql({
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 25, line: 1, column: 26 },
            });
            expect(element).to.have.property('format');

            var format = element.format;
            expect(format).to.be.an('object');
            expect(format).to.have.property('type');
            expect(format.type).to.equal('customFormat');
            expect(format).to.have.property('formatName');
            expect(format.formatName).to.equal('multi');
            expect(format).to.have.property('args');
            expect(format.args).to.eql(['a', 'b', 'c']);
            expect(format).to.have.property('location');
            expect(format.location).to.eql({
                start: { offset: 9, line: 1, column: 10 },
                end: { offset: 24, line: 1, column: 25 },
            });
        });
    });

    describe('whitespace', function () {
        it('should allow whitespace in and around `messageTextElement`s', function () {
            var msg = '   some random test   ';
            var ast = parse(msg);
            expect(ast.elements[0].value).to.equal(msg);
        });

        it('should allow whitespace in `argumentElement`s', function () {
            var msg = '{  num , number,percent  }';
            var ast = parse(msg);

            var element = ast.elements[0];
            expect(element.id).to.equal('num');
            expect(element.format.type).to.equal('customFormat');
            expect(element.format.args).to.eql(['percent']);
        });

        it('should preserve whitespace in plurals', function () {
            var msg = '{total, plural, =0{} =1{ / #} other{}}';
            var ast = parse(msg);
            var element = ast.elements[0].format.options[1].value.elements[0];
            expect(element.value).to.equal(' / #');
        });
    });

    describe('escaping', function () {
        it('should allow escaping of syntax chars via `\\\\`', function () {
            expect(parse('\\{').elements[0].value).to.equal('{');
            expect(parse('\\}').elements[0].value).to.equal('}');
            expect(parse('\\u003C').elements[0].value).to.equal('<');

            // Escaping "#" needs to be special-cased so it remains escaped so
            // the runtime doesn't replace it when in a `pluralFormat` option.
            expect(parse('\\#').elements[0].value).to.equal('\\#');
        });

        it('should allow backslash chars in `messageTextElement`s', function () {
            expect(parse('\\u005c').elements[0].value).to.equal('\\');
            expect(parse('\\\\').elements[0].value).to.equal('\\');
        });

        it('should accept html markup in `messageTextElement`s', function () {
            expect(parse('<b>hello</b>').elements[0].value).to.equal('<b>hello</b>');
        });
    });

    describe('argument and tag names', function () {
        it('should allow `.` in name, but not in first or last position', function () {
            expect(parse('{a.b}').elements[0].id).to.equal('a.b');
            expect(parse).withArgs('{.a}').to.throwException();
            expect(parse).withArgs('{a.}').to.throwException();

            expect(parse('<x:a.b>a</x:a.b>').elements[0].name).to.equal('a.b');
            expect(parse).withArgs('<x:.b>a</x:.b>').to.throwException();
            expect(parse).withArgs('<x:a.>a</x:a.>').to.throwException();

            expect(parse('<x:a.b />').elements[0].name).to.equal('a.b');
            expect(parse).withArgs('<x:.b />').to.throwException();
            expect(parse).withArgs('<x:a. />').to.throwException();
        });
    });

    describe('parse("hello <x:0>bob</x:0> welcome<x:1/>")', function () {
        var msg = 'hello <x:0>bob</x:0> welcome<x:1/>';
        var ast = parse(msg);

        it('should contain 4 `elements`', function () {
            expect(ast.elements).to.have.length(4);
            expect(ast.elements[0].type).to.equal("messageTextElement");
            expect(ast.elements[1].type).to.equal("tagElement");
            expect(ast.elements[2].type).to.equal("messageTextElement");
            expect(ast.elements[3].type).to.equal("selfClosingTagElement");
        });

        it('should contain a numbered `tagElement`', function () {
            var element = ast.elements[1];
            expect(element.type).to.equal("tagElement");
            expect(element.name).to.equal("0");
            expect(element.value.type).to.equal("messageFormatPattern");
            expect(element.value.elements).to.have.length(1);
            expect(element.value.elements[0].type).to.equal("messageTextElement");
            expect(element.value.elements[0].value).to.equal("bob");
        });

        it('should contain a `messageTextElement`', function () {
            var element = ast.elements[2];
            expect(element.type).to.equal("messageTextElement");
            expect(element.value).to.equal(" welcome");
        });

        it('should contain a numbered `selfClosingTagElement`', function () {
            var element = ast.elements[3];
            expect(element.type).to.equal("selfClosingTagElement");
            expect(element.name).to.equal("1");
        });
    });

    describe('parse("hello <x:name><bob></x:name> welcome<x:emoji/>")', function () {
        var msg = 'hello <x:name><bob></x:name> welcome<x:emoji/>';
        var ast = parse(msg);

        it('should contain 4 `elements`', function () {
            expect(ast.elements).to.have.length(4);
            expect(ast.elements[0].type).to.equal("messageTextElement");
            expect(ast.elements[1].type).to.equal("tagElement");
            expect(ast.elements[2].type).to.equal("messageTextElement");
            expect(ast.elements[3].type).to.equal("selfClosingTagElement");
        });

        it('should contain a named`tagElement`', function () {
            var element = ast.elements[1];
            expect(element.type).to.equal("tagElement");
            expect(element.name).to.equal("name");
            expect(element.value.type).to.equal("messageFormatPattern");
            expect(element.value.elements).to.have.length(1);
            expect(element.value.elements[0].type).to.equal("messageTextElement");
            expect(element.value.elements[0].value).to.equal("<bob>");
        });

        it('should contain a `messageTextElement`', function () {
            var element = ast.elements[2];
            expect(element.type).to.equal("messageTextElement");
            expect(element.value).to.equal(" welcome");
        });

        it('should contain a named `selfClosingTagElement`', function () {
            var element = ast.elements[3];
            expect(element.type).to.equal("selfClosingTagElement");
            expect(element.name).to.equal("emoji");
        });
    });

    describe('parse("hello <x:highlight>{name}</x:highlight> welcome<x:emoji/>")', function () {
        var msg = 'hello <x:highlight>{name}</x:highlight> welcome<x:emoji/>';
        var ast = parse(msg);

        it('should contain 4 `elements`', function () {
            expect(ast.elements).to.have.length(4);
            expect(ast.elements[0].type).to.equal("messageTextElement");
            expect(ast.elements[1].type).to.equal("tagElement");
            expect(ast.elements[2].type).to.equal("messageTextElement");
            expect(ast.elements[3].type).to.equal("selfClosingTagElement");
        });

        it('should contain a named`tagElement`', function () {
            var element = ast.elements[1];
            expect(element.type).to.equal("tagElement");
            expect(element.name).to.equal("highlight");
            expect(element.value.type).to.equal("messageFormatPattern");
            expect(element.value.elements).to.have.length(1);
            expect(element.value.elements[0].type).to.equal("argumentElement");
            expect(element.value.elements[0].id).to.equal("name");
        });

        it('should contain a `messageTextElement`', function () {
            var element = ast.elements[2];
            expect(element.type).to.equal("messageTextElement");
            expect(element.value).to.equal(" welcome");
        });

        it('should contain a named `selfClosingTagElement`', function () {
            var element = ast.elements[3];
            expect(element.type).to.equal("selfClosingTagElement");
            expect(element.name).to.equal("emoji");
        });
    });

    describe('parse("<x:link>click <x:important>here</x:important> to continue</x:link>")', function () {
        var msg = '<x:link>click <x:important>here</x:important> to continue</x:link>';
        var ast = parse(msg);

        it('should contain 1 `element`', function () {
            expect(ast.elements).to.have.length(1);
        });

        it('should contain a `tagElement`', function () {
            var element = ast.elements[0];
            expect(element.type).to.equal("tagElement");
            expect(element.name).to.equal("link");
            expect(element.value.type).to.equal("messageFormatPattern");
            expect(element.value.elements).to.have.length(3);
            expect(element.value.elements[0].type).to.equal("messageTextElement");
            expect(element.value.elements[0].value).to.equal("click ");
            expect(element.value.elements[1].type).to.equal("tagElement");
            expect(element.value.elements[1].name).to.equal("important");
            expect(element.value.elements[1].value.type).to.equal("messageFormatPattern");
            expect(element.value.elements[1].value.elements).to.have.length(1);
            expect(element.value.elements[1].value.elements[0].type).to.equal("messageTextElement");
            expect(element.value.elements[1].value.elements[0].value).to.equal("here");
            expect(element.value.elements[2].type).to.equal("messageTextElement");
            expect(element.value.elements[2].value).to.equal(" to continue");
        });
    });

    describe('parse("<x:hello>error</x:world>")', function () {
        var msg = '<x:hello>error</x:world>';

        it('should throw an error', function () {
            expect(parse).withArgs(msg).to.throwException();
        });
    });
});
