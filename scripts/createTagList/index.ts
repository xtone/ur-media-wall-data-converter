import { writeFileSync } from 'fs'
import { readFile, utils } from 'xlsx'
import { extractText } from '../utils/extractText'

// TODO: xlsxのパス
const workbook = readFile('./data/xlsx/タグリスト.xlsx', {
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
      const tagLabel = extractText(x, 2)
      if (!tagLabel) return null
      return {
        label: tagLabel,
        kana: extractText(x, 3),
        description: extractText(x, 4),
      }
    })
    .filter((v) => v)

  writeFileSync('./data/json/tagList.json', JSON.stringify(data, undefined, 2))
})
