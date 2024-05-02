import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ATTACHMENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceObject } from 'src/engine/twenty-orm/decorators/workspace-object.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseObjectMetadata } from 'src/engine/twenty-orm/workspace-object-tests/base.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/engine/twenty-orm/workspace-object-tests/workspace-member.object-metadata';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';

@WorkspaceObject({
  standardId: STANDARD_OBJECT_IDS.attachment,
  namePlural: 'attachments',
  labelSingular: 'Attachment',
  labelPlural: 'Attachments',
  description: 'An attachment',
  icon: 'IconFileImport',
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class AttachmentObjectMetadata extends BaseObjectMetadata {
  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Attachment name',
    icon: 'IconFileUpload',
  })
  name: string;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.fullPath,
    type: FieldMetadataType.TEXT,
    label: 'Full path',
    description: 'Attachment full path',
    icon: 'IconLink',
  })
  fullPath: string;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'Attachment type',
    icon: 'IconList',
  })
  type: string;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.author,
    label: 'Author',
    type: RelationMetadataType.MANY_TO_ONE,
    inverseSideTarget: () => WorkspaceMemberObjectMetadata,
    inverseSideFieldKey: 'authoredAttachments',
  })
  author: Relation<WorkspaceMemberObjectMetadata>;
}
