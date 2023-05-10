import fs from 'fs'
import path from 'path'

// 移動先のディレクトリを作成する関数
function createDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}

// ファイルを移動する関数
function moveFile(filePath: string, destDir: string) {
  const fileName = path.basename(filePath)
  const destPath = path.join(destDir, fileName)

  fs.renameSync(filePath, destPath)
}

// 対象ディレクトリのパス
const sourceDir = './data/targetDir'

// 対象ディレクトリ内のファイルを取得
fs.readdirSync(sourceDir).forEach((fileName) => {
  const filePath = path.join(sourceDir, fileName)
  if (fs.statSync(filePath).isFile()) {
    const firstSevenChars = fileName.slice(0, 7)
    const destDir = path.join(sourceDir, firstSevenChars)

    // 移動先のディレクトリを作成
    createDirectory(destDir)

    // ファイルを移動
    moveFile(filePath, destDir)
  }
})
