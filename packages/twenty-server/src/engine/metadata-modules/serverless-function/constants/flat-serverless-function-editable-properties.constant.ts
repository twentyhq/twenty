import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export const FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES = [
  'name',
  'description',
  'timeoutSeconds',
  'checksum',
  'code',
  'handlerPath',
  'handlerName',
  'toolDescription',
  'toolInputSchema',
  'toolOutputSchema',
] as const satisfies (keyof FlatServerlessFunction)[];
