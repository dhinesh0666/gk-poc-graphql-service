/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The role of the user in the system',
});

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id: string;

  @Field()
  @Column({ length: 255 })
  name: string;

  @Field()
  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255, select: false })
  password: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Field({ nullable: true })
  @Column({ length: 50, nullable: true })
  phone: string;

  @Field()
  @Column({ length: 50, default: 'ACTIVE' })
  status: string;

  @Field()
  @Column({ name: 'must_change_password', type: 'boolean', default: true })
  mustChangePassword: boolean;

  @Field({ nullable: true })
  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
