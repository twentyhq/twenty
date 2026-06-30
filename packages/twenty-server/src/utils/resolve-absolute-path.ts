export const resolveAbsolutePath = (path: string): string => {
  return path.startsWith('/') ? path : process.cwd() + '/' + path;
};
