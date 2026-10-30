import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';

const validateUpdateViewInput = (input: Record<string, unknown>) =>
  validate(plainToInstance(UpdateViewInput, input));

describe('UpdateViewInput', () => {
  it('accepts a numeric position without an id', async () => {
    expect(await validateUpdateViewInput({ position: 2.5 })).toHaveLength(0);
  });

  it('accepts names with apostrophes and dots', async () => {
    expect(
      await validateUpdateViewInput({ name: "Deals d'été v2.0" }),
    ).toHaveLength(0);
  });

  it('accepts supported translation locales', async () => {
    expect(
      await validateUpdateViewInput({
        translations: [{ locale: 'fr-FR', property: 'name', value: 'Tous' }],
      }),
    ).toHaveLength(0);
  });

  it('rejects unsupported translation locales', async () => {
    const errors = await validateUpdateViewInput({
      translations: [{ locale: 'fr_FR', property: 'name', value: 'Tous' }],
    });

    expect(errors.map(({ property }) => property)).toEqual(['translations']);
  });
});
