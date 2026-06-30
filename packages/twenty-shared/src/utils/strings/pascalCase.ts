import camelCase from 'lodash.camelcase';
import { capitalize } from '@/utils';

export const pascalCase = (str: string) => capitalize(camelCase(str));
