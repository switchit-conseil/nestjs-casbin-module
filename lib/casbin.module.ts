import {DynamicModule, Module} from "@nestjs/common";
import {CasbinAsyncOptionsInterface, CasbinOptions} from "./interfaces";
import {CasbinCoreModule} from "./casbin-core.module";

@Module({})
export class CasbinModule {
    public static forRoot(options?: CasbinOptions): DynamicModule {
        return {
            module: CasbinModule,
            imports: [
                /** Modules **/
                CasbinCoreModule.forRoot(options),
            ],
        };
    }

    public static forRootAsync(options: CasbinAsyncOptionsInterface): DynamicModule {
        return {
            module: CasbinModule,
            imports: [
                /** Modules **/
                CasbinCoreModule.forRootAsync(options),
            ],
        };
    }
}
