import { type UpdateLogicFunctionMetadataParams } from 'src/engine/metadata-modules/logic-function/types/update-logic-function-metadata-params.type';

export type UpdateLogicFunctionFromSourceParams = Omit<
  UpdateLogicFunctionMetadataParams,
  'isBuildUpToDate' | 'checksum'
> & {
  sourceHandlerCode?: string;
};
