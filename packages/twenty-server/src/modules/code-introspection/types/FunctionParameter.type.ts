export type FunctionParameter = {
  type: string | undefined;
  default?: any;
  enum?: string[] | undefined;
  items?: {
    type?: 'string' | 'number' | 'object';
    enum?: string[];
    resourceType?: string;
    properties?: { [name: string]: FunctionParameter };
  };
  min?: number;
  max?: number;
  currency?: string;
  currencyLocale?: string;
  multiselect?: boolean;
  customErrorMessage?: string;
  properties?: { [name: string]: FunctionParameter };
  required?: string[];
  showExpr?: string;
  password?: boolean;
  order?: string[];
  nullable?: boolean;
  dateFormat?: string;
  title?: string;
  placeholder?: string;
  oneOf?: FunctionParameter[];
  originalType?: string;
};
