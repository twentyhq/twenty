import { Module } from '@nestjs/common';

import { FormWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/form.workflow-action';

@Module({
  providers: [FormWorkflowAction],
  exports: [FormWorkflowAction],
})
export class FormActionModule {}
