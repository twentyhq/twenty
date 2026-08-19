// Every uppercase letter becomes "-" + lowercase (PascalCase keys gain a
// leading dash, matching the historical --t--illustration-icon-* names), and
// "." becomes "_" (spacing '0.5' -> --t-spacing-0_5).
export const pathToVarName = (path: string[]): string =>
  '--t-' +
  path
    .map((segment) =>
      segment
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        .replace(/\./g, '_'),
    )
    .join('-');
