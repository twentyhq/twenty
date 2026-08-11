import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { validateFieldsFlatPageLayoutWidgetForCreation } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-fields-flat-page-layout-widget-for-creation.util';

const VIEW_UNIVERSAL_IDENTIFIER = '20202020-bbbb-4bbb-8bbb-000000000002';

const validateUniversalConfiguration = (universalConfiguration: unknown) =>
  validateFieldsFlatPageLayoutWidgetForCreation({
    flatEntityToValidate: {
      title: 'Fields',
      universalConfiguration,
    },
  } as unknown as ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs);

describe('validateFieldsFlatPageLayoutWidgetForCreation', () => {
  it.each([
    [
      'viewUniversalIdentifier',
      { viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
    ],
    ['legacy viewId', { viewId: VIEW_UNIVERSAL_IDENTIFIER }],
  ])('should accept a valid UUID under %s', (_label, reference) => {
    const errors = validateUniversalConfiguration({
      configurationType: 'FIELDS',
      ...reference,
    });

    expect(errors).toHaveLength(0);
  });

  // The conversion util treats an empty reference as an unbound widget,
  // so validation must not reject it
  it.each([
    ['viewUniversalIdentifier', { viewUniversalIdentifier: '' }],
    ['legacy viewId', { viewId: '' }],
  ])('should accept an empty %s', (_label, reference) => {
    const errors = validateUniversalConfiguration({
      configurationType: 'FIELDS',
      ...reference,
    });

    expect(errors).toHaveLength(0);
  });

  it.each([
    ['viewUniversalIdentifier', { viewUniversalIdentifier: 'not-a-uuid' }],
    ['legacy viewId', { viewId: 'not-a-uuid' }],
  ])('should reject a malformed %s', (_label, reference) => {
    const errors = validateUniversalConfiguration({
      configurationType: 'FIELDS',
      ...reference,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('Invalid view reference');
  });
});
