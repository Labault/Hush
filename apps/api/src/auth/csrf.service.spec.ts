import { Test } from '@nestjs/testing';
import { CsrfService } from './csrf.service';

describe('CsrfService', () => {
  let service: CsrfService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CsrfService],
    }).compile();
    service = module.get(CsrfService);
  });

  it('generateToken returns 64-char hex string', () => {
    const token = service.generateToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('verifyToken returns true when tokens match', () => {
    const token = service.generateToken();
    expect(service.verifyToken(token, token)).toBe(true);
  });

  it('verifyToken returns false when tokens differ', () => {
    const a = service.generateToken();
    const b = service.generateToken();
    expect(service.verifyToken(a, b)).toBe(false);
  });

  it('verifyToken returns false when one token is empty', () => {
    const token = service.generateToken();
    expect(service.verifyToken(token, '')).toBe(false);
    expect(service.verifyToken('', token)).toBe(false);
    expect(service.verifyToken('', '')).toBe(false);
  });
});
