import { type FLAT_SERVERLESS_FUNCTION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/serverless-function/constants/flat-serverless-function-properties-to-compare.constant';

export type FlatServerlessFunctionPropertiesToCompare =
  (typeof FLAT_SERVERLESS_FUNCTION_PROPERTIES_TO_COMPARE)[number];
