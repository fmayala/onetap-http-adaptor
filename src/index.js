const locateCSGO = require('./csgo'),
  chokidar = require('chokidar'),
  fs = require('fs')

const DataFile = require('./datafile')
const fetch = require('node-fetch').default

async function parseRequest(df) {
  let dfReq = df.obj
  let res = await fetch(dfReq.url, {
    method: dfReq.method || 'GET',
    headers: dfReq.headers || {},
    body: dfReq.body,
  })
  let text = await res.text()
  df.obj.received = true
  df.obj.responseReady = true
  df.obj.responseStatus = res.status
  df.obj.responseBody = text
  df.write('res')
}

async function fileUpdate(file) {
  if (!file.includes('httpadp')) return
  if (file.endsWith('res')) {
    setTimeout(() => {
      try {
        fs.rmSync(file)
      } catch (_) {}
    }, 4000)
    return
  }
  console.log('Path updated', file)
  let df = new DataFile(file)
  parseRequest(df)
  fs.rmSync(file)
}

async function main() {
  const csgoPath = await locateCSGO()

  const watcher = chokidar.watch(csgoPath, {
    persistent: true,
  })

  watcher.on('add', fileUpdate).on('change', fileUpdate)
}

main()
