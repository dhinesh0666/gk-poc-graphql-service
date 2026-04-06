/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field()
  tokenType: string;

  @Field()
  expiresIn: string;
}
