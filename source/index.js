import { Transform } from 'readable-stream'
import split from 'recursive-buffer-split'

export default (...args) => {
  const { delimiter, flushRemainingChunk } = Object.assign(
    {
      delimiter: Buffer.from(`\n`),
      flushRemainingChunk: true
    },
    args.reduce((config, arg) => {
      let type
      try {
        type = arg.constructor.name
      } catch (e) {
        throw new TypeError(
          `could not parse argument, try Buffer.from()?`
        )
      }
      if (type === `Buffer` || type === `String` || type === `Number`) {
        return { ...config, delimiter: Buffer.from(arg.toString()) }
      } else if (type === `Object`) {
        return {
          ...config,
          ...Object.keys(arg).reduce((acc, k) => {
            if (k === `delimiter`) {
              return { ...acc, delimiter: Buffer.from(arg[k].toString()) }
            } else {
              return { ...acc, [k]: arg[k] }
            }
          }, {})
        }
      } else {
        throw new TypeError(`could not parse argument, try Buffer.from()?`)
      }
    }, {})
  )

  return Object.assign(
    new Transform({
      transform (chunk, encoding, next) {
        const chunks = split(
          delimiter, Buffer.concat([ this.remaining, chunk ])
        )
        const lastChunk = chunks.slice(-1)[0]

        if (lastChunk.length === 0) {
          chunks.map(chunk => this.push(chunk))
          this.remaining = Buffer.alloc(0)
        } else {
          chunks.slice(0, -1).map(chunk => this.push(chunk))
          this.remaining = lastChunk
        }

        next()
      },
      flush (next) {
        if (flushRemainingChunk) { this.push(this.remaining) }
        next()
      }
    }),
    { remaining: Buffer.alloc(0) }
  )
}
