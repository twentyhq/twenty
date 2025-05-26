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

  return `${directories.join('/')}/${token}/${filename}`;
};
