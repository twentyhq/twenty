import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { WHATSAPP_INTEGRATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.integrations,

  namePlural: 'whatsapps',
  labelSingular: msg`Whatsapp integration`,
  labelPlural: msg`Whatsapp integrations`,
  description: msg`Whatsapp integration`,
  icon: STANDARD_OBJECT_ICONS.integrations,
  labelIdentifierStandardId:
    WHATSAPP_INTEGRATION_STANDARD_FIELD_IDS.businessAccountId, // TODO: check if it's correct
})
@WorkspaceIsSystem()
export class WhatsappWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WHATSAPP_INTEGRATION_STANDARD_FIELD_IDS.businessAccountId,
    type: FieldMetadataType.TEXT,
    label: msg`Business account ID`,
    description: msg`Business account ID`,
    icon: 'IconId',
  })
  @WorkspaceIsUnique()
  @WorkspaceIsFieldUIReadOnly()
  businessAccountId: string;

  @WorkspaceField({
    standardId: WHATSAPP_INTEGRATION_STANDARD_FIELD_IDS.businessDisplayName,
    type: FieldMetadataType.TEXT,
    label: msg`Business display name`,
    description: msg`Business display name`,
    icon: 'IconLabel',
  })
  @WorkspaceIsFieldUIReadOnly()
  businessDisplayName: string;

  @WorkspaceField({
    standardId: WHATSAPP_INTEGRATION_STANDARD_FIELD_IDS.businessPhoneNumbers,
    type: FieldMetadataType.ARRAY,
    label: msg`Business phone numbers`,
    description: msg`Business phone numbers`,
    icon: 'IconPhone',
  })
  @WorkspaceIsFieldUIReadOnly()
  businessPhoneNumbers: string[];

  @WorkspaceField({
    standardId: WHATSAPP_INTEGRATION_STANDARD_FIELD_IDS.bearerToken,
    type: FieldMetadataType.TEXT,
    label: msg`Bearer token`,
    description: msg`Bearer token`,
    icon: 'IconBearer',
  })
  @WorkspaceIsFieldUIReadOnly()
  bearerToken: string;

  @WorkspaceField({
    standardId: WHATSAPP_INTEGRATION_STANDARD_FIELD_IDS.appSecret,
    type: FieldMetadataType.TEXT,
    label: msg`App secret token`,
    description: msg`App secret token`,
    icon: 'IconLockPassword',
  })
  @WorkspaceIsFieldUIReadOnly()
  appSecret: string;
}
