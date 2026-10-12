import { isString } from '@sniptt/guards';
import { isDefined, isValidVariable } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  buildManualTriggerMetadataNode,
  type BulkRecordsAvailability,
  extractRawVariableNamePart,
  getCurrentItemSchemaFromFlattenedArrayOutputSchema,
  type GlobalAvailability,
  isBaseOutputSchemaV2,
  isFlattenedArrayOutputSchema,
  navigateOutputSchemaProperty,
  type SingleRecordAvailability,
  TRIGGER_STEP_ID,
  WORKFLOW_TRIGGER_METADATA_KEY,
  WORKFLOW_TRIGGER_PAYLOAD_KEY,
  WORKFLOW_TRIGGER_RECORD_LABEL,
  WORKFLOW_TRIGGER_RECORDS_LABEL,
  WorkflowActionType,
} from 'twenty-shared/workflow';

import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { getObjectMetadataInfoOrThrow } from 'src/modules/workflow/common/utils/get-object-metadata-info-or-throw.util';
import { type WorkflowObjectMetadataMaps } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { DEFAULT_ITERATOR_CURRENT_ITEM } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/default-iterator-current-item.const';
import {
  type Leaf,
  type Node,
  type OutputSchema,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { computeOutputSchemaFromExpectedSample } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-output-schema-from-expected-sample.util';
import { extractPropertyPathFromVariable } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/extract-property-path-from-variable';
import { generateFakeArrayItem } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-array-item';
import { generateFakeFormResponse } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-form-response';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { inferArrayItemSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/infer-array-item-schema';
import { WAIT_FOR_EVENT_NAME_PATTERN } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/constants/wait-for-event-name-pattern.constant';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type WorkflowVersionContent = {
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
};

type ObjectMetadataStepContext = {
  objectMetadataMaps: WorkflowObjectMetadataMaps;
  workflowVersionContent?: WorkflowVersionContent;
};

const computeRecordOutputSchema = ({
  objectType,
  objectMetadataMaps,
}: {
  objectType: string;
  objectMetadataMaps: WorkflowObjectMetadataMaps;
}): OutputSchema =>
  generateFakeObjectRecord({
    objectMetadataInfo: getObjectMetadataInfoOrThrow({
      objectNameSingular: objectType,
      objectMetadataMaps,
    }),
  });

const computeFindRecordsOutputSchema = ({
  objectType,
  objectMetadataMaps,
}: {
  objectType: string;
  objectMetadataMaps: WorkflowObjectMetadataMaps;
}): OutputSchema => {
  const recordOutputSchema = computeRecordOutputSchema({
    objectType,
    objectMetadataMaps,
  });

  const objectMetadataInfo = getObjectMetadataInfoOrThrow({
    objectNameSingular: objectType,
    objectMetadataMaps,
  });

  const first: Node = {
    isLeaf: false,
    label: `First ${objectMetadataInfo.flatObjectMetadata.labelSingular ?? 'Record'}`,
    icon: 'IconAlpha',
    type: 'object',
    value: recordOutputSchema,
  };

  const all: Leaf = {
    isLeaf: true,
    label: `All ${objectMetadataInfo.flatObjectMetadata.labelPlural ?? 'Records'}`,
    type: 'array',
    icon: 'IconListDetails',
    value: 'Returns an array of records',
  };

  const totalCount: Leaf = {
    isLeaf: true,
    label: 'Total Count',
    icon: 'IconSum',
    type: 'number',
    value: 'Count of matching records',
  };

  return { first, all, totalCount } satisfies OutputSchema;
};

const computeWaitForEventOutputSchema = ({
  eventName,
  objectMetadataMaps,
}: {
  eventName: string | undefined;
  objectMetadataMaps: WorkflowObjectMetadataMaps;
}): OutputSchema => {
  if (!isDefined(eventName) || !WAIT_FOR_EVENT_NAME_PATTERN.test(eventName)) {
    return {};
  }

  const [objectType, action] = eventName.split('.');

  const objectMetadataInfo = getObjectMetadataInfoOrThrow({
    objectNameSingular: objectType,
    objectMetadataMaps,
  });

  const recordLabel =
    objectMetadataInfo.flatObjectMetadata.labelSingular ?? 'Record';

  const record: Node = {
    isLeaf: false,
    label: recordLabel,
    icon: 'IconAlpha',
    type: 'object',
    value: generateFakeObjectRecord({ objectMetadataInfo }),
  };

  const recordId: Leaf = {
    isLeaf: true,
    label: 'Record ID',
    icon: 'IconId',
    type: 'string',
    value: generateFakeValue('string'),
  };

  const hasTimedOut: Leaf = {
    isLeaf: true,
    label: 'Has Timed Out',
    icon: 'IconClockX',
    type: 'boolean',
    value: false,
  };

  if (action !== 'updated' && action !== 'upserted') {
    return { record, recordId, hasTimedOut } satisfies OutputSchema;
  }

  const before: Node = {
    isLeaf: false,
    label: `${recordLabel} Before Update`,
    icon: 'IconHistory',
    type: 'object',
    value: generateFakeObjectRecord({ objectMetadataInfo }),
  };

  const updatedFields: Leaf = {
    isLeaf: true,
    label: 'Updated Fields',
    icon: 'IconListDetails',
    type: 'array',
    value: ['name'],
  };

  return {
    record,
    recordId,
    before,
    updatedFields,
    hasTimedOut,
  } satisfies OutputSchema;
};

