import {
  AI_SDK_OPENAI_COMPATIBLE,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { getAvailableEfforts } from 'src/engine/metadata-modules/ai/ai-models/utils/get-available-efforts.util';

describe('getAvailableEfforts', () => {
  it('keeps only the levels the SDK can forward', () => {
    expect(
      getAvailableEfforts({
        sdkPackage: AI_SDK_XAI,
        efforts: ['low', 'medium', 'high', 'xhigh'],
      }),
    ).toEqual(['low', 'medium', 'high']);
  });

  it('offers nothing for a model without declared efforts', () => {
    expect(getAvailableEfforts({ sdkPackage: AI_SDK_XAI })).toEqual([]);
  });

  it('offers nothing for an SDK without an effort option', () => {
    expect(
      getAvailableEfforts({
        sdkPackage: AI_SDK_OPENAI_COMPATIBLE,
        efforts: ['low', 'high'],
      }),
    ).toEqual([]);
  });
});
