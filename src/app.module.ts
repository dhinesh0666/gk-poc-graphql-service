/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';
import { HealthController } from './health.controller';

export class AppModule {
  static forRoot(): DynamicModule {
    return {
      module: AppModule,
      controllers: [HealthController],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),

        GraphQLModule.forRootAsync<ApolloDriverConfig>({
          driver: ApolloDriver,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
            playground: configService.get<string>('GRAPHQL_PLAYGROUND') === 'true',
            introspection: configService.get<string>('GRAPHQL_INTROSPECTION') === 'true',
            context: ({ req }: { req: Express.Request }) => ({ req }),
            formatError: (error) => ({
              message: error.message,
              code: error.extensions?.code,
              path: error.path,
            }),
          }),
        }),

        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const PG_DEFAULT_PORT = 5432;
            return {
              type: 'postgres',
              host: configService.get<string>('DB_HOST', 'localhost'),
              port: configService.get<number>('DB_PORT', PG_DEFAULT_PORT),
              username: configService.get<string>('DB_USER', 'postgres'),
              password: configService.get<string>('DB_PASS', ''),
              database: configService.get<string>('DB_NAME', 'gk_poc_graphql'),
              entities: [User],
              synchronize: configService.get<string>('NODE_ENV') === 'development',
              logging: configService.get<string>('NODE_ENV') === 'development' ? ['query', 'error'] : ['error'],
              logger: 'advanced-console',
            };
          },
        }),

        LoggerModule,
        AuthModule,
        UserModule,
      ],
    };
  }
}
