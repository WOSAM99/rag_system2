// Utility to generate a JWT with { user_id } payload using HS256 and secret '123456'
// Uses jsrsasign for HMAC SHA256 signing

import { KJUR } from 'jsrsasign';

export function generateUserJWT(user_id) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    user_id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24h expiry
  };
  const secret = '123456';
  const sHeader = JSON.stringify(header);
  const sPayload = JSON.stringify(payload);
  return KJUR.jws.JWS.sign('HS256', sHeader, sPayload, secret)  ;
} 