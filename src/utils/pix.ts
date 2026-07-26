/**
 * CRC16-CCITT calculation for PIX EMV BR Code
 */
function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    const b = payload.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      const bit = ((b >> (7 - j)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xffff;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates a standard BR Code PIX "Copia e Cola" string.
 */
export function generatePixPayload(
  pixKey: string = '27095675805',
  amount: number = 4.80,
  merchantName: string = 'EVERSON ARANTES',
  merchantCity: string = 'BRASILIA',
  txId: string = 'APPCONTA'
): string {
  // Format key length and string
  const cleanKey = pixKey.trim();
  const keyLength = cleanKey.length.toString().padStart(2, '0');
  
  // Field 26: Merchant Account Information
  const gui = '0014br.gov.bcb.pix';
  const keyField = `01${keyLength}${cleanKey}`;
  const merchantAccountInfoStr = `${gui}${keyField}`;
  const merchantAccountInfoLen = merchantAccountInfoStr.length.toString().padStart(2, '0');
  const field26 = `26${merchantAccountInfoLen}${merchantAccountInfoStr}`;

  // Field 52: Merchant Category Code (0000 = default)
  const field52 = '52040000';

  // Field 53: Currency (986 = BRL)
  const field53 = '5303986';

  // Field 54: Amount
  const formattedAmount = amount.toFixed(2);
  const amountLen = formattedAmount.length.toString().padStart(2, '0');
  const field54 = `54${amountLen}${formattedAmount}`;

  // Field 58: Country Code
  const field58 = '5802BR';

  // Field 59: Merchant Name
  const cleanName = merchantName.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25);
  const nameLen = cleanName.length.toString().padStart(2, '0');
  const field59 = `59${nameLen}${cleanName}`;

  // Field 60: Merchant City
  const cleanCity = merchantCity.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15);
  const cityLen = cleanCity.length.toString().padStart(2, '0');
  const field60 = `60${cityLen}${cleanCity}`;

  // Field 62: Additional Data Field (txid)
  const cleanTxId = txId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***';
  const txIdField = `05${cleanTxId.length.toString().padStart(2, '0')}${cleanTxId}`;
  const field62Len = txIdField.length.toString().padStart(2, '0');
  const field62 = `62${field62Len}${txIdField}`;

  // Field 00: Payload Format Indicator
  const rawPayloadWithoutCRC = `000201${field26}${field52}${field53}${field54}${field58}${field59}${field60}${field62}6304`;

  const crc = calculateCRC16(rawPayloadWithoutCRC);
  return `${rawPayloadWithoutCRC}${crc}`;
}

export const PIX_CONFIG = {
  price: 4.80,
  pixKey: '27095675805',
  keyType: 'CPF/Telefone',
  receiverName: 'Everson Arantes',
  appTitle: 'Licença Gerenciador de Contas PWA',
};
