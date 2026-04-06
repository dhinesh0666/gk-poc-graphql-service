/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPrevPage: boolean;
}

@ObjectType()
export class PaginatedUsersResponse {
  @Field(() => [User])
  data: User[];

  @Field(() => PaginationMeta)
  pagination: PaginationMeta;
}
