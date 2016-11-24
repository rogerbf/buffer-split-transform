import { Transform } from 'stream'
import split from 'recursive-buffer-split'

export default (...args) => {
  const config = Object.assign(
    {
      delimiter: Buffer.from(`\n`),
      flushRemainingChunk: true
    },
    args.reduce((config, arg) => {
      const type = arg.constructor.name
      if (type === `Buffer` || type === `String` || type === `Number`) {
        return { ...config, delimiter: arg }
      } else if (type === `Boolean`) {
        return { ...config, flushRemainingChunk: arg }
      } else if (type === `Object`) {
        return { ...config, ...arg }
      } else throw new Error(`could not parse arguments`)
    }, {})
  )

  const delimiter = Buffer.from(config.delimiter.toString())
  const flushRemainingChunk = config.flushRemainingChunk

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
        if (flushRemainingChunk) {
          this.push(this.remaining)
        }
        next()
      }
    }),
    {
      remaining: Buffer.alloc(0)
    }
  )
}
