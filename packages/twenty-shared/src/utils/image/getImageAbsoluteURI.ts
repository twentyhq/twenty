type getImageAbsoluteURIProps = {
  imageUrl: string;
  baseUrl: string;
};

export const getImageAbsoluteURI = ({
  imageUrl,
  baseUrl,
}: getImageAbsoluteURIProps): string => {
  if (imageUrl.startsWith('https:') || imageUrl.startsWith('http:')) {
    return imageUrl;
  }

  const absoluteImageUrl = new URL(baseUrl);

  if (imageUrl.startsWith('/')) {
    absoluteImageUrl.pathname = `/files${imageUrl}`;
    return absoluteImageUrl.toString();
  }

  absoluteImageUrl.pathname = `files/${imageUrl}`;

  return absoluteImageUrl.toString();
};
