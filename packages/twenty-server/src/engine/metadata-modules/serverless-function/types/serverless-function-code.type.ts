import { type Sources } from 'src/engine/core-modules/file-storage/types/source.type';

export type ServerlessFunctionCode = {
  src: {
    'index.ts': string;
  } & Sources;
  '.env'?: string;
};
