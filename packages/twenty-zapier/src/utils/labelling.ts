import { capitalize } from '../utils/capitalize';

export const labelling = (str: string): string => {
  return str
    .replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};
