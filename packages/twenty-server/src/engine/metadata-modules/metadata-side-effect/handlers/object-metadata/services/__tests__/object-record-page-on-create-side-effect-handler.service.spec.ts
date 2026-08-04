import {
  getPageLayoutTabUniversalIdentifier,
  getPageLayoutWidgetUniversalIdentifier,
  getRecordPageLayoutUniversalIdentifier,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey, ViewType } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { ObjectRecordPageOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-record-page-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const OBJECT_METADATA = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  labelSingular: 'Ticket',
  labelIdentifierFieldMetadataUniversalIdentifier: null,
};

const DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER =
  getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.FIELDS_WIDGET,
  });

const DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  getRecordPageLayoutUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

const buildArgs = ({
  pendingViews = [],
  pendingPageLayouts = [],
}: {
  pendingViews?: {
    universalIdentifier: string;
    isSystemSideEffect: boolean;
    type: ViewType;
    objectMetadataUniversalIdentifier: string;
  }[];
  pendingPageLayouts?: {
    universalIdentifier: string;
    isSystemSideEffect: boolean;
    type: PageLayoutType;
    objectMetadataUniversalIdentifier: string;
  }[];
} = {}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: OBJECT_METADATA,
    allFlatEntityOperationRecordByMetadataName: {
      objectMetadata: {
        flatEntityToCreate: { [OBJECT_UNIVERSAL_IDENTIFIER]: OBJECT_METADATA },
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      fieldMetadata: {
        flatEntityToCreate: {},
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      view: {
        flatEntityToCreate: Object.fromEntries(
          pendingViews.map((pendingView) => [
            pendingView.universalIdentifier,
            pendingView,
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      pageLayout: {
        flatEntityToCreate: Object.fromEntries(
          pendingPageLayouts.map((pendingPageLayout) => [
            pendingPageLayout.universalIdentifier,
            pendingPageLayout,
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    } as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {},
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectRecordPageOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectRecordPageOnCreateSideEffectHandlerService as unknown as new () => ObjectRecordPageOnCreateSideEffectHandlerService)();

  it('should emit the full record-page stack with derived identifiers', () => {
    const result = handler.buildSideEffects(buildArgs());

    expect(result.status).toBe('success');

    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    const views = Object.values(
      result.operations.view?.flatEntityToCreate ?? {},
    );

    expect(views).toHaveLength(1);
    expect(views[0]).toMatchObject({
      universalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
      key: ViewKey.FIELDS_WIDGET,
      type: ViewType.FIELDS_WIDGET,
      isSystemSideEffect: true,
      name: 'Ticket Record Page Fields',
    });

    const pageLayouts = Object.values(
      result.operations.pageLayout?.flatEntityToCreate ?? {},
    );

    expect(pageLayouts).toHaveLength(1);
    expect(pageLayouts[0]).toMatchObject({
      universalIdentifier: DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
      type: PageLayoutType.RECORD_PAGE,
      isSystemSideEffect: true,
    });

    const pageLayoutTabs = Object.values(
      result.operations.pageLayoutTab?.flatEntityToCreate ?? {},
    );

    expect(pageLayoutTabs).toHaveLength(5);
    expect(pageLayoutTabs.map((tab) => tab.title)).toEqual([
      'Home',
      'Timeline',
      'Tasks',
      'Notes',
      'Files',
    ]);
    for (const pageLayoutTab of pageLayoutTabs) {
      expect(pageLayoutTab.universalIdentifier).toBe(
        getPageLayoutTabUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          pageLayoutUniversalIdentifier:
            DERIVED_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          title: pageLayoutTab.title,
        }),
      );
      expect(pageLayoutTab.isSystemSideEffect).toBe(true);
    }

    const pageLayoutWidgets = Object.values(
      result.operations.pageLayoutWidget?.flatEntityToCreate ?? {},
    );

    expect(pageLayoutWidgets).toHaveLength(5);
    for (const pageLayoutWidget of pageLayoutWidgets) {
      expect(pageLayoutWidget.universalIdentifier).toBe(
        getPageLayoutWidgetUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          pageLayoutTabUniversalIdentifier:
            pageLayoutWidget.pageLayoutTabUniversalIdentifier,
          title: pageLayoutWidget.title,
        }),
      );
      expect(pageLayoutWidget.isSystemSideEffect).toBe(true);
    }

    const fieldsWidget = pageLayoutWidgets.find(
      (pageLayoutWidget) =>
        pageLayoutWidget.universalConfiguration.configurationType ===
        WidgetConfigurationType.FIELDS,
    );

    expect(fieldsWidget?.universalConfiguration).toMatchObject({
      viewUniversalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
      newFieldDefaultVisibility: true,
    });
  });

  it('should noop when the batch carries a caller-authored FIELDS_WIDGET view for the object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingViews: [
          {
            universalIdentifier: 'app-authored-view-uid',
            isSystemSideEffect: false,
            type: ViewType.FIELDS_WIDGET,
            objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should noop when the batch carries a caller-authored RECORD_PAGE layout for the object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingPageLayouts: [
          {
            universalIdentifier: 'app-authored-layout-uid',
            isSystemSideEffect: false,
            type: PageLayoutType.RECORD_PAGE,
            objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should still emit when the caller-authored record-page surface targets another object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingViews: [
          {
            universalIdentifier: 'app-authored-view-uid',
            isSystemSideEffect: false,
            type: ViewType.FIELDS_WIDGET,
            objectMetadataUniversalIdentifier: 'another-object-uid',
          },
        ],
        pendingPageLayouts: [
          {
            universalIdentifier: 'app-authored-layout-uid',
            isSystemSideEffect: false,
            type: PageLayoutType.RECORD_PAGE,
            objectMetadataUniversalIdentifier: 'another-object-uid',
          },
        ],
      }),
    );

    expect(result.status).toBe('success');
  });

  it('should still emit when the pending record-page surface is engine-emitted (isSystemSideEffect)', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingViews: [
          {
            universalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: true,
            type: ViewType.FIELDS_WIDGET,
            objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    expect(result.status).toBe('success');
  });
});
