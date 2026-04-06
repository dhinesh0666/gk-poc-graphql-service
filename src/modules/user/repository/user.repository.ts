/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { APP_CONSTANTS, USER_ERRORS } from '../../../common/constants/constant';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepo.createQueryBuilder('user').addSelect('user.password').where('user.email = :email', { email }).getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const existing = await this.findByEmail(userData.email);
    if (existing) {
      throw new ConflictException(USER_ERRORS.EMAIL_ALREADY_EXISTS);
    }

    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    }
    Object.assign(user, userData);
    return this.userRepo.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    }
    await this.userRepo.remove(user);
  }

  async findAll(options: GetUsersOptions): Promise<PaginatedResponse<User>> {
    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 10;
    const page = options.page || DEFAULT_PAGE;
    const limit = options.limit || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const qb = this.userRepo.createQueryBuilder('user').where('user.status = :status', { status: APP_CONSTANTS.ACTIVE_STATUS });

    if (options.search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', { search: `%${options.search}%` });
    }

    const [data, total] = await qb.skip(skip).take(limit).orderBy('user.createdAt', 'DESC').getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
