import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { PageLayoutType, ViewType, WidgetType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeRecordPageViewFieldForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-page-view-field-for-existing-object.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const MEMBER = STANDARD_OBJECTS.workspaceMember;
const PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workspaceMemberRecordPage;
const VIEW = MEMBER.views.workspaceMemberRecordPageFields;
const { allFlatEntityMaps: maps } =
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-10-27T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  });

describe('Workspace member standard record page', () => {
  it('provisions a home fields widget bound to the member fields view', () => {
    const objectMetadata =
      maps.flatObjectMetadataMaps.byUniversalIdentifier[
        MEMBER.universalIdentifier
      ]!;
    const view =
      maps.flatViewMaps.byUniversalIdentifier[VIEW.universalIdentifier]!;
    expect(
      maps.flatPageLayoutMaps.byUniversalIdentifier[PAGE.universalIdentifier],
    ).toMatchObject({
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: objectMetadata.id,
      isSystemSideEffect: true,
    });
    expect(view).toMatchObject({
      objectMetadataId: objectMetadata.id,
      type: ViewType.FIELDS_WIDGET,
      isSystemSideEffect: true,
    });
    expect(
      maps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        PAGE.tabs.home.widgets.fields.universalIdentifier
      ],
    ).toMatchObject({
      type: WidgetType.FIELDS,
      pageLayoutTabUniversalIdentifier: PAGE.tabs.home.universalIdentifier,
      configuration: { viewId: view.id, newFieldDefaultVisibility: true },
      universalConfiguration: {
        viewUniversalIdentifier: view.universalIdentifier,
        newFieldDefaultVisibility: true,
      },
    });
  });

  it('shows member details and assigned records without exposing account settings', () => {
    const fields = Object.values(maps.flatViewFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (field) => field.viewUniversalIdentifier === VIEW.universalIdentifier,
      );
    const fieldNames = fields.map(
      (field) =>
        maps.flatFieldMetadataMaps.byUniversalIdentifier[
          field.fieldMetadataUniversalIdentifier
        ]!.name,
    );
    expect(fieldNames.sort()).toEqual(
      [
        'userEmail',
        'jobTitle',
        'createdAt',
        'updatedAt',
        'assignedTasks',
        'accountOwnerForCompanies',
        'ownedOpportunities',
      ].sort(),
    );
    expect(
      fields.every((field) => field.isVisible && field.isSystemSideEffect),
    ).toBe(true);
    const groups = Object.values(
      maps.flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (group) => group.viewUniversalIdentifier === VIEW.universalIdentifier,
      )
      .sort((first, second) => first.position - second.position);
    expect(groups.map((group) => group.name)).toEqual([
      'General',
      'System',
      'Relations',
    ]);
  });

  it('adds future custom relations through the existing field side effect', () => {
    const view =
      maps.flatViewMaps.byUniversalIdentifier[VIEW.universalIdentifier]!;
    view.viewFieldGroupUniversalIdentifiers = Object.values(
      VIEW.viewFieldGroups,
    ).map((group) => group.universalIdentifier);
    view.viewFieldUniversalIdentifiers = Object.values(VIEW.viewFields).map(
      (field) => field.universalIdentifier,
    );
    const relation = {
      ...maps.flatFieldMetadataMaps.byUniversalIdentifier[
        MEMBER.fields.assignedTasks.universalIdentifier
      ]!,
      universalIdentifier: '20202020-3333-4333-8333-333333333333',
      applicationUniversalIdentifier: '20202020-4444-4444-8444-444444444444',
      name: 'assignedTickets',
    };
    expect(
      computeRecordPageViewFieldForExistingObject({
        sourceFlatFieldMetadata: relation,
        recordPageViewUniversalIdentifier: VIEW.universalIdentifier,
        ...maps,
      }),
    ).toMatchObject({
      fieldMetadataUniversalIdentifier: relation.universalIdentifier,
      applicationUniversalIdentifier: relation.applicationUniversalIdentifier,
      viewUniversalIdentifier: VIEW.universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        VIEW.viewFieldGroups.relations.universalIdentifier,
      position: 3,
      isVisible: true,
    });
  });
});
