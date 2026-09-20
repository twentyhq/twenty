import { Module } from '@nestjs/common';

import { InputAskModule } from 'src/modules/input-ask/input-ask.module';
import { FormWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/form.workflow-action';

@Module({
  imports: [InputAskModule],
  providers: [FormWorkflowAction],
  exports: [FormWorkflowAction],
})
export class FormActionModule {}
