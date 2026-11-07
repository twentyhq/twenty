import { Test } from '@nestjs/testing';

import {
  FieldMetadataType,
  type StepFilter,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { createMockManualTrigger } from 'src/modules/workflow/workflow-executor/utils/create-mock-manual-trigger.util';
import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';
import { type WorkflowFormAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { StepFilterVariableSourcesWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/step-filter-variable-sources.workspace-service';

const FORM_STEP: WorkflowFormAction = {
  id: 'form-step',
  name: 'Form',
  type: WorkflowActionType.FORM,
  valid: true,
  settings: {
    input: [
      {
        id: 'close-date-field',
        name: 'closeDate',
        label: 'Close date',
        type: FieldMetadataType.DATE,
      },
    ],
    outputSchema: {},
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: 0 },
    },
  },
};

const CLOSE_DATE_IS_IN_PAST: StepFilter = {
  id: 'filter',
  stepOutputKey: '{{form-step.closeDate}}',
  operand: ViewFilterOperand.IS_IN_PAST,
  value: '',
  stepFilterGroupId: 'group',
};

describe('StepFilterVariableSourcesWorkspaceService', () => {
  let service: StepFilterVariableSourcesWorkspaceService;

  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({
      providers: [
        StepFilterVariableSourcesWorkspaceService,
        WorkflowSchemaWorkspaceService,
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: {
            getFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
              flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
              objectIdByNameSingular: {},
            }),
          },
        },
        { provide: WorkspaceManyOrAllFlatEntityMapsCacheService, useValue: {} },
      ],
    }).compile();

    service = testingModule.get(StepFilterVariableSourcesWorkspaceService);
  });

  it('should compare a form date answer as a date even when the form saved no output schema', async () => {
    const variableSources = await service.buildVariableSources({
      stepFilters: [CLOSE_DATE_IS_IN_PAST],
      trigger: createMockManualTrigger(),
      steps: [FORM_STEP],
      workspaceId: 'workspace-id',
    });

    expect(
      evaluateStepFilters({
        stepFilters: [CLOSE_DATE_IS_IN_PAST],
        stepFilterGroups: [
          { id: 'group', logicalOperator: StepLogicalOperator.AND },
        ],
        context: { 'form-step': { closeDate: '2020-01-01' } },
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        variableSources,
      }),
    ).toBe(true);
  });
});
