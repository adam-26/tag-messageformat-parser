Tag MessageFormat Parser
=========================

Parses [ICU Message strings][ICU] into an AST via JavaScript, with added support for tags.

[![npm](https://img.shields.io/npm/v/tag-messageformat-parser.svg)](https://www.npmjs.com/package/tag-messageformat-parser)
[![npm](https://img.shields.io/npm/dm/tag-messageformat-parser.svg)](https://www.npmjs.com/package/tag-messageformat-parser)
[![CircleCI branch](https://img.shields.io/circleci/project/github/adam-26/tag-messageformat-parser/master.svg)](https://circleci.com/gh/adam-26/tag-messageformat-parser/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/7a31719342df75c9c81e/maintainability)](https://codeclimate.com/github/adam-26/tag-messageformat-parser/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7a31719342df75c9c81e/test_coverage)](https://codeclimate.com/github/adam-26/tag-messageformat-parser/test_coverage)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Sauce Test Status](https://saucelabs.com/buildstatus/YOUR_SAUCE_USERNAME)](https://saucelabs.com/u/YOUR_SAUCE_USERNAME)

> This is a fork of [intl-messageformat-parser](https://github.com/yahoo/intl-messageformat-parser)

_Differences_ from the original package:
 * `Tags` are supported in messages - this is **not** part of the ICU message "spec"
 * The `other` option is **required** for `plural`, `select` and `selectordinal` as is required by other ICU parsers
 * Whitespace in `plural` messages is preserved
 * `.` is permitted to be used in argument and tag names

What is a tag?
--------
A `tag` enables style _placeholders_ to be included in the translation message _without_ including any of the
style information in the translation message.

This provides 3 benefits:
  1. It decouples the styling of the text from the translations, allowing the styling to change independently of translations.
  2. It allows translation messages to retain context for text that will be styled
  3. Tags can be named to provide _hints_ to translators

A tag **must** adhere to the following conventions:
 * begin with `<x:`
 * The tag name can include only numbers, ascii letters, underscore and dot `.`.
 * must be closed, self-closing tags are supported but should be used sparingly as they can be confusing for translators
 * Valid tag examples:
   * `<x:0>hello</x:0>`
   * `<x:link>click me</x:link>`
   * `<x:emoji />`

Here's an _simple_ example:

```js
var parser = require('tag-messageformat-parser');

parser.parse('By signing up you agree to our <x:link>terms and conditions</x:link>');

```

Using **descriptive names** for tag names can provide hints to translators about the purpose of the tags.
In the above example, the text `terms and conditions` will be used to display a link the user can click on.

Tags and arguments can be used in combination in ICU message formats.

This example uses a `{name}` argument in a tag.

```js
parser.parse('Welcome back <x:bold>{name}</x:bold>');
```

Overview
--------

This package implements a parser in JavaScript that parses the industry standard [ICU Message strings][ICU] — used for internationalization — into an AST. The produced AST can then be used by a compiler, like [`tag-messageformat`](https://github.com/adam-26/tag-messageformat), to produce localized formatted strings for display to users.

This parser is written in [PEG.js][], a parser generator for JavaScript. This parser's implementation was inspired by and derived from Alex Sexton's [messageformat.js][] project. The differences from Alex's implementation are:

- This project is standalone.
- It's authored as ES6 modules compiled to CommonJS and the Bundle format for the browser.
- The produced AST is more descriptive and uses recursive structures.
- The keywords used in the AST match the ICU Message "spec".


Usage
-----

### Loading in the Browser

The `dist/` folder contains the version of this package for use in the browser, and it can be loaded and used like this:

```html
<script src="tag-messageformat-parser/dist/parser.min.js"></script>
<script>
    IntlMessageFormatParser.parse('...');
</script>
```

### Loading in Node.js

This package can also be `require()`-ed in Node.js:

```js
var parser = require('tag-messageformat-parser');
parser.parse('...');
```

### Example

Given an ICU Message string like this:

```
On {takenDate, date, short} {name} took {numPhotos, plural,
    =0 {no photos.}
    =1 {one photo.}
    other {# photos.}
}
```

```js
// Assume `msg` is the string above.
parser.parse(msg);
```

This parser will produce this AST:

```json
{
    "type": "messageFormatPattern",
    "elements": [
        {
            "type": "messageTextElement",
            "value": "On "
        },
        {
            "type": "argumentElement",
            "id": "takenDate",
            "format": {
                "type": "dateFormat",
                "style": "short"
            }
        },
        {
            "type": "messageTextElement",
            "value": " "
        },
        {
            "type": "argumentElement",
            "id": "name",
            "format": null
        },
        {
            "type": "messageTextElement",
            "value": " took "
        },
        {
            "type": "argumentElement",
            "id": "numPhotos",
            "format": {
                "type": "pluralFormat",
                "offset": 0,
                "options": [
                    {
                        "type": "optionalFormatPattern",
                        "selector": "=0",
                        "value": {
                            "type": "messageFormatPattern",
                            "elements": [
                                {
                                    "type": "messageTextElement",
                                    "value": "no photos."
                                }
                            ]
                        }
                    },
                    {
                        "type": "optionalFormatPattern",
                        "selector": "=1",
                        "value": {
                            "type": "messageFormatPattern",
                            "elements": [
                                {
                                    "type": "messageTextElement",
                                    "value": "one photo."
                                }
                            ]
                        }
                    },
                    {
                        "type": "optionalFormatPattern",
                        "selector": "other",
                        "value": {
                            "type": "messageFormatPattern",
                            "elements": [
                                {
                                    "type": "messageTextElement",
                                    "value": "# photos."
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}
```

Big Thanks
-------

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

License
-------

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file](https://github.com/adam-26/tag-messageformat-parser/blob/master/LICENSE) for license text and copyright information.

[homepage]: https://saucelabs.com