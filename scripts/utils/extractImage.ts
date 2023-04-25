// eslint-disable-next-line @typescript-eslint/no-var-requires
const sizeOf = require('image-size')

export function extractImage(src: string) {
  try {
    const { width, height } = sizeOf(`./data/thumbnail/${src}`)
    return {
      src,
      width,
      height,
    }
  } catch (e) {
    console.error(e.message, src)
    return null
  }
}
