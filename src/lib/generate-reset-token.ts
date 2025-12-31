import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import otp from 'otp-generator';

const hashSalt = Number(process.env.HASH_ROUNDS!) as number;

export default async function generateResetToken() {
  const resetToken = randomBytes(32).toString('hex');

  const hashedToken = await bcrypt.hash(resetToken, hashSalt);

  const plainOtp = otp.generate(6, {
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });

  const hashedOtp = await bcrypt.hash(plainOtp, hashSalt);

  return { token: resetToken, hashedToken, otp: plainOtp, hashedOtp };
}
