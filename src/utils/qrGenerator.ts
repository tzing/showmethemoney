import QRCode from 'qrcode'

// Helper to convert half-width chars to full-width
const toFullWidth = (str: string) => {
  return str.replace(/[\u0021-\u007E]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) + 0xFEE0)
  }).replace(/ /g, '\u3000')
}

interface QRCodeOptions {
  bankCode: string
  accountId: string
  name?: string
  amount?: string
  message?: string
}

export const generateQRCode = async ({ bankCode, accountId, name, amount, message }: QRCodeOptions): Promise<string> => {
  try {
    // TWQR Format: TWQRP://<no>NTTransfer/158/02/V1?D6=<account>&D5=<no>&D10=901
    // Account ID needs to be padded to 16 digits
    const paddedAccountId = accountId.padStart(16, '0')

    const params = new URLSearchParams({
      D5: bankCode,
      D6: paddedAccountId,
      D10: '901'
    })

    if (amount) {
      params.append('D1', `${amount}00`)
    }

    if (message && message.trim()) {
      const fullWidthMessage = toFullWidth(message.trim())
      params.append('D9', fullWidthMessage)
    }

    const baseUrl = `TWQRP://${bankCode}NTTransfer/158/02/V1`
    const qrData = `${baseUrl}?${params.toString()}`

    // 1. Generate QR Code Data URL
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 0,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    // 2. Create a canvas to composite
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Load QR image and Logo
    const qrImage = new Image()
    const logoImage = new Image()

    // Allow cross-origin loading if needed (though local file usually fine)
    logoImage.crossOrigin = 'anonymous'

    const loadImages = Promise.all([
      new Promise((resolve) => {
        qrImage.onload = resolve
        qrImage.src = qrDataUrl
      }),
      new Promise((resolve) => {
        logoImage.onload = resolve
        logoImage.onerror = resolve // Continue even if logo fails
        logoImage.src = '/TWQR-LOGO.png'
      })
    ])

    await loadImages

    // Canvas dimensions
    const padding = 40
    const fontSize = 26
    const gap = 40
    const bottomPadding = 40

    // Extra height for name if present
    const nameHeight = name ? 40 : 0
    const nameGap = name ? 20 : 0

    // Extra height for amount if present
    const amountFontSize = 32
    const amountGap = 20
    const amountHeight = amount ? (amountFontSize + amountGap) : 0

    // Increase top padding for name area if name is present
    const topPadding = name ? 40 : 40

    const width = qrImage.width + (padding * 2)
    const height = topPadding + nameHeight + nameGap + qrImage.height + gap + fontSize + amountHeight + bottomPadding

    canvas.width = width
    canvas.height = height

    // Draw white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    let currentY = topPadding

    // Draw Name (if present)
    if (name) {
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 32px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(name, width / 2, currentY)

      currentY += nameHeight + nameGap
    }

    // Draw QR Code
    ctx.drawImage(qrImage, padding, currentY)

    // Draw Logo (if loaded)
    if (logoImage.complete && logoImage.naturalWidth > 0) {
      const logoSize = qrImage.width * 0.2 // 20% of QR width
      const logoX = padding + (qrImage.width - logoSize) / 2
      const logoY = currentY + (qrImage.height - logoSize) / 2

      // Draw white background for logo
      ctx.fillStyle = '#ffffff'
      // Make background slightly larger than logo (1.25x instead of 1.1x)
      const bgSize = logoSize * 1.25
      const bgX = padding + (qrImage.width - bgSize) / 2
      const bgY = currentY + (qrImage.height - bgSize) / 2

      ctx.beginPath()
      // Rounded rectangle for logo background
      const radius = 12
      ctx.roundRect(bgX, bgY, bgSize, bgSize, radius)
      ctx.fill()

      // Draw logo
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
    }

    currentY += qrImage.height + gap

    // Draw Text (Bank info)
    ctx.fillStyle = '#333333'
    ctx.font = `${fontSize}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    // Format account ID with spaces every 4 digits
    const formattedAccount = accountId.replace(/(.{4})/g, '$1 ').trim()
    const displayText = `(${bankCode}) ${formattedAccount}`

    ctx.fillText(displayText, width / 2, currentY)

    // Draw Amount if present
    if (amount) {
      currentY += fontSize + 20 // Space after bank/account info

      ctx.fillStyle = '#f97316'
      ctx.font = `bold ${amountFontSize}px monospace`
      ctx.textAlign = 'center' // Center alignment base

      const currencySymbol = 'NT$'
      const amountValue = Number(amount).toLocaleString()
      const spacing = 4 // Gap between NT$ and number

      // Measure texts
      const symbolWidth = ctx.measureText(currencySymbol).width
      const valueWidth = ctx.measureText(amountValue).width
      const totalWidth = symbolWidth + spacing + valueWidth

      // Calculate starting X position to center the whole block
      const startX = (width - totalWidth) / 2

      // Draw NT$
      ctx.textAlign = 'left'
      ctx.fillText(currencySymbol, startX, currentY)

      // Draw Amount
      ctx.fillText(amountValue, startX + symbolWidth + spacing, currentY)
    }

    return canvas.toDataURL()
  } catch (err) {
    console.error(err)
    return ''
  }
}
