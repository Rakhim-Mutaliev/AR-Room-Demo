export const exportScene = async (canvas: HTMLCanvasElement, backgroundUrl?: string) => {
  const output = document.createElement('canvas')
  output.width = canvas.width
  output.height = canvas.height
  const context = output.getContext('2d')!
  if (backgroundUrl) {
    const image = new Image()
    image.src = backgroundUrl
    await image.decode()
    const scale = Math.max(output.width / image.width, output.height / image.height)
    const width = image.width * scale
    const height = image.height * scale
    context.drawImage(image, (output.width - width) / 2, (output.height - height) / 2, width, height)
  } else {
    const gradient = context.createLinearGradient(0, 0, 0, output.height)
    gradient.addColorStop(0, '#4b5048'); gradient.addColorStop(1, '#bbb6aa')
    context.fillStyle = gradient; context.fillRect(0, 0, output.width, output.height)
  }
  context.drawImage(canvas, 0, 0)
  return await new Promise<Blob>((resolve, reject) => output.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Не удалось создать снимок')), 'image/png'))
}
