import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { DASHBOARD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.dashboard,
  namePlural: 'dashboards',
  labelSingular: msg`Dashboard`,
  labelPlural: msg`Dashboards`,
  description: msg`A dashboard`,
  icon: STANDARD_OBJECT_ICONS.dashboard,
  labelIdentifierStandardId: DASHBOARD_STANDARD_FIELD_IDS.title,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
})
export class DashboardWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: DASHBOARD_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: msg`Title`,
    description: msg`Dashboard title`,
    icon: 'IconNotes',
  })
  title: string;

  @WorkspaceField({
    standardId: DASHBOARD_STANDARD_FIELD_IDS.pageLayoutId,
    type: FieldMetadataType.UUID,
    label: msg`Page Layout ID`,
    description: msg`Dashboard page layout`,
    icon: 'IconLayout',
  })
  pageLayoutId: string;
}
