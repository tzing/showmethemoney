export interface TWQRPUrlOptions {
  bankCode: string
  accountId: string
  amount?: number
}

export const generateTWQRPUrl = ({ bankCode, accountId, amount }: TWQRPUrlOptions): string => {
  // TWQRP://個人轉帳/158/02/V1
  const baseUrl = `TWQRP://xn--gmqw5ax42ad01c/158/02/V1`
  const params = new URLSearchParams()

  params.append('D5', bankCode)
  // account ID needs to be padded to 16 digits, remove non-digits (like hyphens or spaces)
  const cleanAccountId = accountId.replace(/\D/g, '')
  params.append('D6', cleanAccountId.padStart(16, '0'))

  if (amount) {
    params.append('D10', '901')
    params.append('D1', Math.floor(amount * 100).toString())
  }

  return `${baseUrl}?${params.toString()}`
}
