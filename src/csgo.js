const { snapshot } = require('process-list')

let csgoPath =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\ot'

module.exports = async function locateCSGO() {
  // process-list sucks or onetap removes its command line args or whatever
  // idfk
  if (csgoPath) return csgoPath

  // TODO: add ./ot and slice csgo.exe off path detected
  const tasks = await snapshot('pid', 'name', 'path', 'cmdline')
  let csgoExe = tasks.find((i) => i.name === 'csgo.exe')

  if (!csgoExe) throw new Error('"csgo.exe" is not running')

  csgoPath = csgoExe.path
  console.log(csgoExe)

  return csgoPath
}
