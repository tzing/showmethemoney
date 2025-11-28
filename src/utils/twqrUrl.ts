function getLocalTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export interface TWQRPUrlOptions {
  bankCode: string
  accountId: string
  amount?: number
}

export const generateTWQRPUrl = ({ bankCode, accountId, amount }: TWQRPUrlOptions): string => {
  const url = new URL(`TWQRP://個人轉帳/158/02/V1`)

  url.searchParams.append('D5', bankCode)
  // account ID needs to be padded to 16 digits
  url.searchParams.append('D6', accountId.padStart(16, '0'))
  url.searchParams.append('D97', getLocalTimestamp())

  if (amount) {
    url.searchParams.append('D10', '901')
    url.searchParams.append('D1', Math.floor(amount * 100).toString())
  }

  return url.toString()
}
