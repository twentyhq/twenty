import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateFrontComponentHeaderCommandMenuItems } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-front-component-header-command-menu-items.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

const COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '11111111-1111-4111-8111-111111111111';

const makeWidget = ({
  headerCommandMenuItemUniversalIdentifiers,
  applicationUniversalIdentifier = 'application-universal-identifier',
}: {
  headerCommandMenuItemUniversalIdentifiers: string[];
  applicationUniversalIdentifier?: string;
}) =>
  ({
    applicationUniversalIdentifier,
    universalConfiguration: {
      configurationType: WidgetConfigurationType.FRONT_COMPONENT,
      frontComponentUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
      headerCommandMenuItemUniversalIdentifiers,
    },
  }) as UniversalFlatPageLayoutWidget;

const makeCommandMenuItemMaps = ({
  applicationUniversalIdentifier = 'application-universal-identifier',
}: {
  applicationUniversalIdentifier?: string;
} = {}) => {
  const commandMenuItemMaps =
    createEmptyFlatEntityMaps() as MetadataUniversalFlatEntityMaps<'commandMenuItem'>;
  const commandMenuItem = {
    universalIdentifier: COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
    applicationUniversalIdentifier,
  } as UniversalFlatCommandMenuItem;

  commandMenuItemMaps.byUniversalIdentifier[
    COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER
  ] = commandMenuItem;

  return commandMenuItemMaps;
};

describe('validateFrontComponentHeaderCommandMenuItems', () => {
  it('accepts command menu items from the widget application', () => {
    expect(
      validateFrontComponentHeaderCommandMenuItems({
        flatPageLayoutWidget: makeWidget({
          headerCommandMenuItemUniversalIdentifiers: [
            COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
          ],
        }),
        flatCommandMenuItemMaps: makeCommandMenuItemMaps(),
      }),
    ).toEqual([]);
  });

  it('rejects missing, duplicate, and cross-application references', () => {
    const errors = validateFrontComponentHeaderCommandMenuItems({
      flatPageLayoutWidget: makeWidget({
        headerCommandMenuItemUniversalIdentifiers: [
          COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
          COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
          '33333333-3333-4333-8333-333333333333',
        ],
      }),
      flatCommandMenuItemMaps: makeCommandMenuItemMaps({
        applicationUniversalIdentifier: 'another-application',
      }),
    });

    expect(errors).toHaveLength(3);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          value: COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        }),
        expect.objectContaining({
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          value: '33333333-3333-4333-8333-333333333333',
        }),
      ]),
    );
  });
});
