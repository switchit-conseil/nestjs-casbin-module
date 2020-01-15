import {Type} from '@nestjs/common';
import {ModuleMetadata} from '@nestjs/common/interfaces';
import {CasbinOptionsFactoryInterface} from "./casbin-options-factory.interface";
import {CasbinOptions} from "./casbin-options.type";

export interface CasbinAsyncOptionsInterface extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<CasbinOptionsFactoryInterface>;
    useClass?: Type<CasbinOptionsFactoryInterface>;
    useFactory?: (...args: any[]) => Promise<CasbinOptions> | CasbinOptions;
    inject?: any[];
}
