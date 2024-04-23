import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { BLOCKLIST_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.blocklist,
  namePlural: 'blocklists',
  labelSingular: 'Blocklist',
  labelPlural: 'Blocklists',
  description: 'Blocklist',
  icon: 'IconForbid2',
})
@IsSystem()
@IsNotAuditLogged()
export class BlocklistObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: BLOCKLIST_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @FieldMetadata({
    standardId: BLOCKLIST_STANDARD_FIELD_IDS.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'WorkspaceMember',
    description: 'WorkspaceMember',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  workspaceMember: Relation<WorkspaceMemberObjectMetadata>;
}
