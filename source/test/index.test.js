import test from 'tape'
import split from '../index'
import { Readable } from 'stream'

const createTestStream = data => {
  return Object.assign(
    new Readable({
      read () {
        if (this.data.length > 0) {
          this.push(this.data.shift())
        } else {
          this.push(null)
        }
      }
    }),
    { data }
  )
}

test(`split`, assert => {
  assert.equal(typeof (split), `function`)
  assert.end()
})

test(`split() returns a transform stream`, assert => {
  const s = split()
  assert.equal(s.constructor.name, `Transform`)
  assert.end()
})

test(`expected chunks, no arguments`, assert => {
  const testdata = createTestStream([
    Buffer.from(`hello there `),
    Buffer.from(`this is\na `),
    Buffer.from(`fancy\n`),
    Buffer.from(`stream`)
  ])

  const expected = {
    dataEvents: 3,
    data: [
      Buffer.from(`hello there this is`),
      Buffer.from(`a fancy`),
      Buffer.from(`stream`)
    ]
  }

  let dataEvents = 0

  const output = testdata.pipe(split())

  output.on(`data`, data => {
    dataEvents = dataEvents + 1
    assert.equal(data.toString(), expected.data[dataEvents - 1].toString())
  })

  output.on(`end`, () => {
    assert.equal(dataEvents, expected.dataEvents)
  })

  assert.end()
})

test(`expected chunks, custom delimiter`, assert => {
  const testdata = createTestStream([
    Buffer.from(`hello there `),
    Buffer.from(`this is\na `),
    Buffer.from(`fancy\n`),
    Buffer.from(`stream`)
  ])

  const expected = {
    dataEvents: 4,
    data: [
      Buffer.from(`hello there this is\n`),
      Buffer.from(` f`),
      Buffer.from(`ncy\nstre`),
      Buffer.from(`m`)
    ]
  }

  let dataEvents = 0

  const output = testdata.pipe(split(Buffer.from(`a`)))

  output.on(`data`, data => {
    dataEvents = dataEvents + 1
    assert.equal(data.toString(), expected.data[dataEvents - 1].toString())
  })

  output.on(`end`, () => {
    assert.equal(dataEvents, expected.dataEvents)
  })

  assert.end()
})

test(`expected chunks, custom delimiter, no flush`, assert => {
  const testdata = createTestStream([
    Buffer.from(`hello there `),
    Buffer.from(`this is\na `),
    Buffer.from(`fancy\n`),
    Buffer.from(`stream`)
  ])

  const expected = {
    dataEvents: 3,
    data: [
      Buffer.from(`hello there this is\n`),
      Buffer.from(` f`),
      Buffer.from(`ncy\nstre`)
    ]
  }

  let dataEvents = 0

  const output = testdata.pipe(split(Buffer.from(`a`), { flushRemainingChunk: false }))

  output.on(`data`, data => {
    dataEvents = dataEvents + 1
    assert.equal(data.toString(), expected.data[dataEvents - 1].toString())
  })

  output.on(`end`, () => {
    assert.equal(dataEvents, expected.dataEvents)
  })

  assert.end()
})

test(`expected chunks, custom delimiter (string)`, assert => {
  const testdata = createTestStream([
    Buffer.from(`hello there `),
    Buffer.from(`this is\na `),
    Buffer.from(`fancy\n`),
    Buffer.from(`stream`)
  ])

  const expected = {
    dataEvents: 4,
    data: [
      Buffer.from(`hello there this is\n`),
      Buffer.from(` f`),
      Buffer.from(`ncy\nstre`),
      Buffer.from(`m`)
    ]
  }

  let dataEvents = 0

  const output = testdata.pipe(split(`a`))

  output.on(`data`, data => {
    dataEvents = dataEvents + 1
    assert.equal(data.toString(), expected.data[dataEvents - 1].toString())
  })

  output.on(`end`, () => {
    assert.equal(dataEvents, expected.dataEvents)
  })

  assert.end()
})

test(`expected chunks, custom delimiter (number)`, assert => {
  const testdata = createTestStream([
    Buffer.from(`245134`),
    Buffer.from(`468734`),
    Buffer.from(`345672`)
  ])

  const expected = {
    dataEvents: 3,
    data: [
      Buffer.from(`24`),
      Buffer.from(`13446873434`),
      Buffer.from(`672`)
    ]
  }

  let dataEvents = 0

  const output = testdata.pipe(split(5))

  output.on(`data`, data => {
    dataEvents = dataEvents + 1
    assert.equal(data.toString(), expected.data[dataEvents - 1].toString())
  })

  output.on(`end`, () => {
    assert.equal(dataEvents, expected.dataEvents)
  })

  assert.end()
})

test(`expected chunks, custom delimiter, no flush (options object)`, assert => {
  const testdata = createTestStream([
    Buffer.from(`hello there `),
    Buffer.from(`this 5is\na `),
    Buffer.from(`fancy\n`),
    Buffer.from(`stream`)
  ])

  const expected = {
    dataEvents: 1,
    data: [
      Buffer.from(`hello there this `)
    ]
  }

  let dataEvents = 0

  const output = testdata.pipe(split({ delimiter: 5, flushRemainingChunk: false }))

  output.on(`data`, data => {
    dataEvents = dataEvents + 1
    assert.equal(data.toString(), expected.data[dataEvents - 1].toString())
  })

  output.on(`end`, () => {
    assert.equal(dataEvents, expected.dataEvents)
  })

  assert.end()
})

test(`expected chunks, default delimiter, no flush`, assert => {
  const testdata = createTestStream([
    Buffer.from(`hello there `),
    Buffer.from(`this is\na `),
    Buffer.from(`fancy\n`),
    Buffer.from(`stream`)
  ])

  const expected = {
    dataEvents: 2,
    data: [
      Buffer.from(`hello there this is`),
      Buffer.from(`a fancy`)
    ]
  }

  let dataEvents = 0

  const output = testdata.pipe(split({ flushRemainingChunk: false }))

  output.on(`data`, data => {
    dataEvents = dataEvents + 1
    assert.equal(data.toString(), expected.data[dataEvents - 1].toString())
  })

  output.on(`end`, () => {
    assert.equal(dataEvents, expected.dataEvents)
  })

  assert.end()
})

test(`throws`, assert => {
  assert.throws(split.bind(null, []), /TypeError: could not parse argument, try Buffer\.from()?/)
  assert.throws(split.bind(null, null), /TypeError: could not parse argument, try Buffer\.from()?/)
  assert.throws(split.bind(null, undefined), /TypeError: could not parse argument, try Buffer\.from()?/)
  assert.throws(split.bind(null, false), /TypeError: could not parse argument, try Buffer\.from()?/)
  assert.end()
})
