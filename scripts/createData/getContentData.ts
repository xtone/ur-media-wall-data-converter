import { readFile, utils } from 'xlsx'
import { extractText } from '../utils/extractText'
import { extractContent } from '../utils/extractContent'
import { extractTagList } from '../utils/extractTagList'
import { extractImage } from '../utils/extractImage'

export function getContentData(file) {
  // TODO: xlsxのパス
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
      if (!isShowOnTop) return null

      // メニュー
      const group = extractText(x, 3)

      // カテゴリー
      const category = {
        label: extractText(x, 5),
        kana: extractText(x, 6),
        description: '', // TODO: カテゴリ一覧からdescriptionを取得する
      }

      // コンテンツNo.
      const id = extractText(x, 8)

      // 年代
      const year = extractText(x, 9)

      // キャッチコピー
      const catchphraseLabel = extractText(x, 10)
      const catchphrase = catchphraseLabel
        ? {
            label: catchphraseLabel,
            kana: extractText(x, 11),
          }
        : null

      // タイトル
      const titleLabel = extractText(x, 12)
      const title = titleLabel
        ? {
            label: titleLabel,
            kana: extractText(x, 13),
          }
        : null

      // 住所
      const address = extractText(x, 14)

      // 解説
      const description = extractText(x, 15)

      // コンテンツ一覧
      const contentList = [...Array(6)]
        .map((_, i) => {
          return extractContent(x, 17 + 5 * i, id)
        })
        .filter((y) => !!y)

      // サムネイル用画像
      const thumbnailFileName = extractText(x, 16)
      const thumbnailSrc = thumbnailFileName
        ? `${id}/${thumbnailFileName}`
        : contentList[0]?.srcList[0]

      if (!thumbnailSrc) {
        // console.log(`SKIP: ${id} has no thumbnail.`)
        return null
      }
      const thumbnail = extractImage(thumbnailSrc)

      if (!thumbnail) {
        // console.log(`SKIP: ${id} has no thumbnail.`)
        return null
      }
      // QRコード用のURL
      const qrCodeText = extractText(x, 47)

      // 参考URL
      const referenceUrl = extractText(x, 48)

      // タグ一覧
      const tagList = extractTagList(x, header, 52)

      return {
        isShowOnTop,
        group,
        category,
        id,
        year,
        catchphrase,
        title,
        address,
        description,
        thumbnail,
        contentList,
        qrCodeText,
        referenceUrl,
        tagList,
      }
    })
    .filter((v) => v)

  return data
}
