import { capitalize } from 'src/utils/capitalize';

export const camelToTitleCase = (camelCaseText: string) =>
  capitalize(camelCaseText)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
