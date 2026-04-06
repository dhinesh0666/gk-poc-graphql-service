# GK POC GraphQL Service

NestJS + GraphQL API service built as a proof of concept, following the architecture patterns established in QuestQR-API.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10
- **API**: GraphQL (Code-first approach via `@nestjs/graphql` + Apollo Server 4)
- **Database**: PostgreSQL + TypeORM
- **Auth**: JWT (Passport.js)
- **Language**: TypeScript 5

## Project Structure

```
src/
├── main.ts                     # Application bootstrap
├── app.module.ts               # Root dynamic module (forRoot pattern)
├── health.controller.ts        # GET /health endpoint
├── schema.gql                  # Auto-generated GraphQL schema (code-first)
├── common/
│   ├── constants/              # App-wide constants and error messages
│   ├── decorators/             # Custom decorators (@CurrentUser)
│   ├── filters/                # Global exception filter (HTTP + GraphQL aware)
│   ├── guards/                 # JWT Auth Guard (GraphQL context-aware)
│   ├── interceptors/           # Logging interceptor (HTTP + GraphQL)
│   ├── interfaces/             # Shared TypeScript interfaces
│   └── logger/                 # Custom logger service (sensitive data masking)
└── modules/
    ├── auth/                   # JWT login mutation + strategy
    │   ├── dto/                # LoginInput, AuthPayload types
    │   ├── strategies/         # Passport JWT strategy
    │   ├── auth.resolver.ts
    │   ├── auth.service.ts
    │   └── auth.module.ts
    └── user/                   # User CRUD with GraphQL resolvers
        ├── dto/                # Input types and response types
        ├── entities/           # TypeORM entity (also GraphQL ObjectType)
        ├── repository/         # Data access layer
        ├── user.resolver.ts
        ├── user.service.ts
        └── user.module.ts
```

## Architecture Patterns

Following the same conventions as QuestQR-API:

| Pattern | Implementation |
|---------|---------------|
| Module structure | `module / service / resolver / repository / entity / dto` |
| Root module | `AppModule.forRoot()` dynamic module factory |
| Database access | Repository pattern (separate `UserRepository` class) |
| Logging | `CustomLoggerService` extending `ConsoleLogger` with sensitive field masking |
| Error handling | `AllExceptionsFilter` catching both HTTP + GraphQL errors |
| Auth | JWT Passport strategy with `JwtAuthGuard` overriding `getRequest` for GQL context |
| Response | GraphQL resolvers return typed ObjectTypes directly |
| Validation | `class-validator` decorators on `@InputType()` DTOs |
| Config | `@nestjs/config` with `ConfigModule.forRoot({ isGlobal: true })` |

## GraphQL API

### Schema Highlights

**Mutations:**
- `login(input: LoginInput): AuthPayload` — Public authentication
- `createUser(input: CreateUserInput): User` — Public registration
- `updateUser(input: UpdateUserInput): User` — Protected (JWT)
- `removeUser(id: ID!): Boolean` — Protected (JWT)

**Queries:**
- `users(input: GetUsersInput): PaginatedUsersResponse` — Protected (JWT)
- `user(id: ID!): User` — Protected (JWT)
- `me: User` — Protected (JWT), returns current user

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the database** (via Docker)
   ```bash
   docker-compose up postgres -d
   ```

4. **Start the app**
   ```bash
   npm run start:dev
   ```

5. **Open GraphQL Playground**
   ```
   http://localhost:3000/graphql
   ```

6. **Health check**
   ```
   GET http://localhost:3000/health
   ```

### Run with Docker Compose (full stack)
```bash
docker-compose up
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Build to `dist/` |
| `npm run start:prod` | Start production build |
| `npm run type-check` | TypeScript validation only |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier formatting |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | HTTP port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | Database username |
| `DB_PASS` | — | Database password |
| `DB_NAME` | `gk_poc_graphql` | Database name |
| `JWT_SECRET` | — | JWT signing secret |
| `JWT_EXPIRES_IN` | `30d` | Token expiry |
| `GRAPHQL_PLAYGROUND` | `true` | Enable playground |
| `GRAPHQL_INTROSPECTION` | `true` | Enable introspection |
| `LOG_LEVEL` | `info` | `error\|warn\|info\|debug` |

## Example GraphQL Operations

### Login
```graphql
mutation {
  login(input: { email: "admin@example.com", password: "password123" }) {
    accessToken
    tokenType
    expiresIn
  }
}
```

### Create User
```graphql
mutation {
  createUser(input: { name: "John Doe", email: "john@example.com", password: "secret123", role: USER }) {
    id
    name
    email
    role
    createdAt
  }
}
```

### Get Users (authenticated)
```graphql
# Header: Authorization: Bearer <token>
query {
  users(input: { page: 1, limit: 10, search: "john" }) {
    data {
      id
      name
      email
      role
    }
    pagination {
      total
      page
      totalPages
      hasNextPage
    }
  }
}
```
