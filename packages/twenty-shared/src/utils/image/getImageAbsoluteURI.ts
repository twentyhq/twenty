type getImageAbsoluteURIProps = {
  imageUrl: string;
  baseUrl: string;
};

export const getImageAbsoluteURI = ({
  imageUrl,
  baseUrl,
}: getImageAbsoluteURIProps): string => {
  const lowerCaseImageUrl = imageUrl.toLowerCase();
  const isAlreadyAbsoluteUri =
    ['http:', 'https:', 'data:', 'blob:'].some((scheme) =>
      lowerCaseImageUrl.startsWith(scheme),
    ) || imageUrl.startsWith('//');

  if (isAlreadyAbsoluteUri) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return new URL(`/files${imageUrl}`, baseUrl).toString();
  }

  return new URL(`/files/${imageUrl}`, baseUrl).toString();
};
