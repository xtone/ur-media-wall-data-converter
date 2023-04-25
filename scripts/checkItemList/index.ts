import { getContentData } from './getContentData'
import json from '../../data/json/itemList.json'
import { writeFileSync } from 'fs'

const dataXlsx = [
  ...getContentData('./data/xlsx/history_list.xlsx'),
  ...getContentData('./data/xlsx/TM_list.xlsx'),
  ...getContentData('./data/xlsx/GU_list.xlsx'),
  ...getContentData('./data/xlsx/archive_list.xlsx'),
]

const dataJson = JSON.stringify(dataXlsx, undefined, 2)

writeFileSync('./data/json/dataXlsx.json', dataJson)

function sortBy<T>(array: T[], key1: keyof T, key2: keyof T): T[] {
  return array.sort((a, b) => {
    if (a[key1] < b[key1]) {
      return -1
    } else if (a[key1] > b[key1]) {
      return 1
    } else {
      if (a[key2] < b[key2]) {
        return -1
      } else if (a[key2] > b[key2]) {
        return 1
      } else {
        return 0
      }
    }
  })
}
const jsonSort = sortBy(json, 'group', 'id')

console.log('チェック方向, ID, Top, 備考')

function checkItemListExist(id: string): boolean {
  for (const item of jsonSort) {
    if (item.id === id) {
      return true
    }
  }

  return false
}

dataXlsx.forEach((data) => {
  const existFlag = checkItemListExist(data.id)

  if (!existFlag) {
    console.log(
      `xlsx → itemList, ${data.id}, ${data.isShowOnTop}, ${
        !data.isShowOnTop ? 'Topがfalseになっていることが原因です。' : ''
      }`
    )
  }
})

function checkDataXlsxExist(id: string): boolean {
  for (const data of dataXlsx) {
    if (data.id === id) {
      return true
    }
  }

  return false
}

jsonSort.forEach((item) => {
  const existFlag = checkDataXlsxExist(item.id)

  if (!existFlag) {
    console.log(
      `itemList → xlsx, ${item.id}, ${item.isShowOnTop}, ${
        !item.isShowOnTop ? 'Topがfalseになっていることが原因です。' : ''
      }`
    )
  }
})
