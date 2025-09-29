import { FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/serverless-function/constants/flat-serverless-function-editable-properties.constant';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export const FLAT_SERVERLESS_FUNCTION_PROPERTIES_TO_COMPARE = [
  ...FLAT_SERVERLESS_FUNCTION_EDITABLE_PROPERTIES,
  'deletedAt',
] as const satisfies (keyof FlatServerlessFunction)[];
