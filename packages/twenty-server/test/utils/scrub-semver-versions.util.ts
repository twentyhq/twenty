export const scrubSemverVersions = (value: string): string =>
  value.replace(/\d+\.\d+\.\d+/g, '<version>');
