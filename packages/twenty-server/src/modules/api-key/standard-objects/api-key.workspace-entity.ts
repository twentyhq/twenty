import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { API_KEY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.apiKey,
  namePlural: 'apiKeys',
  labelSingular: msg`API Key`,
  labelPlural: msg`API Keys`,
  description: msg`An API key`,
  icon: STANDARD_OBJECT_ICONS.apiKey,
  labelIdentifierStandardId: API_KEY_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
@WorkspaceGate({
  featureFlag: 'IS_WORKSPACE_API_KEY_WEBHOOK_GRAPHQL_ENABLED',
  excludeFromDatabase: false,
  excludeFromWorkspaceApi: true,
})
export class ApiKeyWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: API_KEY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`ApiKey name`,
    icon: 'IconLink',
  })
  name: string;

  @WorkspaceField({
    standardId: API_KEY_STANDARD_FIELD_IDS.expiresAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Expiration date`,
    description: msg`ApiKey expiration date`,
    icon: 'IconCalendar',
  })
  expiresAt: Date;

  @WorkspaceField({
    standardId: API_KEY_STANDARD_FIELD_IDS.revokedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Revocation date`,
    description: msg`ApiKey revocation date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  revokedAt?: Date | null;
}
