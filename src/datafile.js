const fs = require('fs')
const { fnv1a32_hex } = require('./fnv1a')

function coerce(val) {
  if (typeof val === 'string') return val
  if (typeof val === 'object') return JSON.stringify(val)
  return val.toString()
}

const MARKER = '6A162F161C58E795E66E5A4E358DC3848CBF'

module.exports = class DataFile {
  constructor(filepath) {
    this.filepath = filepath
    this.content = ''
    this.map = {}
    this.obj = new Proxy(this.map, {
      get: function (target, prop, receiver) {
        return target[fnv1a32_hex(prop)]
      },
      set: function (target, prop, value) {
        target[fnv1a32_hex(prop)] = value
      },
    })
    this.read()
  }

  read() {
    this.content = fs.readFileSync(this.filepath, 'utf8')
    this.parseContent(this.content)
  }

  write(ext = '') {
    let buf = MARKER + '\n'
    Object.keys(this.map).forEach((key) => {
      if (key === '' || key.length !== 8) return
      let val = coerce(this.map[key])
      let line = `${key}${Buffer.from(val).toString('hex').toUpperCase()}`
      buf += line + '\n'
    })
    buf = buf.slice(0, -1)
    fs.writeFileSync(this.filepath + ext, buf, 'utf8')
  }

  parseContent(content) {
    content = content.replace(/\r/gi, '')
    let lines = content.split('\n')
    lines.forEach((line) => {
      let keyHex = line.substr(0, 8),
        valueHex = line.substr(8)

      let value = Buffer.from(valueHex, 'hex').toString('utf8')

      try {
        if (value.startsWith('{') && value.endsWith('}'))
          value = JSON.parse(value)
      } catch (_) {}

      this.map[keyHex] = value
    })
  }
}
