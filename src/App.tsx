import { useState, useRef, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { ClearableInput } from './components/ClearableInput'
import { DownloadButton } from './components/DownloadButton'
import { ShareButton } from './components/ShareButton'
import CoinRain, { type CoinRainHandle } from './components/CoinRain'
import BankSelector from './components/BankSelector'
import { generateQRCode } from './utils/qrGenerator'
import './App.css'

function App() {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [bankCode, setBankCode] = useState(() => localStorage.getItem('bankCode') || '')
  const [accountId, setAccountId] = useState(() => localStorage.getItem('accountId') || '')
  const [name, setName] = useState(() => localStorage.getItem('name') || '')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const coinRainRef = useRef<CoinRainHandle>(null)
  const cardRef = useRef<HTMLElement>(null)

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem('bankCode', bankCode)
  }, [bankCode])

  useEffect(() => {
    localStorage.setItem('accountId', accountId)
  }, [accountId])

  useEffect(() => {
    localStorage.setItem('name', name)
  }, [name])

  useEffect(() => {
    const updateQRCode = async () => {
      if (bankCode && accountId) {
        const url = await generateQRCode({
          bankCode,
          accountId, // Use original input for display
          name, // Pass name to generator
          amount,
          message
        })
        setQrCodeUrl(url)
      } else {
        setQrCodeUrl('')
      }
    }

    updateQRCode()
  }, [bankCode, accountId, name, amount, message])

  useEffect(() => {
    document.title = `${t('appTitle')} | ${t('appSubtitle')}`
  }, [t])

  const handleTitleClick = (e: React.MouseEvent<HTMLHeadingElement>) => {
    // Spawn coins at click position
    coinRainRef.current?.spawnCoins(e.clientX, e.clientY)
  }

  return (
    <div className="app-container">
      <CoinRain ref={coinRainRef} obstacleRef={cardRef} />
      <header className="app-header">
        <h1>
          <span
            onClick={handleTitleClick}
            style={{
              cursor: 'default',
              userSelect: 'none',
              display: 'inline-block'
            }}
          >
            {t('appTitle')}
          </span>
        </h1>
      </header>

      <main className="main-content">
        <section className="input-section card" ref={cardRef}>
          <h2>{t('inputSectionTitle')}</h2>
          <div className="form-group">
            <label htmlFor="bankCode">{t('bankCodeLabel')}</label>
            <BankSelector
              id="bankCode"
              name="bankCode"
              value={bankCode}
              onChange={setBankCode}
              placeholder={t('bankCodePlaceholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="accountId">{t('accountIdLabel')}</label>
            <ClearableInput
              type="text"
              id="accountId"
              name="accountId"
              placeholder={t('accountIdPlaceholder')}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              onClear={() => setAccountId('')}
            />
          </div>

          <div className={`collapsible-section ${isExpanded ? 'expanded' : ''}`}>
            <div className="collapsible-content">
              <div className="form-group">
                <label htmlFor="name">{t('nameLabel')}</label>
                <ClearableInput
                  type="text"
                  id="name"
                  name="name"
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onClear={() => setName('')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount">{t('amountLabel')}</label>
                <ClearableInput
                  type="number"
                  id="amount"
                  name="amount"
                  min="0"
                  placeholder={t('amountPlaceholder')}
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value
                    // Allow empty string or non-negative numbers only
                    if (val === '' || Number(val) >= 0) {
                      setAmount(val)
                    }
                  }}
                  onClear={() => setAmount('')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">{t('messageLabel')}</label>
                <ClearableInput
                  type="text"
                  id="message"
                  name="message"
                  placeholder={t('messagePlaceholder')}
                  value={message}
                  maxLength={19}
                  onChange={(e) => setMessage(e.target.value)}
                  onClear={() => setMessage('')}
                />
              </div>
            </div>
          </div>

          <button
            className={`expand-toggle ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            aria-label={isExpanded ? t('collapseButton') : t('expandButton')}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </section>

        <section className="qr-section card">
          <div className={`qr-placeholder ${!qrCodeUrl ? 'has-text' : ''}`}>
            {qrCodeUrl ? (
              <div className="qr-wrapper">
                <img src={qrCodeUrl} alt="Generated QR Code" className="qr-code-image" />
              </div>
            ) : (
              <p>{t('qrPlaceholderText')}</p>
            )}
          </div>
          {qrCodeUrl && (
            <div className="action-buttons-container">
              <DownloadButton imageUrl={qrCodeUrl} fileName={`twqr-${bankCode}-${accountId}.png`} />
              <ShareButton imageUrl={qrCodeUrl} fileName={`twqr-${bankCode}-${accountId}.png`} />
            </div>
          )}
        </section>

        <section className="guide-section">
          <h2>{t('usageGuideTitle')}</h2>
          <ol>
            <li>{t('usageGuideStep1')}</li>
            <li>{t('usageGuideStep2')}</li>
          </ol>
          <div className="security-warning">
            <Trans
              i18nKey="securityWarningText"
              components={{
                threeWayScamLink: (
                  <a
                    href="https://www.police.taichung.gov.tw/precinct5/home.jsp?id=3&parentpath=0&mcustomize=multimessages_view.jsp&dataserno=202103240003&t=Publicize&mserno=201801260286"
                    target="_blank"
                  />
                )
              }}
            />
          </div>
        </section>

        <section className="intro-section guide-section">
          <h2>{t('introTitle')}</h2>
          <Trans
            i18nKey="introDescription"
            parent="p"
            components={{
              twqrLink: (
                <a href="https://www.twqr.com.tw/" target="_blank" />
              )
            }}
          />
        </section>

        <section className="privacy-section guide-section">
          <h2>{t('privacyTitle')}</h2>
          <p>{t('privacyDescription')}</p>
        </section>
      </main>

      <footer className="app-footer">
        <Trans
          i18nKey="footer"
          parent="p"
          components={{
            repoLink: (
              <a href="https://github.com/tzing/showmethemoney" target="_blank" />
            )
          }}
        />
      </footer>
    </div>
  )
}

export default App
