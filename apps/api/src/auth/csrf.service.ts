import { Injectable } from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'crypto';

@Injectable()
export class CsrfService {
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  verifyToken(cookieToken: string, headerToken: string): boolean {
    if (!cookieToken || !headerToken) return false;
    try {
      const a = Buffer.from(cookieToken);
      const b = Buffer.from(headerToken);
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
}
