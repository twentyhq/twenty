export type TestHttpRequestResult = {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: string;
  error?: string;
};
