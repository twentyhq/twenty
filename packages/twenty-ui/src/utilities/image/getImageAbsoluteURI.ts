import { REACT_APP_SERVER_BASE_URL } from '@ui/utilities/config';

export const getImageAbsoluteURI = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl?.startsWith('https:')) {
    return imageUrl;
  }

  const serverFilesUrl = REACT_APP_SERVER_BASE_URL;

  return `${serverFilesUrl}/files/${imageUrl}`;
};
