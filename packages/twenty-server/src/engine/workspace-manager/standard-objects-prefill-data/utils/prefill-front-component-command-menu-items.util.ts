import { type EntityManager } from 'typeorm';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import {
  getSeedFrontComponentCommandMenuItemDefinitions,
  getSeedFrontComponentIds,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-front-component-definitions.util';

export const prefillFrontComponentCommandMenuItems = async (
  entityManager: EntityManager,
  workspaceId: string,
) => {
  const { helloWorldId } = getSeedFrontComponentIds(workspaceId);

  const frontComponentRow = await entityManager
    .createQueryBuilder()
    .select('fc.applicationId', 'applicationId')
    .from('core.frontComponent', 'fc')
    .where('fc.id = :id', { id: helloWorldId })
    .andWhere('fc.workspaceId = :workspaceId', { workspaceId })
    .getRawOne();

  if (!frontComponentRow) {
    return;
  }

  const definitions =
    getSeedFrontComponentCommandMenuItemDefinitions(workspaceId);

  await entityManager
    .createQueryBuilder()
    .insert()
    .into('core.commandMenuItem', [
      'workspaceId',
      'universalIdentifier',
      'applicationId',
      'workflowVersionId',
      'frontComponentId',
      'engineComponentKey',
      'label',
      'icon',
      'shortLabel',
      'position',
      'isPinned',
      'availabilityType',
      'conditionalAvailabilityExpression',
      'availabilityObjectMetadataId',
      'hotKeys',
    ])
    .values(
      definitions.map((definition) => ({
        workspaceId,
        universalIdentifier: definition.universalIdentifier,
        applicationId: frontComponentRow.applicationId,
        workflowVersionId: null,
        frontComponentId: definition.frontComponentId,
        engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
        label: definition.label,
        icon: definition.icon,
        shortLabel: definition.label,
        position: definition.position,
        isPinned: false,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        conditionalAvailabilityExpression: null,
        availabilityObjectMetadataId: null,
        hotKeys: null,
      })),
    )
    .orIgnore()
    .execute();
};
