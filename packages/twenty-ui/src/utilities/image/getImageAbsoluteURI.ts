import { REACT_APP_SERVER_BASE_URL } from '@ui/utilities/config';

export const getImageAbsoluteURI = (imageUrl: string) => {
  if (imageUrl.startsWith('https:') || imageUrl.startsWith('http:')) {
    return imageUrl;
  }

  const serverFilesUrl = REACT_APP_SERVER_BASE_URL;

  return `${serverFilesUrl}/files/${imageUrl}`;
};
