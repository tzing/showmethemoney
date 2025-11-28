import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { generateTWQRPUrl, type TWQRPUrlOptions } from '../utils/twqrUrl'
import twqrLogo from '../assets/TWQR-logo.png'
import './QrCanvas.css'

export interface QRCodeOptions extends TWQRPUrlOptions {
  name?: string
}

export const useQrImage = (options: QRCodeOptions | null) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    let cancelled = false

    const updateQRCode = async () => {
      if (!options?.bankCode || !options?.accountId) {
        setQrCodeUrl('')
        return
      }

      const url = await generateQRCode(options)
      if (!cancelled) {
        setQrCodeUrl(url)
      }
    }

    updateQRCode()

    return () => {
      cancelled = true
    }
  }, [
    options?.bankCode,
    options?.accountId,
    options?.name,
    options?.amount
  ])

  return qrCodeUrl
}

interface QrCanvasProps {
  options: QRCodeOptions | null
  className?: string
  alt?: string
  onChange?: (dataUrl: string) => void
}

export const QrCanvas = ({
  options,
  className,
  alt = 'Generated QR Code',
  onChange
}: QrCanvasProps) => {
  const { t } = useTranslation()
  const qrCodeUrl = useQrImage(options)
  const placeholderText = t('qrPlaceholderText')

  useEffect(() => {
    onChange?.(qrCodeUrl)
  }, [qrCodeUrl, onChange])

  return (
    <div className={`qr-placeholder ${!qrCodeUrl ? 'has-text' : ''}`}>
      {qrCodeUrl ? (
        <div className="qr-wrapper">
          <img src={qrCodeUrl} alt={alt} className={`qr-code-image ${className || ''}`} />
        </div>
      ) : (
        <p>{placeholderText}</p>
      )}
    </div>
  )
}

const generateQRCode = async (options: QRCodeOptions): Promise<string> => {
  const { bankCode, accountId, name, amount } = options
  try {
    const qrData = generateTWQRPUrl(options)

    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 0,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const qrImage = new Image()
    const logoImage = new Image()
    let logoObjectUrl = ''

    await Promise.all([
      // Load generated QR code image
      new Promise((resolve) => {
        qrImage.onload = resolve
        qrImage.src = qrDataUrl
      }),

      // Fetch logo as blob to ensure it works offline/cached
      new Promise((resolve) => {
        logoImage.crossOrigin = 'anonymous'
        logoImage.onload = resolve
        logoImage.onerror = resolve

        fetch(twqrLogo)
          .then((res) => res.blob())
          .then((blob) => {
            logoObjectUrl = URL.createObjectURL(blob)
            logoImage.src = logoObjectUrl
          })
          .catch(() => {
            logoImage.src = twqrLogo
          })
      })
    ])

    const padding = 40
    const fontSize = 26
    const gap = 40
    const bottomPadding = 40

    const nameHeight = name ? 40 : 0
    const nameGap = name ? 20 : 0

    const amountFontSize = 32
    const amountGap = 20
    const amountHeight = amount ? (amountFontSize + amountGap) : 0

    const topPadding = name ? 40 : 40

    const width = qrImage.width + (padding * 2)
    const height = topPadding + nameHeight + nameGap + qrImage.height + gap + fontSize + amountHeight + bottomPadding

    canvas.width = width
    canvas.height = height

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    let currentY = topPadding

    if (name) {
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 32px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(name, width / 2, currentY)

      currentY += nameHeight + nameGap
    }

    ctx.drawImage(qrImage, padding, currentY)

    if (logoImage.complete && logoImage.naturalWidth > 0) {
      const logoSize = qrImage.width * 0.2
      const logoX = padding + (qrImage.width - logoSize) / 2
      const logoY = currentY + (qrImage.height - logoSize) / 2

      ctx.fillStyle = '#ffffff'
      const bgSize = logoSize * 1.25
      const bgX = padding + (qrImage.width - bgSize) / 2
      const bgY = currentY + (qrImage.height - bgSize) / 2

      ctx.beginPath()
      const radius = 12
      ctx.roundRect(bgX, bgY, bgSize, bgSize, radius)
      ctx.fill()

      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
    }

    currentY += qrImage.height + gap

    ctx.fillStyle = '#333333'
    ctx.font = `${fontSize}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    const formattedAccount = accountId.replace(/(.{4})/g, '$1 ').trim()
    const displayText = `(${bankCode}) ${formattedAccount}`

    ctx.fillText(displayText, width / 2, currentY)

    if (amount) {
      currentY += fontSize + 20

      ctx.fillStyle = '#f97316'
      ctx.font = `bold ${amountFontSize}px monospace`
      ctx.textAlign = 'center'

      const currencySymbol = 'NT$'
      const amountValue = amount.toLocaleString()
      const spacing = 4

      const symbolWidth = ctx.measureText(currencySymbol).width
      const valueWidth = ctx.measureText(amountValue).width
      const totalWidth = symbolWidth + spacing + valueWidth

      const startX = (width - totalWidth) / 2

      ctx.textAlign = 'left'
      ctx.fillText(currencySymbol, startX, currentY)
      ctx.fillText(amountValue, startX + symbolWidth + spacing, currentY)
    }

    const dataUrl = canvas.toDataURL()
    if (logoObjectUrl) {
      URL.revokeObjectURL(logoObjectUrl)
    }

    return dataUrl
  } catch (err) {
    console.error(err)
    return ''
  }
}
