import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  namePlural: 'users',
  labelSingular: 'User',
  labelPlural: 'Users',
  description: 'A User',
  dataSourceSchema: 'core',
})
@IsSystem()
export class UserObjectMetadata extends BaseObjectMetadata {
  // @FieldMetadata({
  //   type: FieldMetadataType.TEXT,
  //   label: 'First Name',
  //   description: 'The first name of the user',
  //   defaultValue: { value: '' },
  // })
  // firstName: string;
  // @FieldMetadata({
  //   type: FieldMetadataType.TEXT,
  //   label: 'Last Name',
  //   description: 'The last name of the user',
  //   defaultValue: { value: '' },
  // })
  // lastName: string;
  // @FieldMetadata({
  //   type: FieldMetadataType.TEXT,
  //   label: 'Email',
  //   description: 'The email of the user',
  // })
  // email: string;
  // @FieldMetadata({
  //   type: FieldMetadataType.BOOLEAN,
  //   label: 'Email Verified',
  //   description: 'If the email of the user is verified',
  // })
  // emailVerified: boolean;
  // @FieldMetadata({
  //   type: FieldMetadataType.BOOLEAN,
  //   label: 'Disabled',
  //   description: 'If the user is disabled',
  // })
  // disabled: boolean;
  // @FieldMetadata({
  //   type: FieldMetadataType.BOOLEAN,
  //   label: 'Can Impersonate',
  //   description: 'If the user can impersonate other users',
  //   defaultValue: { value: false },
  // })
  // canImpersonate: boolean;
  // @FieldMetadata({
  //   type: FieldMetadataType.TEXT,
  //   label: 'Password',
  //   description: 'The password of the user',
  // })
  // @IsNullable()
  // deletedAt: Date;
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Related workspace member',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_ONE,
    objectName: 'workspaceMember',
  })
  workspaceMember: WorkspaceMemberObjectMetadata;
}
