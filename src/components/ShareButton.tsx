import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface ShareButtonProps {
  imageUrl: string
  fileName?: string
  className?: string
}

export const ShareButton = ({ imageUrl, fileName = 'qrcode.png', className }: ShareButtonProps) => {
  const { t } = useTranslation()
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if navigator.share exists (Web Share API)
    // Note: This API requires a Secure Context (HTTPS) to work,
    // so it won't show up on HTTP (except localhost)
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setIsSupported(true)
    }
  }, [])

  const handleShare = async () => {
    // Track share event
    if (typeof gtag === 'function') {
      gtag('event', 'share', { content_type: 'qrcode' });
    }

    try {
      // Convert Data URL to Blob
      const blob = await (await fetch(imageUrl)).blob()
      const file = new File([blob], fileName, { type: 'image/png' })

      const shareData = {
        files: [file]
      }

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        console.warn('Sharing not supported for this data')
      }
    } catch (error) {
      // Ignore AbortError (user cancelled)
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error)
      }
    }
  }

  if (!imageUrl || !isSupported) return null

  return (
    <button
      onClick={handleShare}
      className={`action-btn share-btn ${className || ''}`}
      aria-label={t('shareQRCode') || 'Share QR Code'}
      title={t('shareQRCode') || 'Share QR Code'}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
    </button>
  )
}
