import { isChatGptPlanDevProviderEnabled } from 'src/engine/metadata-modules/ai/ai-models/chatgpt-plan-dev/is-chatgpt-plan-dev-provider-enabled.util';

describe('isChatGptPlanDevProviderEnabled', () => {
  it('is enabled only in development with the switch on', () => {
    expect(
      isChatGptPlanDevProviderEnabled({
        NODE_ENV: 'development',
        SETU_DEV_CHATGPT_PLAN: 'true',
      }),
    ).toBe(true);
    expect(
      isChatGptPlanDevProviderEnabled({
        NODE_ENV: 'production',
        SETU_DEV_CHATGPT_PLAN: 'true',
      }),
    ).toBe(false);
    expect(isChatGptPlanDevProviderEnabled({ NODE_ENV: 'development' })).toBe(
      false,
    );
  });
});
