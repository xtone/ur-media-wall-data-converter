import { existsSync } from 'fs'
import path from 'path'
import data from '../../data/json/itemList.json'

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

const checkFileExist = (src: string, type: 'image' | 'video') => {
  switch (type) {
    case 'image':
      assertFileExist(path.join(dataDir, 'thumbnail', src))
      assertFileExist(path.join(dataDir, 'default', src))
      assertFileExist(path.join(dataDir, 'origin', src))
      return
    case 'video':
      assertFileExist(path.join(dataDir, 'video', src))
      assertFileExist(path.join(dataDir, 'video_origin', src))
  }
}

const assertFileExist = (path: string) => {
  if (!existsSync(path)) console.error(path)
}

data.forEach((v) => {
  //v.thumbnail.src
  checkFileExist(v.thumbnail.src, 'image')
  v.contentList.forEach((x) => {
    x.srcList.forEach((y) => {
      const type = x.type === '動画' ? 'video' : 'image'
      checkFileExist(y, type)
    })
  })
})
