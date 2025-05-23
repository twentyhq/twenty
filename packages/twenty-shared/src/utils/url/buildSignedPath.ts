export const buildSignedPath = ({
  path,
  token,
}: {
  path: string;
  token: string;
}) => {
  const directories = path.split('/');
  const filename = directories.pop();
  return `${directories.join('/')}/${token}/${filename}`;
};
