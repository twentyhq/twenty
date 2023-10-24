export const encodeTarget = <T>(target: { id: string; kind?: T }): string => {
  const targetString = JSON.stringify(target);
  const base64String = Buffer.from(targetString).toString('base64');

  return base64String;
};

export const decodeTarget = <T>(
  encodedTarget: string,
): { id: string; kind?: T } => {
  const targetString = Buffer.from(encodedTarget, 'base64').toString('utf-8');
  const target = JSON.parse(targetString);

  return target;
};
