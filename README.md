# buffer-split-transform

Creates a transform stream that splits chunks without intermediate string conversion.

## usage

```javascript
import split from 'buffer-split-transform'

// source is a readable stream which emits:
// <Buffer 74 68 69 73 20 69 73 0a 69 74>
const sink = source.pipe(split())

sink.on(`data`, console.log)
// <Buffer 74 68 69 73 20 69 73>
// <Buffer 69 74>
```

## api

`split([delimiter], [options])`

`delimiter` if set overrides the default delimiter of `Buffer.from('\n')`.

`options` defualts to:

```javascript
{ flushRemainingChunk: true }
```

If `flushRemainingChunk` is set to false, the remainder of a split chunk will be omitted when the source stream ends. This can be useful if you are only interested in data which ends with the specified delimiter.

In cases where extra verbosity is desired, split can be called like so:

```javascript
split({
  delimiter: Buffer.from(`\n\n`),
  flushRemainingChunk: false
})
```
