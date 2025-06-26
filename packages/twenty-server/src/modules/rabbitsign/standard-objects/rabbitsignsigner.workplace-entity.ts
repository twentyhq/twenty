import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RABBIT_SIGN_SIGNER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { RabbitSignSignatureWorkspaceEntity } from './rabbitsignsignature.workplace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.rabbitSignSigner,
  namePlural: 'rabbitSignSigners',
  labelSingular: msg`RabbitSign Signer`,
  labelPlural: msg`RabbitSign Signers`,
  description: msg`A signer for a RabbitSign signature request`,
  icon: 'IconUser',
})
@WorkspaceIsSystem()
export class RabbitSignSignerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: RABBIT_SIGN_SIGNER_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.TEXT,
    label: msg`Status`,
    description: msg`The signing status of the signer (NOTIFIED, SIGNED, etc.)`,
    icon: 'IconCheckCircle',
  })
  status: string;

  @WorkspaceField({
    standardId: RABBIT_SIGN_SIGNER_STANDARD_FIELD_IDS.signingOrder,
    type: FieldMetadataType.NUMBER,
    label: msg`Signing Order`,
    description: msg`The order in which this signer should sign`,
    icon: 'IconListNumbered',
  })
  signingOrder: number;

  // Relations
  @WorkspaceRelation({
    standardId: RABBIT_SIGN_SIGNER_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`The person who is signing`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'rabbitSignSignatures',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  person: Relation<PersonWorkspaceEntity>;

  @WorkspaceJoinColumn('person')
  personId: string;

  @WorkspaceRelation({
    standardId: RABBIT_SIGN_SIGNER_STANDARD_FIELD_IDS.signature,
    type: RelationType.MANY_TO_ONE,
    label: msg`Signature`,
    description: msg`The signature request this signer belongs to`,
    icon: 'IconSignature',
    inverseSideTarget: () => RabbitSignSignatureWorkspaceEntity,
    inverseSideFieldKey: 'signers',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  signature: Relation<RabbitSignSignatureWorkspaceEntity>;

  @WorkspaceJoinColumn('signature')
  signatureId: string;
} 