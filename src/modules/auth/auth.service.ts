/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/repository/user.repository';
import { AUTH_ERRORS } from '../../common/constants/constant';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { AuthPayload } from './dto/auth-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('AuthService');
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${user.email}`, 'AuthService');

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }
}
