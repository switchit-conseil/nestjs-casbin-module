# Casbin Module

> **IMPORTANT NOTICE**: This module is in development and at the moment only supports RBAC with domains 
strategy

## Implemented Casbin Policy

It integrates Casbin into your application using the [MongooseAdapter](https://github.com/elasticio/casbin-mongoose-adapter)
And works for the RBAC with domain model.

```
[request_definition]
r = sub, dom, path, act

[policy_definition]
p = sub, dom, path, act

[role_definition]
g = _, _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub, r.dom) && r.dom == p.dom && regexMatch(r.path, p.path) && (r.act == p.act || p.act == '*')
```

The main ID is to allow users (with a given `id`) to access some resources that belongs to an organization.
The following policy gives a sample of what should work with the module:

```
p, admin, client-1, client-1/*, write
p, tpapp-1, client-1, client-1/tpapp-1, write
p, tpapp-2, client-2, client-2/tpapp-2, write
p, admin, client-2, client-2/*, write
p, owner, client-2, client-2/*, *
p, owner, client-1, client-1/*, *

g, alice, admin, client-1
g, bob, admin, client-2
g, kyle, owner, client-1
g, bart, owner, client-2

```

The first part lets you define a policy base on (role|user, domain, path, permission). The pass represents objects
data or names used in your app and on which the user should have access to using it's role.

The first line `p, admin, client-1, client-1/*, write` means: Any user with rôle `admin` in the organization 
`client-1` will have a `write` access on all `client-1` resources.

The line `p, owner, client-1, client-1/*, *` means: Any user with role `owner` in the organization 
`client-1` will be granted all permissions on all `client-1` resources.


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

