# Casbin Module

> **IMPORTANT NOTICE**: This module is in development and at the moment only supports RBAC with domains 
strategy
>

This modules integrates the [Casbin](https://casbin.org) into a [NestJS Application](https://nestjs.com).

## Installation

```bash
npm install --save @switchit/nestjs-cabin # or yarn install @switchit/nestjs-cabin
```

## Usage

Import the CasbinModule into the root AppModule.

```typescript
//app.module.ts
import { Module } from '@nestjs/common';
import { CasbinModule } from 'getbiggerio/casbin';

@Module({
    imports: [
        CasbinModule.forRoot({
            model: __dirname + '/model/rbac-model.conf', // Change this
            adapter: {
                url: 'mongodb://localhost:27017/casbin', // Change this
                options: {
                    useNewUrlParser: true,
                    useCreateIndex: true
                }
            }
        }),
    ],
})
export class AppModule {}
```

The module can also works with static policy files in CSV format:

```typescript
//app.module.ts
import { Module } from '@nestjs/common';
import { CasbinModule } from 'getbiggerio/casbin';

@Module({
    imports: [
        CasbinModule.forRoot({
            model: __dirname + '/model/rbac-model.conf', // Change this
            adapter: __dirname + '/model/policy.csv', // Change this
        }),
    ],
})
export class AppModule {}
```

Of course you can use an async configuration:

```typescript
//app.module.ts
import { Module } from '@nestjs/common';
import { CasbinModule } from 'getbiggerio/casbin';

@Module({
    imports: [
        CasbinModule.forRootAsync({
            useFactory: () => ({
                model: __dirname + '/model/rbac-model.conf', // Change this
                adapter: {
                    url: 'mongodb://localhost:27017/casbin', // Change this
                    options: {
                        useNewUrlParser: true,
                        useCreateIndex: true
                    }
                }
            })
        }),
    ],
})
export class AppModule {}
```

## Getting the enforcer and the adapter

If you need you have 2 decorators that can be used to retrieve the Casbin `Enforcer` and the Casbin `Adapter`: 
`@InjectEnforcer()` and `@InjectAdapter()`.

```typescript
@Injectable()
export class MyService {

    constructor(
        @InjectEnforcer()
        private readonly enforcer: Enforcer
    ) {}

    async doSomething() {
        // Uses the enforcer
        await this.enforcer.addGroupingPolicy(command.userId, 'owner', command.organizationId);
    }
}
```
