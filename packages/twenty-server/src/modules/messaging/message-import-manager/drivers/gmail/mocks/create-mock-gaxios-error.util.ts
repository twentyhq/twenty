import { GaxiosError, type GaxiosResponse } from 'gaxios';

const MOCK_URL = new URL('https://gmail.googleapis.com/mocks');

const createMockGaxiosResponse = <T>(
  status: number,
  statusText: string,
  data: T,
): GaxiosResponse<T> => {
  const headers = new Headers();

  const response: GaxiosResponse<T> = {
    config: { url: MOCK_URL, headers: new Headers() },
    data,
    status,
    statusText,
    headers,
    ok: status >= 200 && status < 300,
    redirected: false,
    type: 'default',
    url: MOCK_URL.toString(),
    body: null,
    // real gaxios builds the error from a consumed fetch Response
    bodyUsed: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    bytes: () => Promise.resolve(new Uint8Array()),
    formData: () => Promise.resolve(new FormData()),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(''),
    clone: () => response,
  };

  return response;
};

export const createMockGaxiosError = <T>({
  message,
  status,
  statusText = '',
  data,
}: {
  message: string;
  status: number;
  statusText?: string;
  data: T;
}): GaxiosError<T> => {
  return new GaxiosError<T>(
    message,
    { url: MOCK_URL, headers: new Headers() },
    createMockGaxiosResponse(status, statusText, data),
  );
};
