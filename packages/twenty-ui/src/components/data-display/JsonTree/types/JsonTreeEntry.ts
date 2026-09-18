import { type JsonValue } from 'type-fest';

export type JsonTreeEntry = {
  id: string | number;
  label: string;
  value: JsonValue;
};
