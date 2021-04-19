# zero-fill [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/zero-fill/master.svg
[travis-url]: https://travis-ci.org/feross/zero-fill
[npm-image]: https://img.shields.io/npm/v/zero-fill.svg
[npm-url]: https://npmjs.org/package/zero-fill
[downloads-image]: https://img.shields.io/npm/dm/zero-fill.svg
[downloads-url]: https://npmjs.org/package/zero-fill
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### Zero-fill a number to the given size.

![zero](https://raw.githubusercontent.com/feross/zero-fill/master/img.png)

## install

```
npm install zero-fill
```

## usage

```js
var zeroFill = require('zero-fill')

zeroFill(4, 1) // '0001'
zeroFill(10, 55) // '0000000055'
zeroFill(1, 1) // '1'
```

Partial application:

```js
zeroFill(4)(1) // '0001'
```

Custom padding character:

```js
zeroFill(4, 55, ' ')  // '  55'
zeroFill(4, 500, ' ') // ' 500'
```

## license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).

