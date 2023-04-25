import { extractText } from './extractText'
import { extractNumber } from './extractNumber'

export function extractContent(data: string[], index: number, id: string) {
  if (!data[index]) {
    return null
  }

  const type = extractText(data, index)
  const caption = extractText(data, index + 4)
  const dir = extractText(data, index + 2)
  const ext = extractText(data, index + 3)
  const count = extractNumber(data, index + 1)

  let srcList: string[] = []

  if (type === '画像グループ') {
    if (!count) {
      console.log(`画像グループ${dir} should have count.`)
      srcList = []
    } else {
      srcList = [...Array(count)].map(
        (_, i) => `${id}/${dir}_${(i + 1).toString().padStart(4, '0')}.${ext}`
      )
    }
  } else {
    srcList = [`${id}/${dir}.${ext}`]
  }

  return { type, caption, srcList }
}
