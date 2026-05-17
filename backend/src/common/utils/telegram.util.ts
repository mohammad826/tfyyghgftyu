import * as crypto from 'crypto';

export function validateTelegramInitData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Telegram validation per docs:
  // secret_key = sha256(bot_token)
  // hmac = hmac_sha256(secret_key, data_check_string)
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
}

export function parseTelegramInitData(initData: string): any {
  const urlParams = new URLSearchParams(initData);
  const user = urlParams.get('user');
  if (user) {
    return JSON.parse(user);
  }
  return null;
}
