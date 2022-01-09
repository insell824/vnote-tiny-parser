const fs = require('fs')

const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const quotedPrintable = require('quoted-printable');
const utf8 = require('utf8');

const file = fs.readFileSync(__dirname + '/input/vNote.vnt')
const lines = file.toString().split('\r\n')
const vnoteGroupLine = []
for (line of lines) {
  if (line === 'BEGIN:VNOTE') vnoteGroupLine.push([])
  vnoteGroupLine[vnoteGroupLine.length - 1].push(line)
}


const vnoteList = []
for (vnoteLine of vnoteGroupLine) {
  const startIndex = vnoteLine.findIndex(line => line.startsWith('BODY;'))
  const endIndex = vnoteLine.findIndex(line => line.startsWith('LAST-MODIFIED:'))
  const body = vnoteLine.slice(startIndex, endIndex).map(l => l.replace('BODY;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:', '')).join('\r\n')
  const decodedBody = utf8.decode(quotedPrintable.decode(body))
  vnoteList.push({
    version: Number(vnoteLine[1].split(':')[1]),
    lastModified: dayjs(vnoteLine.find(line => line.startsWith('LAST-MODIFIED')).split(':')[1], 'YYYYMMDDTHHmmssZ').unix(),
    body: decodedBody,
  })
}

fs.writeFileSync(__dirname + '/output/output.json', JSON.stringify(vnoteList, null, 2))

const text = vnoteList.map((note, index) => `----
[${index + 1}]
${note.body}
(最終更新: ${dayjs.unix(note.lastModified).format('YYYY/MM/DD HH:mm.ss')})`).join('\n')
fs.writeFileSync(__dirname + '/output/output.txt', text + '\n----\n')

// console.log(vnoteList)