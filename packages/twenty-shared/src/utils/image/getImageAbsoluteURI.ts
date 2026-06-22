type getImageAbsoluteURIProps = {
  imageUrl: string;
  baseUrl: string;
};

export const getImageAbsoluteURI = ({
  imageUrl,
  baseUrl,
}: getImageAbsoluteURIProps): string => {
  const isAlreadyAbsoluteUri =
    /^[a-z][a-z\d+.-]*:/i.test(imageUrl) || imageUrl.startsWith('//');

  if (isAlreadyAbsoluteUri) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return new URL(`/files${imageUrl}`, baseUrl).toString();
  }

  return new URL(`/files/${imageUrl}`, baseUrl).toString();
};
