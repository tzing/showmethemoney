import { useTranslation } from 'react-i18next'

interface DownloadButtonProps {
  imageUrl: string
  fileName?: string
  className?: string
}

export const DownloadButton = ({ imageUrl, fileName = 'qrcode.png', className }: DownloadButtonProps) => {
  const { t } = useTranslation()

  const handleDownload = () => {
    // Track download event
    if (typeof gtag === 'function') {
      gtag('event', 'download_qrcode');
    }

    const link = document.createElement('a')
    link.href = imageUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!imageUrl) return null

  return (
    <button
      onClick={handleDownload}
      className={`action-btn ${className || ''}`}
      aria-label={t('downloadQRCode') || 'Download QR Code'}
      title={t('downloadQRCode') || 'Download QR Code'}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  )
}
