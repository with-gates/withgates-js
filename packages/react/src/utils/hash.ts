import pkg from 'crypto-js';
const { MD5 } = pkg;

export function createHash(value: string) {
  return MD5(value).toString().slice(0, 6);
}
