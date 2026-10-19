import { EmailingDomainExceptionCode } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { collectCampaignVariableNamesFromStringOrThrow } from 'src/modules/emailing/utils/collect-campaign-variable-names-from-string-or-throw.util';

describe('collectCampaignVariableNamesFromStringOrThrow', () => {
  it('should collect the name of a variable with a fallback', () => {
    expect([
      ...collectCampaignVariableNamesFromStringOrThrow(
        'Hi {{name.firstName | default: "Mr. \\"X\\""}} at {{companyName}}',
      ),
    ]).toEqual(['name.firstName', 'companyName']);
  });

  it.each([
    ['{{jobTitle | there}}', '{{jobTitle | there}}'],
    ['{{jobTitle | "there"}}', '{{jobTitle | "there"}}'],
    ['{{jobTitle | default: there}}', '{{jobTitle | default: there}}'],
    ["{{jobTitle | default: 'there'}}", "{{jobTitle | default: 'there'}}"],
    ['{{jobTitle | default: “there”}}', '{{jobTitle | default: “there”}}'],
    ['{{jobTitle | default: {there}}}', '{{jobTitle | default: {there}}'],
    ['{{jobTitle there', '{{jobTitle there, welcome'],
  ])(
    'should reject the malformed variable %s',
    (variable, reportedVariable) => {
      expect(() =>
        collectCampaignVariableNamesFromStringOrThrow(
          `Hi ${variable}, welcome`,
        ),
      ).toThrow(
        expect.objectContaining({
          code: EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
          message: expect.stringContaining(
            `Malformed campaign variable: ${reportedVariable}.`,
          ),
        }),
      );
    },
  );
});
