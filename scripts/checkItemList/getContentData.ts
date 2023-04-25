import { readFile, utils } from 'xlsx'
import { extractText } from '../utils/extractText'

export function getContentData(file) {
  const workbook = readFile(file, {
    cellDates: true,
  })

  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  const rows: string[][] = utils.sheet_to_json(sheet, {
    header: 1,
  })

  // 1行目を削除
  const header = rows.shift()

  if (!header) return

  const data = rows
    .map((x) => {
      // TOP表示フラグ
      const isShowOnTop = !!extractText(x, 1)

      // コンテンツNo.
      const id = extractText(x, 8)

      return {
        isShowOnTop,
        id,
      }
    })
    .filter((v) => v)

  return data
}
