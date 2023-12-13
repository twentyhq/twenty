import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  ObjectMetadata,
  IsSystem,
  FieldMetadata,
  IsNullable,
  RelationMetadata,
  Gate,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  namePlural: 'connectedAccounts',
  labelSingular: 'Connected Account',
  labelPlural: 'Connected Accounts',
  description: 'A connected account',
  icon: 'IconAt',
})
@Gate({
  featureFlag: 'IS_MESSAGING_ENABLED',
})
@IsSystem()
export class ConnectedAccountObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'handle',
    description: 'The account handle (email, username, phone number, etc.)',
    icon: 'IconMail',
  })
  handle: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'provider',
    description: 'The account provider',
    icon: 'IconSettings',
  })
  provider: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Access Token',
    description: 'Messaging provider access token',
    icon: 'IconKey',
  })
  accessToken: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Refresh Token',
    description: 'Messaging provider refresh token',
    icon: 'IconKey',
  })
  refreshToken: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Account Owner',
    description: 'Account Owner',
    icon: 'IconUserCircle',
    joinColumn: 'accountOwnerId',
  })
  accountOwner: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Message Channel',
    description: 'Message Channel',
    icon: 'IconMessage',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'messageChannel',
  })
  @IsNullable()
  messageChannels: MessageChannelObjectMetadata[];
}
