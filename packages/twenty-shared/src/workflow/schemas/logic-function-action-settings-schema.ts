import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { expectedOutputSchemaShape } from './expected-output-schema-shape';

export const workflowLogicFunctionActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      logicFunctionId: z.string(),
      logicFunctionInput: z.record(z.string(), z.any()),
    }),
    ...expectedOutputSchemaShape,
  });
