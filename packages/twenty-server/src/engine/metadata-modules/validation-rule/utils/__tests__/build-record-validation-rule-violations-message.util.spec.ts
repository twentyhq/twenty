import { buildRecordValidationRuleViolationsMessage } from 'src/engine/metadata-modules/validation-rule/utils/build-record-validation-rule-violations-message.util';

describe('buildRecordValidationRuleViolationsMessage', () => {
  it('should return the message of a single violation', () => {
    expect(
      buildRecordValidationRuleViolationsMessage([
        { message: 'Comments are required' },
      ]),
    ).toBe('Comments are required');
  });

  it('should include every violated rule message in order', () => {
    expect(
      buildRecordValidationRuleViolationsMessage([
        { message: 'Comments are required' },
        { message: 'A won opportunity needs an amount' },
      ]),
    ).toBe('Comments are required; A won opportunity needs an amount');
  });

  it('should not repeat a message violated by several records', () => {
    expect(
      buildRecordValidationRuleViolationsMessage([
        { message: 'Comments are required' },
        { message: 'A won opportunity needs an amount' },
        { message: 'Comments are required' },
        { message: 'A won opportunity needs an amount' },
      ]),
    ).toBe('Comments are required; A won opportunity needs an amount');
  });

  it('should return an empty message when there is no violation', () => {
    expect(buildRecordValidationRuleViolationsMessage([])).toBe('');
  });
});
