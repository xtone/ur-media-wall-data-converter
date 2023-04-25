import fs, { writeFileSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

const dirOriginal = './data/originalData'

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

const pathListOriginal = getPathList(dirOriginal, ['.jpg', '.png'])

// 画像サイズ取得
async function getImageSize(filePath: string): Promise<{
  path: string
  width: number
  height: number
  orientation: number
}> {
  try {
    const image = sharp(filePath)
    const metadata = await image.metadata()

    return {
      path: filePath,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      orientation: metadata.orientation ?? 1,
    }
  } catch (error) {
    console.error(`Error reading image size: ${error.message}`)
    throw error
  }
}

async function makeJson() {
  const outputJson = await Promise.all(
    pathListOriginal.map(async (file) => {
      const dataOriginal = await getImageSize(file)

      // 縦横同じ場合に、等号の有無で動作が変わる・・・？
      const flagOriginal = dataOriginal.width >= dataOriginal.height

      const pathSplits = dataOriginal.path.split('/')

      const rotateFlag =
        dataOriginal.orientation === 6 || dataOriginal.orientation === 8
      const rotatedWidth = rotateFlag ? dataOriginal.height : dataOriginal.width
      const rotatedHeight = rotateFlag
        ? dataOriginal.width
        : dataOriginal.height
      const rotatedOriginal = rotateFlag ? !flagOriginal : flagOriginal

      return {
        path: dataOriginal.path,
        name: pathSplits[4],
        width: dataOriginal.width,
        height: dataOriginal.height,
        flagOriginal: flagOriginal,
        orientation: dataOriginal.orientation,
        rotateFlag: rotateFlag,
        rotatedWidth: rotatedWidth,
        rotatedHeight: rotatedHeight,
        rotatedOriginal: rotatedOriginal,
      }
    })
  )

  writeFileSync(
    './data/json/originalImageInformation.json',
    JSON.stringify(outputJson, undefined, 2)
  )
}

makeJson()
