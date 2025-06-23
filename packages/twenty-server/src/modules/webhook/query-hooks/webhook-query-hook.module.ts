import { Module } from '@nestjs/common';

import { WebhookCreateManyPreQueryHook } from 'src/modules/webhook/query-hooks/webhook-create-many.pre-query.hook';
import { WebhookCreateOnePreQueryHook } from 'src/modules/webhook/query-hooks/webhook-create-one.pre-query.hook';
import { WebhookUpdateManyPreQueryHook } from 'src/modules/webhook/query-hooks/webhook-update-many.pre-query.hook';
import { WebhookUpdateOnePreQueryHook } from 'src/modules/webhook/query-hooks/webhook-update-one.pre-query.hook';
import { WebhookUrlValidationService } from 'src/modules/webhook/query-hooks/webhook-url-validation.service';

@Module({
  providers: [
    WebhookUrlValidationService,
    WebhookCreateOnePreQueryHook,
    WebhookCreateManyPreQueryHook,
    WebhookUpdateOnePreQueryHook,
    WebhookUpdateManyPreQueryHook,
  ],
})
export class WebhookQueryHookModule {}
