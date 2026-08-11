import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { validateRenamedWidgetConfigurationKeys } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-renamed-widget-configuration-keys.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const VIEW_UNIVERSAL_IDENTIFIER = '20202020-bbbb-4bbb-8bbb-000000000002';

const validateUniversalConfiguration = (universalConfiguration: unknown) =>
  validateRenamedWidgetConfigurationKeys({
    title: 'My widget',
    universalConfiguration,
  } as unknown as FlatPageLayoutWidget);

describe('validateRenamedWidgetConfigurationKeys', () => {
  describe.each([
    [WidgetConfigurationType.FIELDS],
    [WidgetConfigurationType.RECORD_TABLE],
  ])('%s', (configurationType) => {
    it('should accept the current viewUniversalIdentifier key', () => {
      const errors = validateUniversalConfiguration({
        configurationType,
        viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
      });

      expect(errors).toHaveLength(0);
    });

    it.each([[VIEW_UNIVERSAL_IDENTIFIER], [''], [null]])(
      'should reject the renamed viewId key holding %p',
      (formerKeyValue) => {
        const errors = validateUniversalConfiguration({
          configurationType,
          viewId: formerKeyValue,
        });

        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain(
          'was renamed to "viewUniversalIdentifier"',
        );
      },
    );

    it('should reject the renamed viewId key even alongside the current one', () => {
      const errors = validateUniversalConfiguration({
        configurationType,
        viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
        viewId: VIEW_UNIVERSAL_IDENTIFIER,
      });

      expect(errors).toHaveLength(1);
    });
  });

  it('should ignore configuration types that have no renamed key', () => {
    const errors = validateUniversalConfiguration({
      configurationType: WidgetConfigurationType.FIELD,
      viewId: VIEW_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toHaveLength(0);
  });

  it('should ignore a missing configuration', () => {
    expect(validateUniversalConfiguration(null)).toHaveLength(0);
  });
});
