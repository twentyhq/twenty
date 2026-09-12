export const pathToVarName = (path: string[]): string =>
  '--t-' +
  path
    .map((segment) =>
      segment
        .replace(/[A-Z]/g, (letter, offset) =>
          offset === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`,
        )
        .replace(/\./g, '_'),
    )
    .join('-');
