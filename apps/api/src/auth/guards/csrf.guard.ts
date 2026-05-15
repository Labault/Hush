import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { CsrfService } from '../csrf.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;

    const cookieToken: string = req.cookies?.['hush_csrf'];
    const headerToken = req.headers['x-csrf-token'] as string;

    if (!this.csrfService.verifyToken(cookieToken, headerToken)) {
      throw new ForbiddenException('Invalid CSRF token');
    }
    return true;
  }
}
