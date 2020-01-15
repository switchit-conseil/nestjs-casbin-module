export type AdapterOption = {
    url: string;
    dropOnDestroy?: boolean;
    options: any;
}

export type CasbinOptions = {
    model:string;
    adapter: string | AdapterOption;
};
