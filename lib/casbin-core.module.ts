import {Global, Module, DynamicModule, Provider, OnModuleDestroy, Logger, Inject} from "@nestjs/common";
import {AdapterOption, CasbinAsyncOptionsInterface, CasbinOptions, CasbinOptionsFactoryInterface} from "./interfaces";
import {CASBIN_OPTIONS, CASBIN_ADAPTER, CASBIN_ENFORCER} from "./casbin.constants";
import {Adapter, newEnforcer} from "casbin";
import * as MongooseAdapter from 'casbin-mongoose-adapter';
import {ModuleRef} from "@nestjs/core";

@Global()
@Module({})
export class CasbinCoreModule implements OnModuleDestroy {
    private readonly logger: Logger = new Logger(CasbinCoreModule.name);

    constructor(
        @Inject(CASBIN_OPTIONS)
        private readonly options: CasbinOptions,
        private readonly moduleRef: ModuleRef,
    ) {}

    /**
     * Create the static for Root Options
     *
     * @param options
     */
    public static forRoot(options: CasbinOptions): DynamicModule {

        const CasbinOptionsProvider = {
            provide: CASBIN_OPTIONS,
            useValue: options,
        };

        const enforcerProvider = {
            provide: CASBIN_ENFORCER,
            useFactory: async (options, adapter: Adapter | string) => {
                const e = await newEnforcer(options.model, adapter);
                await e.loadPolicy();
                return e;
            },
            inject: [CASBIN_OPTIONS, CASBIN_ADAPTER],
        };

        const adapterProvider = {
            provide: CASBIN_ADAPTER,
            useFactory: async (options) => {
                if (typeof options.adapter === 'string') {
                    return options.adapter;
                }

                return await MongooseAdapter.newAdapter(options.adapter.url, options.adapter.options)
            },
            inject: [CASBIN_OPTIONS],
        };

        return {
            module: CasbinCoreModule,
            providers: [
                /** Options **/
                CasbinOptionsProvider,

                /** Enforcer **/
                enforcerProvider,
                adapterProvider,
            ],
            exports: [
                /** Enforcer **/
                enforcerProvider,
                adapterProvider
            ]
        };
    }

    public static forRootAsync(options: CasbinAsyncOptionsInterface): DynamicModule {
        const providers: Provider[] = this.createAsyncProviders(options);

        const enforcerProvider = {
            provide: CASBIN_ENFORCER,
            useFactory: async (options, adapter: Adapter | string) => {
                const e = await newEnforcer(options.model, adapter);
                await e.loadPolicy();
                return e;
            },
            inject: [CASBIN_OPTIONS, CASBIN_ADAPTER],
        };

        const adapterProvider = {
            provide: CASBIN_ADAPTER,
            useFactory: async (options) => {
                if (typeof options.adapter === 'string') {
                    return options.adapter;
                }

                return await MongooseAdapter.newAdapter(options.adapter.url, options.adapter.options)
            },
            inject: [CASBIN_OPTIONS],
        };

        return {
            module: CasbinCoreModule,
            providers: [
                /** Providers **/
                ...providers,

                /** Enforcer **/
                enforcerProvider,
                adapterProvider,
            ],
            exports: [
                /** Enforcer **/
                enforcerProvider,
                adapterProvider,
            ]
        };
    }

    private static createAsyncProviders(options: CasbinAsyncOptionsInterface): Provider[] {
        const providers: Provider[] = [
            this.createAsyncOptionsProvider(options),
        ];

        if (options.useClass) {
            providers.push({
                provide: options.useClass,
                useClass: options.useClass,
            });
        }

        return providers;
    }

    private static createAsyncOptionsProvider(options: CasbinAsyncOptionsInterface): Provider {
        if (options.useFactory) {
            return {
                provide: CASBIN_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }

        return {
            provide: CASBIN_OPTIONS,
            useFactory: async (optionsFactory: CasbinOptionsFactoryInterface) => {
                return optionsFactory.createCasbinOptions();
            },
            inject: [options.useExisting || options.useClass],
        };
    }

    async onModuleDestroy() {
        this.logger.log('Destroying CasbinCoreModule...');
        const adapter = this.moduleRef.get<any>(CASBIN_ADAPTER);
        if (!adapter || typeof adapter === "string") {
            return;
        }

        if (adapter instanceof MongooseAdapter) {

            const dropOnDestroy = (this.options.adapter as AdapterOption).dropOnDestroy || false;
            const adp = (adapter as any);
            if (!adp.mongoseInstance || !adp.mongoseInstance.connection) {
                return;
            }

            if (dropOnDestroy) {
                await adp.mongoseInstance.connection.db.dropDatabase();
            }

            this.logger.log('Calling adapter::close()');
            await adp.mongoseInstance.connection.close();
        }
    }
}
