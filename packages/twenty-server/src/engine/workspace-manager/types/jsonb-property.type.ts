export declare const JsonbPropertyBrand: unique symbol;
export type JsonbProperty<T> = T & { [JsonbPropertyBrand]?: true };
