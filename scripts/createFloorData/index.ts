import { writeFileSync } from 'fs'
import { readFile, utils } from 'xlsx'
import { extractText } from '../utils/extractText'

// TODO: xlsxのパス
const workbook = readFile('./data/xlsx/FL_list.xlsx', {
  cellDates: true,
})

workbook.SheetNames.forEach((v) => {
  if (v !== 'Sheet1') {
    return
  }
  const rows: string[][] = utils.sheet_to_json(workbook.Sheets[v], {
    header: 1,
  })

  // 1行目を削除
  const header = rows.shift()

  if (!header) return

  const data = rows
    .map((x) => {
      const id = extractText(x, 0)
      if (!id || id === 'No.') return null
      const labelArr = extractText(x, 2).split(/[（）]/)
      return {
        id: id,
        floor: extractText(x, 1).substring(0, extractText(x, 1).length - 1),
        label: labelArr[0],
        subLabel: labelArr[1] ?? null,
        description: extractText(x, 3),
      }
    })
    .filter((v) => v)

  writeFileSync(
    './data/json/floorDataList.json',
    JSON.stringify(data, undefined, 2)
  )
})
