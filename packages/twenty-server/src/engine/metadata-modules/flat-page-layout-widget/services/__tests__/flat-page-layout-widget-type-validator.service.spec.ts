import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import {
  FlatPageLayoutWidgetTypeValidatorService,
  type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
  type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
} from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';

const buildArgs = (type: string) =>
  ({
    flatEntityToValidate: { type, title: 'Test widget' },
    update: {},
  }) as unknown as ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs &
    ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs;

describe('FlatPageLayoutWidgetTypeValidatorService', () => {
  const flatPageLayoutWidgetTypeValidatorService =
    new FlatPageLayoutWidgetTypeValidatorService();

  it.each(['constructor', 'toString', '__proto__', 'GRAPHH', 'graph'])(
    'should return a single unsupported type error for %s',
    (type) => {
      const expectedErrors = [
        expect.objectContaining({
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: `Unsupported page layout widget type ${type}`,
          value: type,
        }),
      ];

      expect(
        flatPageLayoutWidgetTypeValidatorService.validateFlatPageLayoutWidgetTypeSpecificitiesForCreation(
          buildArgs(type),
        ),
      ).toEqual(expectedErrors);
      expect(
        flatPageLayoutWidgetTypeValidatorService.validateFlatPageLayoutWidgetTypeSpecificitiesForUpdate(
          buildArgs(type),
        ),
      ).toEqual(expectedErrors);
    },
  );
});
