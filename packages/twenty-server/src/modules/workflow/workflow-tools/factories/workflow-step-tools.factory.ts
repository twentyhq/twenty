import { type ToolSet } from 'ai';

import {
  type ObjectWithPermission,
  type ToolGeneratorContext,
} from 'src/engine/core-modules/tool-generator/types/tool-generator.types';

import { buildCreateRecordStepTool } from './builders/create-record-step.builder';
import { buildDeleteRecordStepTool } from './builders/delete-record-step.builder';
import { buildFindRecordsStepTool } from './builders/find-records-step.builder';
import { type WorkflowStepToolsDeps } from './builders/step-builder.utils';
import { buildUpdateRecordStepTool } from './builders/update-record-step.builder';

export { type WorkflowStepToolsDeps } from './builders/step-builder.utils';

export const createWorkflowStepToolsFactory = (deps: WorkflowStepToolsDeps) => {
  return (
    {
      objectMetadata,
      restrictedFields,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
    }: ObjectWithPermission,
    context: ToolGeneratorContext,
  ): ToolSet => {
    const tools: ToolSet = {};

    if (canCreate) {
      Object.assign(
        tools,
        buildCreateRecordStepTool(
          deps,
          objectMetadata,
          restrictedFields,
          context,
        ),
      );
    }

    if (canUpdate) {
      Object.assign(
        tools,
        buildUpdateRecordStepTool(
          deps,
          objectMetadata,
          restrictedFields,
          context,
        ),
      );
    }

    if (canRead) {
      Object.assign(
        tools,
        buildFindRecordsStepTool(
          deps,
          objectMetadata,
          restrictedFields,
          context,
        ),
      );
    }

    if (canDelete) {
      Object.assign(
        tools,
        buildDeleteRecordStepTool(deps, objectMetadata, context),
      );
    }

    return tools;
  };
};
