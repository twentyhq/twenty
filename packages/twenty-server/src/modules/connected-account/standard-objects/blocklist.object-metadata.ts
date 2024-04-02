import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { blocklistStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.blocklist,
  namePlural: 'blocklists',
  labelSingular: 'Blocklist',
  labelPlural: 'Blocklists',
  description: 'Blocklist',
  icon: 'IconForbid2',
})
@IsSystem()
export class BlocklistObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: blocklistStandardFieldIds.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @FieldMetadata({
    standardId: blocklistStandardFieldIds.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'WorkspaceMember',
    description: 'WorkspaceMember',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  workspaceMember: WorkspaceMemberObjectMetadata;
}
