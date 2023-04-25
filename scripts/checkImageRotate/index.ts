import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import json from '../../data/json/originalImageInformation.json'

const dataDir =
  process.argv
    .find((v) => {
      return v.startsWith('--data-dir=')
    })
    ?.replace('--data-dir=', '') ?? ''

if (!dataDir) {
  throw new Error('data-dir must be specified.')
}

console.log('dataDir', dataDir)

// 対象とするディレクトリ
const dirOriginal = './data/originalData'
const dirOrigin = dataDir + '/origin'
const dirDefault = dataDir + '/default'
const dirThumbnail = dataDir + '/thumbnail'

// ファイル名のみ取得
function getFileList(dir: string, extensions: string[]): string[] {
  const fileList: string[] = []

  ;(function crawl(currentDir: string): void {
    const files = fs.readdirSync(currentDir)

    for (const file of files) {
      const fullPath = path.join(currentDir, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        crawl(fullPath)
      } else if (extensions.includes(path.extname(file).toLowerCase())) {
        fileList.push(path.parse(file).name)
      }
    }
  })(dir)

  return fileList
}

const fileListOriginal = getFileList(dirOriginal, ['.jpg', '.png']).sort(
  (a, b) => {
    if (a < b) {
      return -1
    } else if (a > b) {
      return 1
    }
  }
)
const fileListOrigin = getFileList(dirOrigin, ['.jpg', '.png'])
const fileListDefault = getFileList(dirDefault, ['.jpg', '.png'])
const fileListThumbnail = getFileList(dirThumbnail, ['.jpg', '.png'])

// 複数ディレクトリ間の比較
function arraysAreEqual<T>(...arrays: T[][]): boolean {
  // 配列が空かどうかをチェック
  if (arrays.length === 0) {
    console.log('arraysAreEqual: 配列が空')
    return true
  }

  // すべての配列が同じ長さであることを確認
  const arrayLength = arrays[0].length
  if (!arrays.every((array) => array.length === arrayLength)) {
    console.log('arraysAreEqual: 配列が同じ長さでない')
    return false
  }

  // すべての配列の各要素が一致するかどうかを確認
  for (let i = 0; i < arrayLength; i++) {
    const currentItem = arrays[0][i]
    if (!arrays.every((array) => array[i] === currentItem)) {
      console.log(`arraysAreEqual: 配列の要素が一致していない(${i})`)
      console.log(`arrays[0][i]: (${arrays[0][i]})`)
      console.log(`arrays[1][i]: (${arrays[1][i]})`)
      return false
    }
  }

  return true
}

console.log(`比較開始: original vs origin`)
const fileListVsO = arraysAreEqual(fileListOriginal, fileListOrigin)

if (fileListVsO) {
  console.log('originalData, originのファイル名リストは一致しています。')
} else {
  console.log('originalData, originのファイル名リストが一致していません。')
}

console.log(`比較開始: original vs default`)
const fileListVsD = arraysAreEqual(fileListOriginal, fileListDefault)

if (fileListVsD) {
  console.log('originalData, defaultのファイル名リストは一致しています。')
} else {
  console.log('originalData, defaultのファイル名リストが一致していません。')
}

console.log(`比較開始: original vs thumbnail`)
const fileListVsT = arraysAreEqual(fileListOriginal, fileListThumbnail)

if (fileListVsT) {
  console.log('originalData, thumbnailのファイル名リストは一致しています。')
} else {
  console.log('originalData, thumbnailのファイル名リストが一致していません。')
}

// ディレクトリ名 + ファイル名を取得
function getPathList(dir: string, extensions: string[]): string[] {
  const fileList: string[] = []

  ;(function crawl(currentDir: string): void {
    const files = fs.readdirSync(currentDir)

    for (const file of files) {
      const fullPath = path.join(currentDir, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        crawl(fullPath)
      } else if (extensions.includes(path.extname(file).toLowerCase())) {
        fileList.push(fullPath)
      }
    }
  })(dir)

  return fileList
}

const pathListOrigin = getPathList(dirOrigin, ['.jpg', '.png'])
const pathListDefault = getPathList(dirDefault, ['.jpg', '.png'])
const pathListThumbnail = getPathList(dirThumbnail, ['.jpg', '.png'])

// 画像サイズ取得
async function getImageSize(
  filePath: string
): Promise<{ width: number; height: number; orientation: number }> {
  try {
    const image = sharp(filePath)
    const metadata = await image.metadata()

    return {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      orientation: metadata.orientation ?? 1,
    }
  } catch (error) {
    console.error(`Error reading image size: ${error.message}`)
    throw error
  }
}

const dataListOriginal = json.sort((a, b) => {
  if (a.name < b.name) {
    return -1
  } else if (a.name > b.name) {
    return 1
  }
})

dataListOriginal.forEach(async (dataOriginal, index) => {
  const dataOrigin = await getImageSize(pathListOrigin[index])
  const dataDefault = await getImageSize(pathListDefault[index])
  const dataThumbnail = await getImageSize(pathListThumbnail[index])

  if (!dataOriginal) {
    console.log(`[${dataOriginal.name}] dataOriginalが見つかりません`)
    return
  }

  // 縦横同じ場合に、等号の有無で動作が変わる・・・？
  const flagOrigin = dataOrigin.width >= dataOrigin.height
  const flagDefault = dataDefault.width >= dataDefault.height
  const flagThumbnail = dataThumbnail.width >= dataThumbnail.height
  const flagOriginal = dataOriginal.rotatedOriginal

  if (flagOrigin !== flagOriginal) {
    console.log(
      `縦横比に差分あり [${dataOriginal.name}] Original : ${flagOriginal} Origin : ${flagOrigin}`
    )
  }
  if (flagDefault !== flagOriginal) {
    console.log(
      `縦横比に差分あり [${dataOriginal.name}] Original : ${flagOriginal} Default : ${flagDefault}`
    )
  }
  if (flagThumbnail !== flagOriginal) {
    console.log(
      `縦横比に差分あり [${dataOriginal.name}] Original : ${flagOriginal} Thumbnail : ${flagThumbnail}`
    )
  }

  const rotateOrigin = dataOrigin.orientation
  const rotateDefault = dataDefault.orientation
  const rotateThumbnail = dataThumbnail.orientation

  if (rotateOrigin !== rotateDefault) {
    console.log(
      `回転差分あり [${dataOriginal.name}] Origin : ${rotateOrigin} Default : ${rotateDefault}`
    )
  }
  if (rotateOrigin !== rotateThumbnail) {
    console.log(
      `回転差分あり [${dataOriginal.name}] Origin : ${rotateOrigin} Thumbnail : ${rotateThumbnail}`
    )
  }
})
