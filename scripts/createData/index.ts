import { writeFileSync } from 'fs'
import { getContentData } from './getContentData'

const data = [
  ...getContentData('./data/xlsx/history_list.xlsx'),
  ...getContentData('./data/xlsx/TM_list.xlsx'),
  ...getContentData('./data/xlsx/GU_list.xlsx'),
  ...getContentData('./data/xlsx/archive_list.xlsx'),
]

writeFileSync(
  './data/json/itemList.json',
  JSON.stringify(
    data.sort(() => Math.random() - 0.5),
    undefined,
    2
  )
)
