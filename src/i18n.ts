import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  'zh-TW': {
    translation: {
      appTitle: '給我錢',
      appSubtitle: 'TWQR 轉帳 QR code 產生器',
      inputSectionTitle: '轉帳資訊',
      bankCodeLabel: '銀行代碼',
      bankCodePlaceholder: '例：004 臺灣銀行',
      accountIdLabel: '銀行帳號',
      accountIdPlaceholder: '例：1234 5678 9012',
      nameLabel: '名稱',
      namePlaceholder: '例：王小明',
      amountLabel: '金額',
      amountPlaceholder: '例：1000',
      messageLabel: '附言',
      messagePlaceholder: '例：餐費',
      expandButton: '輸入更多資訊',
      collapseButton: '收起',
      qrPlaceholderText: '在此產生 QR Code',
      usageGuideTitle: '使用說明',
      usageGuideStep1: '輸入轉帳資訊（銀行代碼、帳號）',
      usageGuideStep2: '產生 QR Code 供付款人掃描',
      securityWarningText:
        '產生的 QR code 含有您的帳戶資訊，請勿在公開網路上分享，以避免遭遇<threeWayScamLink>三方詐騙</threeWayScamLink>。',
      downloadQRCode: '下載 QR Code',
      shareQRCode: '分享 QR Code',
      introTitle: '這是什麼？',
      introDescription:
        `<twqrLink>TWQR</twqrLink> 是台灣境內通用的跨機構付款格式，讓不同銀行、不同支付工具之間都能互通。
        這個網站幫你產生符合 TWQR 規格的轉帳 QR code，付款人掃描後，帳號、金額等資訊會自動帶入，省去手動輸入的麻煩。
        就算你跟付款人使用不同銀行，也能順利收款。`,
      privacyTitle: '隱私與安全',
      privacyDescription: '你的帳號等個人資料只會保存在瀏覽器本地，所有 QR code 的產生都在你的裝置上完成，不會傳輸到後端伺服器。',
      footer: '本站託管於 <repoLink>GitHub</repoLink>',
    },
  },
  en: {
    translation: {
      appTitle: 'Show me the money',
      appSubtitle: 'TWQR QR code generator for bank transfers',
      inputSectionTitle: 'Transfer Info',
      bankCodeLabel: 'Bank Code',
      bankCodePlaceholder: 'Ex: 004 Bank of Taiwan',
      accountIdLabel: 'Account ID',
      accountIdPlaceholder: 'Ex: 1234 5678 9012',
      nameLabel: 'Name',
      namePlaceholder: 'Ex: John Doe',
      amountLabel: 'Amount',
      amountPlaceholder: 'Ex: 1000',
      messageLabel: 'Message',
      messagePlaceholder: 'Ex: Lunch money',
      expandButton: 'More Options',
      collapseButton: 'Collapse',
      qrPlaceholderText: 'QR Code will appear here',
      usageGuideTitle: 'Usage Guide',
      usageGuideStep1: 'Enter transfer details (Bank Code, Account ID)',
      usageGuideStep2: 'Generate QR Code for the payer to scan',
      securityWarningText:
        'This QR Code contains your account information. Do not share it publicly online to avoid <threeWayScamLink>three-way scam</threeWayScamLink>.',
      downloadQRCode: 'Download QR Code',
      shareQRCode: 'Share QR Code',
      introTitle: 'What is this?',
      introDescription:
        `<twqrLink>TWQR</twqrLink> is a common inter-institution payment format used in Taiwan, enabling interoperability between different banks.
        This site generates TWQR-compliant QR Codes. When the payer scans it, details like account number and amount are automatically filled in, saving the hassle of manual input.
        Even if you and the payer use different banks, the transfer works seamlessly.`,
      privacyTitle: 'Privacy & Security',
      privacyDescription: 'Your personal data such as account numbers is stored locally in your browser. All QR code generation is performed on your device and never transmitted to backend servers.',
      footer: 'This site is hosted on <repoLink>GitHub</repoLink>',
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-TW',
    load: 'languageOnly',
    detection: {
      order: ['querystring', 'navigator', 'localStorage', 'htmlTag'],
      lookupQuerystring: 'lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'translation',
    ns: ['translation'],
  })

export default i18n
