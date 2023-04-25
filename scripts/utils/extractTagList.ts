import { extractText } from './extractText'
import json from '../../data/json/tagList.json'

export function extractTagList(
  data: string[],
  header: string[],
  index: number
) {
  const tagHeader = header.slice(index)
  return data
    .slice(index)
    .map((v, i) => {
      if (!v) {
        return null
      }
      const label = extractText(tagHeader, i)
      return { label, ...margingTagList(label) }
    })
    .filter((v) => !!v)
}

function margingTagList(label: string) {
  const tag = json.find((v: any) => v.label === label)
  if (!tag) return { kana: '', description: '' }
  return { kana: tag.kana, description: tag.description }
}
