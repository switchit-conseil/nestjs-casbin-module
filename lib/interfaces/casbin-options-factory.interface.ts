import {CasbinOptions} from './casbin-options.type';

export interface CasbinOptionsFactoryInterface {
    createCasbinOptions(): Promise<CasbinOptions> | CasbinOptions;
}
