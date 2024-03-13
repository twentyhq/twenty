import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { blocklistStandardFieldIds } from 'src/workspace/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/workspace/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

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
