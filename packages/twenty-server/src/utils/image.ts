import { type Axios, type AxiosError } from 'axios';

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
  url: string,
  axiosInstance: Axios,
): Promise<Buffer> => {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    throw new Error('Invalid URL provided: URL must be a non-empty string');
  }

  try {
    const response = await axiosInstance.get(url, {
      responseType: 'arraybuffer',
      validateStatus: (status) => status >= 200 && status < 300,
      maxRedirects: 5,
      timeout: 30000,
    });

    if (!response.data || response.data.byteLength === 0) {
      throw new Error('Received empty response from image URL');
    }

    const contentType = response.headers['content-type'];
    if (contentType && !contentType.startsWith('image/')) {
      throw new Error(
        `Invalid content type: expected image/*, got ${contentType}`,
      );
    }

    return Buffer.from(response.data, 'binary');
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      throw new Error(
        `Failed to fetch image: HTTP ${axiosError.response.status} from ${url}`,
      );
    }
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || axiosError.code === 'ECONNABORTED') {
        throw new Error(`Request timeout while fetching image from URL: ${url}`);
      }
      if (
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNREFUSED') ||
        axiosError.code === 'ENOTFOUND' ||
        axiosError.code === 'ECONNREFUSED'
      ) {
        throw new Error(`Failed to connect to image URL: ${url}`);
      }
      throw new Error(`Failed to fetch image from URL: ${error.message}`);
    }
    throw new Error(`Failed to fetch image from URL: ${url}`);
  }
};
