import { selectAiChatUserCreditsUsage } from 'src/engine/metadata-modules/ai/ai-chat/utils/select-ai-chat-user-credits-usage.util';

const weekEnd = new Date('2026-10-26T00:00:00Z');
const dayEnd = new Date('2026-10-24T00:00:00Z');

describe('selectAiChatUserCreditsUsage', () => {
  it('returns null when the member has no user credits', () => {
    expect(selectAiChatUserCreditsUsage([])).toBeNull();
  });

  it('reports the only window', () => {
    expect(
      selectAiChatUserCreditsUsage([
        { limitValue: 830000, consumedValue: 200000, periodEnd: weekEnd },
      ]),
    ).toEqual({
      limitValue: 830000,
      consumedValue: 200000,
      periodEnd: weekEnd,
    });
  });

  it('reports the window with the fewest credits left', () => {
    expect(
      selectAiChatUserCreditsUsage([
        { limitValue: 830000, consumedValue: 200000, periodEnd: weekEnd },
        { limitValue: 200000, consumedValue: 150000, periodEnd: dayEnd },
      ]),
    ).toEqual({
      limitValue: 200000,
      consumedValue: 150000,
      periodEnd: dayEnd,
    });
  });

  it('reports a window whose consumption could not be read first', () => {
    expect(
      selectAiChatUserCreditsUsage([
        { limitValue: 200000, consumedValue: 150000, periodEnd: dayEnd },
        { limitValue: 830000, consumedValue: null, periodEnd: weekEnd },
      ]),
    ).toEqual({ limitValue: 830000, consumedValue: null, periodEnd: weekEnd });
  });
});
