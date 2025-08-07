import { type Axios } from 'axios';

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
  const response = await axiosInstance.get(url, {
    responseType: 'arraybuffer',
  });

  return Buffer.from(response.data, 'binary');
};
