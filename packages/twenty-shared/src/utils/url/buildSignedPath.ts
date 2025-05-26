import { isNonEmptyString } from '@sniptt/guards';

export const buildSignedPath = ({
  path,
  token,
}: {
  path: string;
  token: string;
}) => {
  if (path.startsWith('https:') || path.startsWith('http:')) {
    return path;
  }

  const directories = path.split('/');

  const filename = directories.pop();

  if (!isNonEmptyString(filename)) {
    throw new Error(
      `Filename empty: cannot build signed path from folderPath '${path}'`,
    );
  }

  return `${directories.join('/')}/${token}/${filename}`;
};
