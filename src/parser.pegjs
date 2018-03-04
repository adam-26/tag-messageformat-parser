/*
Extends the ICU format with support for named 'tags'
Named tags allow translators to infer what
translated content will be styled without having to
be concerned with what that style/markdown is.

This approach ensure the styles applied to any translated
content can be changed without impacting the translated content.

All tags MUST be assigned a name, use the name to
hint to the translator what style(s) will be applied
to the text.

A name CAN be a number, but this is primarily intended to
support use-cases where code generation (ie: babel plugins)
is used to define the message descriptors.

All tags must use the following syntax:
 - opening tag: <x:NAME>
 - closing tag: </x:NAME>
 - self-closing tag: <x:NAME />

It's not recommended to use self-closing tags,
they lack context for translators.
*/

/*
Extends: https://github.com/yahoo/intl-messageformat-parser/blob/master/src/parser.pegjs
Copyright 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/*
Inspired by and derivied from:
messageformat.js https://github.com/SlexAxton/messageformat.js
Copyright 2014 Alex Sexton
Apache License, Version 2.0
*/

start
    = messageFormatPattern

messageFormatPattern
    = elements:messageFormatElement* {
        return {
            type    : 'messageFormatPattern',
            elements: elements,
            location: location()
        };
    }

messageFormatElement
    = messageTextElement
    / argumentElement
    / tagElement
    / selfClosingTag

messageText
    = text:(_ chars _)+ {
        var string = '',
            i, j, outerLen, inner, innerLen;

        for (i = 0, outerLen = text.length; i < outerLen; i += 1) {
            inner = text[i];

            for (j = 0, innerLen = inner.length; j < innerLen; j += 1) {
                string += inner[j];
            }
        }

        return string;
    }
    / $(ws)

messageTextElement
    = messageText:messageText {
        return {
            type : 'messageTextElement',
            value: messageText,
            location: location()
        };
    }

// --- Tags ---
tagElement =
  startTag:startTag content:messageFormatPattern endTag:endTag {
    if (startTag.name != endTag.name) {
      throw new Error(
        "Expected </x:" + startTag.name + "> but </x:" + endTag.name + "> found."
      );
    }

    return {
      type: 'tagElement',
      name: startTag.name,
      value: content,
    };
  }

startTag =
  "<x:" name:tagName ">" {
    return { name: name };
  }

endTag =
  "</x:" name:tagName ">" {
    return { name: name };
  }

selfClosingTag = "<x:" name:tagName _"/>" {
  return {
    type: "selfClosingTagElement",
    name: name,
  }
}

tagName = chars:$([_a-zA-Z0-9][._a-zA-Z0-9]*) {
    if (chars[chars.length - 1] === ".") {
      throw new Error('tag name "<x:' + chars + '>" can not end in "."');
    }

    return chars;
  }

// --- Arguments ---
argument
    = id:(number
    / $([^ \t\n\r,.+={}#][^ \t\n\r,+={}#]*)) {
      if (id[id.length - 1] === '.') {
        throw new Error('argument id "' + id + '" can not end in "."');
      }
      return id;
    }

argumentElement
    = '{' _ id:argument _ format:(',' _ elementFormat)? _ '}' {
        return {
            type  : 'argumentElement',
            id    : id,
            format: format && format[2],
            location: location()
        };
    }

elementFormat
    = element:(simpleFormat
    / pluralFormat
    / selectOrdinalFormat
    / selectFormat) {
      if (typeof element.options === 'undefined') {
        return element;
      }

      var hasOther = false;
      var options = element.options;
	  for (var i = 0, len = options.length; i < len; i++) {
	    if (options[i].type === "optionalFormatPattern" && options[i].selector === "other") {
	  	  hasOther = true;
	  	  break;
	    }
	  }

	  if (!hasOther) {
	    throw new Error('U_DEFAULT_KEYWORD_MISSING: "' + element.type + '" requires an "other" option.');
	  }

      return element;
    }

simpleFormat
    = type:('number' / 'date' / 'time') _ style:(',' _ chars)? {
        return {
            type : type + 'Format',
            style: style && style[2],
            location: location()
        };
    }

pluralFormat
    = 'plural' _ ',' _ pluralStyle:pluralStyle {
        return {
            type   : pluralStyle.type,
            ordinal: false,
            offset : pluralStyle.offset || 0,
            options: pluralStyle.options,
            location: location()
        };
    }

selectOrdinalFormat
    = 'selectordinal' _ ',' _ pluralStyle:pluralStyle {
        return {
            type   : pluralStyle.type,
            ordinal: true,
            offset : pluralStyle.offset || 0,
            options: pluralStyle.options,
            location: location()
        }
    }

selectFormat
    = 'select' _ ',' _ options:optionalFormatPattern+ {
        return {
            type   : 'selectFormat',
            options: options,
            location: location()
        };
    }

selector
    = $('=' number)
    / chars

optionalFormatPattern
    = _ selector:selector _ '{' pattern:messageFormatPattern '}' {
        return {
            type    : 'optionalFormatPattern',
            selector: selector,
            value   : pattern,
            location: location()
        };
    }

offset
    = 'offset:' _ number:number {
        return number;
    }

pluralStyle
    = offset:offset? _ options:optionalFormatPattern+ {
        return {
            type   : 'pluralFormat',
            offset : offset,
            options: options,
            location: location()
        };
    }

// -- Helpers ------------------------------------------------------------------

ws 'whitespace' = [ \t\n\r]+
_ 'optionalWhitespace' = $(ws*)

digit    = [0-9]
hexDigit = [0-9a-f]i

number = digits:('0' / $([1-9] digit*)) {
    return parseInt(digits, 10);
}

char
    = [^<{}\\\0-\x1F\x7f \t\n\r]
    / '\\\\' { return '\\'; }
    / '\\#'  { return '\\#'; }
    / '\\{'  { return '\u007B'; }
    / '\\}'  { return '\u007D'; }
    / '\\<'  { return '\u003C'; }
    / '\\u'  digits:$(hexDigit hexDigit hexDigit hexDigit) {
        return String.fromCharCode(parseInt(digits, 16));
    }

chars = chars:char+ { return chars.join(''); }
