import { type JsonValue } from 'type-fest';
import { type JsonTreeContextType } from '../internal/types/JsonTreeContextType';
import { type JsonTreeEntry } from './JsonTreeEntry';

export type JsonTreeProps = Omit<
  JsonTreeContextType,
  'shouldExpandNodeInitially'
> & {
  shouldExpandNodeInitially?: JsonTreeContextType['shouldExpandNodeInitially'];
} & (
    | { value: JsonValue; entries?: never }
    | { value?: never; entries: JsonTreeEntry[] }
  );
