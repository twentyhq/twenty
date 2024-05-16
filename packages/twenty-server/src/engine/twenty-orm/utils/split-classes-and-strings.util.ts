export const splitClassesAndStrings = <T>(
  classesAndStrings: (string | T)[],
): [T[], string[]] => {
  return [
    classesAndStrings.filter((cls): cls is T => typeof cls !== 'string'),
    classesAndStrings.filter((str): str is string => typeof str === 'string'),
  ];
};
