/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../modules/user/entities/user.entity';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): User => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext<{ req: { user: User } }>().req.user;
});
