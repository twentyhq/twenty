export const pathToVarName = (path: string[]): string =>
  '--t-' +
  path
    .map((segment) =>
      segment
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        .replace(/\./g, '_'),
    )
    .join('-');
