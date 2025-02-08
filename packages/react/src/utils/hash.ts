import pkg from 'crypto-js';
const { MD5 } = pkg;

export function createHash(value: string, salt: string) {
  return MD5(salt + value)
    .toString()
    .slice(0, 6);
}
