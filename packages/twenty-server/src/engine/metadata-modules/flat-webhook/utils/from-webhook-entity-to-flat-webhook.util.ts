import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromWebhookEntityToFlatWebhook = (
  args: FromEntityToFlatEntityArgs<'webhook'>,
): FlatWebhook => {
  const { entity: webhookEntity } = args;

  const webhookEntityWithoutRelations = pickScalarPropertiesFromEntity({
    metadataName: 'webhook',
    entity: webhookEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'webhook',
      ...args,
    });

  return {
    ...webhookEntityWithoutRelations,
    createdAt: webhookEntity.createdAt.toISOString(),
    updatedAt: webhookEntity.updatedAt.toISOString(),
    deletedAt: webhookEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: webhookEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
