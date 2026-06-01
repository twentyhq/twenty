import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  AggregateOperations,
  ViewFilterOperand,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

const SEEDED_VIEW_CARD_FIELD_SIZE = 150;

// Seeds a private "My Pipeline" kanban for the workspace creator: opportunities
// grouped by stage, filtered to the accounts they own
// (company.accountOwner = me). It introduces new users to kanban views, nested
// relation filters and private (per-user) views through a single example view.
@Injectable()
export class SeedOnboardingPrivateViewService {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewFieldService: ViewFieldService,
    private readonly viewFilterService: ViewFilterService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async seedForWorkspace({
    workspaceId,
    createdByUserWorkspaceId,
  }: {
    workspaceId: string;
    createdByUserWorkspaceId: string;
  }): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const opportunityStandardObject = STANDARD_OBJECTS.opportunity;
    const companyStandardObject = STANDARD_OBJECTS.company;

    const opportunityObjectMetadataId =
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier: opportunityStandardObject.universalIdentifier,
        flatEntityMaps: flatObjectMetadataMaps,
      }).id;

    const resolveFieldMetadataId = (universalIdentifier: string) =>
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      }).id;

    const stageFieldMetadataId = resolveFieldMetadataId(
      opportunityStandardObject.fields.stage.universalIdentifier,
    );
    const nameFieldMetadataId = resolveFieldMetadataId(
      opportunityStandardObject.fields.name.universalIdentifier,
    );
    const amountFieldMetadataId = resolveFieldMetadataId(
      opportunityStandardObject.fields.amount.universalIdentifier,
    );
    const createdByFieldMetadataId = resolveFieldMetadataId(
      opportunityStandardObject.fields.createdBy.universalIdentifier,
    );
    const closeDateFieldMetadataId = resolveFieldMetadataId(
      opportunityStandardObject.fields.closeDate.universalIdentifier,
    );
    const companyFieldMetadataId = resolveFieldMetadataId(
      opportunityStandardObject.fields.company.universalIdentifier,
    );
    const pointOfContactFieldMetadataId = resolveFieldMetadataId(
      opportunityStandardObject.fields.pointOfContact.universalIdentifier,
    );
    const accountOwnerFieldMetadataId = resolveFieldMetadataId(
      companyStandardObject.fields.accountOwner.universalIdentifier,
    );

    const view = await this.viewService.createOne({
      workspaceId,
      createdByUserWorkspaceId,
      createViewInput: {
        name: 'My Pipeline',
        objectMetadataId: opportunityObjectMetadataId,
        type: ViewType.KANBAN,
        icon: 'IconLayoutKanban',
        position: 3,
        mainGroupByFieldMetadataId: stageFieldMetadataId,
        kanbanAggregateOperation: AggregateOperations.SUM,
        kanbanAggregateOperationFieldMetadataId: amountFieldMetadataId,
        visibility: ViewVisibility.UNLISTED,
      },
    });

    // Card fields mirror the standard "By Stage" kanban so the seeded board
    // looks complete (createOne does not generate view fields).
    await this.viewFieldService.createMany({
      workspaceId,
      createViewFieldInputs: [
        nameFieldMetadataId,
        amountFieldMetadataId,
        createdByFieldMetadataId,
        closeDateFieldMetadataId,
        companyFieldMetadataId,
        pointOfContactFieldMetadataId,
      ].map((fieldMetadataId, position) => ({
        fieldMetadataId,
        viewId: view.id,
        position,
        isVisible: true,
        size: SEEDED_VIEW_CARD_FIELD_SIZE,
      })),
    });

    // Nested relation filter: opportunity.company → company.accountOwner = me.
    await this.viewFilterService.createOne({
      workspaceId,
      createViewFilterInput: {
        viewId: view.id,
        fieldMetadataId: companyFieldMetadataId,
        relationTargetFieldMetadataId: accountOwnerFieldMetadataId,
        operand: ViewFilterOperand.IS,
        value: { isCurrentWorkspaceMemberSelected: true, selectedRecordIds: [] },
      },
    });
  }
}
