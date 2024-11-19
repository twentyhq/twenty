import { REACT_APP_SERVER_BASE_URL } from '@ui/utilities/config';

// TODO: this is a code smell trying to guess whether it's a relative path or not
// We should instead put the meaning onto our variables and parameters
// imageUrl should be either imageAbsoluteURL or imageRelativeServerPath
// But we need to refactor the chain of calls to this function
export const getImageAbsoluteURI = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl?.startsWith('http')) {
    return imageUrl;
  }

  const serverFilesUrl = REACT_APP_SERVER_BASE_URL;

  return `${serverFilesUrl}/files/${imageUrl}`;
};
