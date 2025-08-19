export type FormDataFile = {
  path: string;
  filename: string;
};
export type WorkflowHttpRequestActionInput = {
  url: string;
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
        | Array<FormDataFile>
      >
    | string;
  bodyType?: BodyType;
};
export type BodyType = 'keyValue' | 'rawJson' | 'FormData' | 'Text' | 'None';