const computeTriggerOutputSchemaFromAvailability = ({
  availability,
  objectMetadataMaps,
}: {
  availability:
    | GlobalAvailability
    | SingleRecordAvailability
    | BulkRecordsAvailability;
  objectMetadataMaps: WorkflowObjectMetadataMaps;
}): OutputSchema => {
  if (availability.type === 'GLOBAL') {
    return {
      [WORKFLOW_TRIGGER_METADATA_KEY]: buildManualTriggerMetadataNode(),
    };
  }

  if (availability.type === 'SINGLE_RECORD') {
    const recordOutputSchema = computeRecordOutputSchema({
      objectType: availability.objectNameSingular,
      objectMetadataMaps,
    });

    const payload: Node = {
      isLeaf: false,
      type: 'object',
      label: WORKFLOW_TRIGGER_RECORD_LABEL,
      value: recordOutputSchema,
    };

    return {
      [WORKFLOW_TRIGGER_PAYLOAD_KEY]: payload,
      [WORKFLOW_TRIGGER_METADATA_KEY]: buildManualTriggerMetadataNode(),
    };
  }

  if (availability.type === 'BULK_RECORDS') {
    const objectMetadataInfo = getObjectMetadataInfoOrThrow({
      objectNameSingular: availability.objectNameSingular,
      objectMetadataMaps,
    });

    const payload: Node = {
      isLeaf: false,
      type: 'object',
      label: WORKFLOW_TRIGGER_RECORDS_LABEL,
      value: {
        [objectMetadataInfo.flatObjectMetadata.namePlural]: {
          label: objectMetadataInfo.flatObjectMetadata.labelPlural,
          isLeaf: true,
          type: 'array',
          value:
            'Array of ' + objectMetadataInfo.flatObjectMetadata.labelPlural,
        },
      },
    };

    return {
      [WORKFLOW_TRIGGER_PAYLOAD_KEY]: payload,
      [WORKFLOW_TRIGGER_METADATA_KEY]: buildManualTriggerMetadataNode(),
    };
  }

  return {};
};

const computeCurrentItemFromObjectType = ({
  objectType,
  objectMetadataMaps,
}: {
  objectType: string;
  objectMetadataMaps: WorkflowObjectMetadataMaps;
}): Node => {
  const objectMetadataInfo = getObjectMetadataInfoOrThrow({
    objectNameSingular: objectType,
    objectMetadataMaps,
  });

  return {
    label:
      'Current Item (' +
      objectMetadataInfo.flatObjectMetadata.labelSingular +
      ')',
    isLeaf: false,
    type: 'object',
    value: computeRecordOutputSchema({ objectType, objectMetadataMaps }),
  };
};

const getOutputSchemaWithExpectedFallback = (settings: {
  outputSchema?: OutputSchema;
  expectedOutputSchema?: object;
}): BaseOutputSchemaV2 => {
  const outputSchema = settings.outputSchema;

  if (isBaseOutputSchemaV2(outputSchema)) {
    return outputSchema;
  }

  const expectedOutputSchema = computeOutputSchemaFromExpectedSample(
    settings.expectedOutputSchema,
  );

  return isBaseOutputSchemaV2(expectedOutputSchema) ? expectedOutputSchema : {};
};

