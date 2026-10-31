import {
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RecordPermissionsDTO } from 'src/engine/permissions/record-permissions/dtos/record-permissions.dto';

registerEnumType(RecordShareAccessLevel, { name: 'RecordShareAccessLevel' });
registerEnumType(RecordSharePrincipalType, {
  name: 'RecordSharePrincipalType',
});
registerEnumType(RecordShareRowCause, { name: 'RecordShareRowCause' });

@InputType()
export class RecordSharePrincipalInput {
  @Field(() => UUIDScalarType, { nullable: true })
  workspaceMemberId?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;
}

@ObjectType()
export class RecordSharingGrantDTO {
  @Field(() => ID)
  id: string;

  @Field(() => RecordSharePrincipalType)
  principalType: RecordSharePrincipalType;

  @Field(() => UUIDScalarType)
  principalId: string;

  // The role of a member grant, to tell what that grant adds to the role
  @Field(() => UUIDScalarType, { nullable: true })
  principalRoleId: string | null;

  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;

  @Field(() => RecordShareRowCause)
  rowCause: RecordShareRowCause;
}

@ObjectType()
export class RecordSharingRoleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  label: string;

  // Null when the permissions of the role are not known, never reported as
  // a role that cannot access the object
  @Field(() => Boolean, { nullable: true })
  canRead: boolean | null;

  @Field(() => Boolean, { nullable: true })
  canUpdate: boolean | null;
}

@ObjectType()
export class RecordSharingDTO {
  @Field(() => Boolean)
  isShareable: boolean;

  @Field(() => Boolean)
  isPrivate: boolean;

  @Field(() => Boolean)
  isAlwaysPrivate: boolean;

  @Field(() => Boolean)
  canManageSharing: boolean;

  @Field(() => RecordPermissionsDTO)
  permissions: RecordPermissionsDTO;

  @Field(() => Boolean)
  hasManagedGeneralAccess: boolean;

  @Field(() => [RecordSharingRoleDTO])
  roles: RecordSharingRoleDTO[];

  @Field(() => [RecordSharingGrantDTO])
  shares: RecordSharingGrantDTO[];
}
