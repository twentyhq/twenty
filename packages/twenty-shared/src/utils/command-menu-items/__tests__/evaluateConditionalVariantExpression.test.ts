import { CommandMenuItemVariant } from '@/types';
import { evaluateConditionalVariantExpression } from '../evaluateConditionalVariantExpression';

const VIDEO_LINK_VARIANT_EXPRESSION =
  'none(selectedRecords, "videoLink.primaryLinkUrl") ? "PRIMARY" : "SECONDARY"';

describe('evaluateConditionalVariantExpression', () => {
  it('should return the fallback variant when there is no expression', () => {
    expect(
      evaluateConditionalVariantExpression({
        expression: null,
        context: {},
        fallbackVariant: CommandMenuItemVariant.SECONDARY,
      }),
    ).toBe(CommandMenuItemVariant.SECONDARY);
  });

  it('should return PRIMARY when the field is empty', () => {
    expect(
      evaluateConditionalVariantExpression({
        expression: VIDEO_LINK_VARIANT_EXPRESSION,
        context: {
          selectedRecords: [{ id: 'id-1', videoLink: { primaryLinkUrl: '' } }],
        },
        fallbackVariant: CommandMenuItemVariant.SECONDARY,
      }),
    ).toBe(CommandMenuItemVariant.PRIMARY);
  });

  it('should return SECONDARY when the field is set', () => {
    expect(
      evaluateConditionalVariantExpression({
        expression: VIDEO_LINK_VARIANT_EXPRESSION,
        context: {
          selectedRecords: [
            {
              id: 'id-1',
              videoLink: { primaryLinkUrl: 'https://meet.example.com/room' },
            },
          ],
        },
        fallbackVariant: CommandMenuItemVariant.PRIMARY,
      }),
    ).toBe(CommandMenuItemVariant.SECONDARY);
  });

  it('should return DISABLED when the expression says so', () => {
    expect(
      evaluateConditionalVariantExpression({
        expression: 'isOwner ? "PRIMARY" : "DISABLED"',
        context: { isOwner: false },
        fallbackVariant: CommandMenuItemVariant.PRIMARY,
      }),
    ).toBe(CommandMenuItemVariant.DISABLED);
  });

  it('should return the fallback variant when the result is not a variant', () => {
    expect(
      evaluateConditionalVariantExpression({
        expression: '"LOUD"',
        context: {},
        fallbackVariant: CommandMenuItemVariant.SECONDARY,
      }),
    ).toBe(CommandMenuItemVariant.SECONDARY);
  });

  it('should return the fallback variant when the expression is invalid', () => {
    expect(
      evaluateConditionalVariantExpression({
        expression: '(((',
        context: {},
        fallbackVariant: CommandMenuItemVariant.PRIMARY,
      }),
    ).toBe(CommandMenuItemVariant.PRIMARY);
  });
});
