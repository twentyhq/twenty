export type WorkflowHttpRequestActionInput = {
  Url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?:
    | Record<
        string,
        | string
        | number
        | boolean
        | null
        | undefined
        | Array<string | number | boolean | null>
      >
    | string;
};