const computeIteratorCurrentItemFromVariable = ({
  items,
  objectMetadataMaps,
  workflowVersionContent,
}: {
  items: string;
} & ObjectMetadataStepContext): Leaf | Node => {
  if (!isDefined(workflowVersionContent)) {
    return DEFAULT_ITERATOR_CURRENT_ITEM;
  }

  const stepId = extractRawVariableNamePart({
    rawVariableName: items,
    part: 'stepId',
  });

  if (stepId === TRIGGER_STEP_ID) {
    const trigger = workflowVersionContent.trigger;

    if (!isDefined(trigger)) {
      return DEFAULT_ITERATOR_CURRENT_ITEM;
    }

    switch (trigger.type) {
      case WorkflowTriggerType.MANUAL: {
        if (trigger.settings.availability?.type === 'BULK_RECORDS') {
          return computeCurrentItemFromObjectType({
            objectType: trigger.settings.availability.objectNameSingular,
            objectMetadataMaps,
          });
        }

        return DEFAULT_ITERATOR_CURRENT_ITEM;
      }
      case WorkflowTriggerType.WEBHOOK: {
        const propertyPath = extractPropertyPathFromVariable(items);
        const schemaNode = navigateOutputSchemaProperty({
          schema: trigger.settings.outputSchema as BaseOutputSchemaV2,
          propertyPath,
        });

        if (!isDefined(schemaNode)) {
          return DEFAULT_ITERATOR_CURRENT_ITEM;
        }

        return inferArrayItemSchema({ schemaNode });
      }
      default: {
        return DEFAULT_ITERATOR_CURRENT_ITEM;
      }
    }
  }

  const step = workflowVersionContent.steps?.find((step) => step.id === stepId);

  if (!isDefined(step)) {
    return DEFAULT_ITERATOR_CURRENT_ITEM;
  }

  switch (step.type) {
    case WorkflowActionType.FIND_RECORDS: {
      return computeCurrentItemFromObjectType({
        objectType: step.settings.input.objectName,
        objectMetadataMaps,
      });
    }
    case WorkflowActionType.CODE:
    case WorkflowActionType.HTTP_REQUEST:
    case WorkflowActionType.LOGIC_FUNCTION: {
      const propertyPath = extractPropertyPathFromVariable(items);
      const outputSchema = getOutputSchemaWithExpectedFallback(step.settings);

      const variableTargetsWholeStepOutput = propertyPath.length === 0;

      if (variableTargetsWholeStepOutput) {
        if (!isFlattenedArrayOutputSchema(outputSchema)) {
          return DEFAULT_ITERATOR_CURRENT_ITEM;
        }

        return (
          getCurrentItemSchemaFromFlattenedArrayOutputSchema({
            schema: outputSchema,
          }) ?? DEFAULT_ITERATOR_CURRENT_ITEM
        );
      }

      const schemaNode = navigateOutputSchemaProperty({
        schema: outputSchema,
        propertyPath,
      });

      if (!isDefined(schemaNode)) {
        return DEFAULT_ITERATOR_CURRENT_ITEM;
      }

      return inferArrayItemSchema({ schemaNode });
    }
    default: {
      return DEFAULT_ITERATOR_CURRENT_ITEM;
    }
  }
};

const computeLoopCurrentItemOutputSchema = ({
  items,
  objectMetadataMaps,
  workflowVersionContent,
}: {
  items: string | undefined | unknown[];
} & ObjectMetadataStepContext): Leaf | Node => {
  if (!isDefined(items)) {
    return DEFAULT_ITERATOR_CURRENT_ITEM;
  }

  if (isString(items) && isValidVariable(items)) {
    return computeIteratorCurrentItemFromVariable({
      items,
      objectMetadataMaps,
      workflowVersionContent,
    });
  }

  return generateFakeArrayItem({ items });
};

export const computeStepOutputSchemaFromObjectMetadataMaps = ({
  step,
  objectMetadataMaps,
  workflowVersionContent,
}: {
  step: WorkflowTrigger | WorkflowAction;
} & ObjectMetadataStepContext): OutputSchema => {
  switch (step.type) {
    case WorkflowTriggerType.MANUAL: {
      const { availability } = step.settings;

      if (isDefined(availability)) {
        return computeTriggerOutputSchemaFromAvailability({
          availability,
          objectMetadataMaps,
        });
      }

      return {};
    }
    case WorkflowActionType.CREATE_RECORD:
    case WorkflowActionType.UPDATE_RECORD:
    case WorkflowActionType.DELETE_RECORD:
    case WorkflowActionType.UPSERT_RECORD:
    case WorkflowActionType.PICK_RECORD:
      return computeRecordOutputSchema({
        objectType: step.settings.input.objectName,
        objectMetadataMaps,
      });
    case WorkflowActionType.FIND_RECORDS:
      return computeFindRecordsOutputSchema({
        objectType: step.settings.input.objectName,
        objectMetadataMaps,
      });
    case WorkflowActionType.FORM:
      return generateFakeFormResponse({
        formFieldMetadataItems: step.settings.input,
        ...objectMetadataMaps,
      });
    case WorkflowActionType.WAIT_FOR_EVENT:
      return computeWaitForEventOutputSchema({
        eventName: step.settings.input?.eventName,
        objectMetadataMaps,
      });
    case WorkflowActionType.ITERATOR:
      return {
        currentItem: computeLoopCurrentItemOutputSchema({
          items: step.settings.input.items,
          objectMetadataMaps,
          workflowVersionContent,
        }),
        currentItemIndex: {
          label: 'Current Item Index',
          isLeaf: true,
          type: 'number',
          value: generateFakeValue('number'),
        },
        hasProcessedAllItems: {
          label: 'Has Processed All Items',
          isLeaf: true,
          type: 'boolean',
          value: false,
        },
      };
    default:
      return {};
  }
};
