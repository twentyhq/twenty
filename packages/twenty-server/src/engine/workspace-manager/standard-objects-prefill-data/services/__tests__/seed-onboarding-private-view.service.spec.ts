import { Test, type TestingModule } from '@nestjs/testing';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  AggregateOperations,
  ViewFilterOperand,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { SeedOnboardingPrivateViewService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/seed-onboarding-private-view.service';

const opportunityStandardObject = STANDARD_OBJECTS.opportunity;
const companyStandardObject = STANDARD_OBJECTS.company;

const FIELD_METADATA_IDS = {
  stage: 'stage-field-id',
  name: 'name-field-id',
  amount: 'amount-field-id',
  createdBy: 'created-by-field-id',
  closeDate: 'close-date-field-id',
  company: 'company-field-id',
  pointOfContact: 'point-of-contact-field-id',
  accountOwner: 'account-owner-field-id',
};

const OPPORTUNITY_OBJECT_METADATA_ID = 'opportunity-object-id';
const SEEDED_VIEW_ID = 'seeded-view-id';
const WORKSPACE_ID = 'workspace-id';
const CREATED_BY_USER_WORKSPACE_ID = 'user-workspace-id';

const flatObjectMetadataMaps = {
  byUniversalIdentifier: {
    [opportunityStandardObject.universalIdentifier]: {
      id: OPPORTUNITY_OBJECT_METADATA_ID,
    },
  },
};

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    [opportunityStandardObject.fields.stage.universalIdentifier]: {
      id: FIELD_METADATA_IDS.stage,
    },
    [opportunityStandardObject.fields.name.universalIdentifier]: {
      id: FIELD_METADATA_IDS.name,
    },
    [opportunityStandardObject.fields.amount.universalIdentifier]: {
      id: FIELD_METADATA_IDS.amount,
    },
    [opportunityStandardObject.fields.createdBy.universalIdentifier]: {
      id: FIELD_METADATA_IDS.createdBy,
    },
    [opportunityStandardObject.fields.closeDate.universalIdentifier]: {
      id: FIELD_METADATA_IDS.closeDate,
    },
    [opportunityStandardObject.fields.company.universalIdentifier]: {
      id: FIELD_METADATA_IDS.company,
    },
    [opportunityStandardObject.fields.pointOfContact.universalIdentifier]: {
      id: FIELD_METADATA_IDS.pointOfContact,
    },
    [companyStandardObject.fields.accountOwner.universalIdentifier]: {
      id: FIELD_METADATA_IDS.accountOwner,
    },
  },
};

describe('SeedOnboardingPrivateViewService', () => {
  let service: SeedOnboardingPrivateViewService;
  let viewService: jest.Mocked<ViewService>;
  let viewFieldService: jest.Mocked<ViewFieldService>;
  let viewFilterService: jest.Mocked<ViewFilterService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedOnboardingPrivateViewService,
        {
          provide: ViewService,
          useValue: {
            createOne: jest.fn().mockResolvedValue({ id: SEEDED_VIEW_ID }),
          },
        },
        {
          provide: ViewFieldService,
          useValue: { createMany: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: ViewFilterService,
          useValue: { createOne: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
            }),
          },
        },
      ],
    }).compile();

    service = module.get(SeedOnboardingPrivateViewService);
    viewService = module.get(ViewService);
    viewFieldService = module.get(ViewFieldService);
    viewFilterService = module.get(ViewFilterService);
  });

  it('creates a private kanban view grouped by stage for the workspace creator', async () => {
    await service.seedForWorkspace({
      workspaceId: WORKSPACE_ID,
      createdByUserWorkspaceId: CREATED_BY_USER_WORKSPACE_ID,
    });

    expect(viewService.createOne).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      createdByUserWorkspaceId: CREATED_BY_USER_WORKSPACE_ID,
      createViewInput: expect.objectContaining({
        name: 'My Pipeline',
        objectMetadataId: OPPORTUNITY_OBJECT_METADATA_ID,
        type: ViewType.KANBAN,
        mainGroupByFieldMetadataId: FIELD_METADATA_IDS.stage,
        kanbanAggregateOperation: AggregateOperations.SUM,
        kanbanAggregateOperationFieldMetadataId: FIELD_METADATA_IDS.amount,
        visibility: ViewVisibility.UNLISTED,
      }),
    });
  });

  it('seeds the standard kanban card fields on the new view', async () => {
    await service.seedForWorkspace({
      workspaceId: WORKSPACE_ID,
      createdByUserWorkspaceId: CREATED_BY_USER_WORKSPACE_ID,
    });

    expect(viewFieldService.createMany).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      createViewFieldInputs: [
        FIELD_METADATA_IDS.name,
        FIELD_METADATA_IDS.amount,
        FIELD_METADATA_IDS.createdBy,
        FIELD_METADATA_IDS.closeDate,
        FIELD_METADATA_IDS.company,
        FIELD_METADATA_IDS.pointOfContact,
      ].map((fieldMetadataId, position) => ({
        fieldMetadataId,
        viewId: SEEDED_VIEW_ID,
        position,
        isVisible: true,
        size: 150,
      })),
    });
  });

  it('seeds the nested company.accountOwner = me advanced filter', async () => {
    await service.seedForWorkspace({
      workspaceId: WORKSPACE_ID,
      createdByUserWorkspaceId: CREATED_BY_USER_WORKSPACE_ID,
    });

    expect(viewFilterService.createOne).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      createViewFilterInput: {
        viewId: SEEDED_VIEW_ID,
        fieldMetadataId: FIELD_METADATA_IDS.company,
        relationTargetFieldMetadataId: FIELD_METADATA_IDS.accountOwner,
        operand: ViewFilterOperand.IS,
        value: { isCurrentWorkspaceMemberSelected: true, selectedRecordIds: [] },
      },
    });
  });
});
