import { AUTO_SELECT_FAST_MODEL_ID } from '../constants/AutoSelectFastModelId';
import { AUTO_SELECT_SMART_MODEL_ID } from '../constants/AutoSelectSmartModelId';

export const isAutoSelectModelId = (modelId: string): boolean =>
  modelId === AUTO_SELECT_FAST_MODEL_ID ||
  modelId === AUTO_SELECT_SMART_MODEL_ID;
