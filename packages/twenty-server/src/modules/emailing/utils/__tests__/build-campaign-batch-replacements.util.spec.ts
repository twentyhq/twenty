import { applyReplacementTags } from 'src/engine/core-modules/emailing-domain/utils/apply-replacement-tags.util';
import { buildCampaignBatchReplacements } from 'src/modules/emailing/utils/build-campaign-batch-replacements.util';

describe('buildCampaignBatchReplacements', () => {
  it('escapes a value for the html body and leaves it raw for the text body', () => {
    const replacements = buildCampaignBatchReplacements({
      variableNames: ['name.firstName'],
      variables: { 'name.firstName': '<img onerror="x">' },
    });

    expect(applyReplacementTags('Hello {{v_h_0}}', replacements)).toBe(
      'Hello &lt;img onerror=&quot;x&quot;&gt;',
    );
    expect(applyReplacementTags('Hello {{v_t_0}}', replacements)).toBe(
      'Hello <img onerror="x">',
    );
  });

  it('substitutes an empty string for a variable the recipient has no value for', () => {
    const replacements = buildCampaignBatchReplacements({
      variableNames: ['jobTitle'],
      variables: {},
    });

    expect(applyReplacementTags('Role: {{v_t_0}}.', replacements)).toBe(
      'Role: .',
    );
  });

  it('keeps each variable on its own pair of tags', () => {
    const replacements = buildCampaignBatchReplacements({
      variableNames: ['first', 'second'],
      variables: { first: 'Ada', second: 'Lovelace' },
    });

    expect(applyReplacementTags('{{v_t_0}} {{v_t_1}}', replacements)).toBe(
      'Ada Lovelace',
    );
  });

  it('leaves a tag the recipient has no replacement for untouched rather than blanking it', () => {
    const replacements = buildCampaignBatchReplacements({
      variableNames: ['known'],
      variables: { known: 'yes' },
    });

    expect(applyReplacementTags('{{v_t_0}} {{v_t_9}}', replacements)).toBe(
      'yes {{v_t_9}}',
    );
  });
});
