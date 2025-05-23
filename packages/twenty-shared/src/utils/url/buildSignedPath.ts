export const buildSignedPath = ({
  path,
  token,
}: {
  path: string;
  token: string;
}) => {
  return `${path}?token=${token}`;
};
