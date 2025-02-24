import { ModuleRef } from '@nestjs/core';

import { EntityManager } from 'typeorm';

import { StripeIntegrationService } from 'src/engine/core-modules/stripe/integrations/stripe-integration.service';

export const integrationPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
  moduleRef: ModuleRef,
  workspaceId: string,
) => {
  const stripe = moduleRef.get(StripeIntegrationService, { strict: false });
  const isActive = await stripe.findAll(workspaceId);

  if (isActive) {
    await entityManager
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.integration`, ['name', 'position'])
      .orIgnore()
      .values([{ name: 'Stripe', position: 1 }])
      .returning('*')
      .execute();
  }
};
