import { type AxiosInstance } from 'axios';

const cropRegex = /([w|h])([0-9]+)/;

export type ShortCropSize = `${'w' | 'h'}${number}` | 'original';

export interface CropSize {
  type: 'width' | 'height';
  value: number;
}

export const getCropSize = (value: ShortCropSize): CropSize | null => {
  const match = value.match(cropRegex);

  if (value === 'original' || match === null) {
    return null;
  }

  return {
    type: match[1] === 'w' ? 'width' : 'height',
    value: +match[2],
  };
};

export const getImageBufferFromUrl = async (
  Url: string,
  axiosInstance: AxiosInstance,
): Promise<Buffer> => {
  if (!Url || typeof Url !== 'string' || Url.trim().length === 0) {
    throw new Error('Invalid Url provided: Url must be a non-empty string');
  }

  try {
    const response = await axiosInstance.get(Url, {
      responseType: 'arraybuffer',
      validateStatus: (status) => status >= 200 && status < 300,
      maxRedirects: 5,
      timeout: 10000,
    });

    if (!response.data) {
      throw new Error('Received empty response from image Url');
    }

    const bufferLength = Buffer.isBuffer(response.data)
      ? response.data.length
      : response.data.byteLength;

    if (bufferLength === 0) {
      throw new Error('Received empty response from image Url');
    }

    const contentType = response.headers['content-type'];

    if (contentType && !contentType.startsWith('image/')) {
      throw new Error(
        `Invalid content type: expected image/*, got ${contentType}`,
      );
    }

    return Buffer.from(response.data, 'binary');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    throw new Error(`Failed to fetch image from ${Url}: ${message}`);
  }
};
