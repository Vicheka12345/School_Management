/**
 * Generates an EMVCo-compliant KHQR string for Cambodian payments.
 * Supporting USD and KHR currencies and merchant accounts.
 */
export function generateKHQRString({
  merchantId = 'school_admin@aba',
  merchantName = 'School Management System',
  merchantMobile = '',
  amount = 0,
  currency = 'USD', // 'USD' or 'KHR'
  receiptNo = '',
  purpose = ''
}) {
  const formatTag = (tag, val) => {
    const s = String(val);
    const len = String(s.length).padStart(2, '0');
    return `${tag}${len}${s}`;
  };

  let str = '';
  
  // 00: Payload Format Indicator (01)
  str += formatTag('00', '01');
  
  // 01: Point of Initiation Method (12 = Dynamic QR, 11 = Static QR)
  // If amount is specified, it is a dynamic QR
  str += formatTag('01', amount > 0 ? '12' : '11');

  // 29: Merchant Account Information (Bakong KHQR)
  let mInfo = '';
  mInfo += formatTag('00', 'kh.gov.nbc.bakong');
  mInfo += formatTag('01', merchantId);
  mInfo += formatTag('02', merchantName);
  if (merchantMobile) {
    mInfo += formatTag('03', merchantMobile);
  }
  str += formatTag('29', mInfo);

  // 52: Merchant Category Code (MCC) - 8299 for Schools/Educational Services
  str += formatTag('52', '8299');

  // 53: Transaction Currency (840 = USD, 116 = KHR)
  const currencyCode = currency === 'KHR' ? '116' : '840';
  str += formatTag('53', currencyCode);

  // 54: Transaction Amount
  if (amount > 0) {
    // For USD, usually show 2 decimal places. For KHR, round to integer.
    const formattedAmount = currency === 'KHR' 
      ? Math.round(amount).toString() 
      : Number(amount).toFixed(2);
    str += formatTag('54', formattedAmount);
  }

  // 58: Country Code (KH)
  str += formatTag('58', 'KH');

  // 59: Merchant Name
  str += formatTag('59', merchantName.substring(0, 25));

  // 60: Merchant City
  str += formatTag('60', 'Phnom Penh');

  // 62: Additional Data Field (Bill Number, Purpose)
  let addInfo = '';
  if (receiptNo) addInfo += formatTag('01', receiptNo);
  if (purpose) addInfo += formatTag('08', purpose);
  if (addInfo) {
    str += formatTag('62', addInfo);
  }

  // 63: CRC (Tag: 63, Length: 04)
  str += '6304';
  
  // Calculate CRC16-CCITT (polynomial: 0x1021, initial: 0xFFFF)
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    let code = str.charCodeAt(c);
    crc ^= (code << 8);
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  return str + crcHex;
}
