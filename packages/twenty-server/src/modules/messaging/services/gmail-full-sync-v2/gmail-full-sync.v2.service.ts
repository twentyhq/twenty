// import { Injectable, Logger } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';

// import { Repository } from 'typeorm';

// import {
//   FeatureFlagEntity,
//   FeatureFlagKeys,
// } from 'src/engine/modules/feature-flag/feature-flag.entity';
// import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
// import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
// import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
// import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
// import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
// import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
// import { GmailClientProvider } from 'src/modules/messaging/services/providers/gmail/gmail-client.provider';
// import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
// import { gmailSearchFilterExcludeEmails } from 'src/modules/messaging/utils/gmail-search-filter.util';
// import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
// import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
// import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';

// @Injectable()
// export class GmailFullSyncV2Service {
//   private readonly logger = new Logger(GmailFullSyncV2Service.name);

//   constructor(
//     private readonly gmailClientProvider: GmailClientProvider,
//     @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
//     private readonly connectedAccountRepository: ConnectedAccountRepository,
//     @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
//     private readonly messageChannelRepository: MessageChannelRepository,
//     @InjectObjectMetadataRepository(BlocklistObjectMetadata)
//     private readonly blocklistRepository: BlocklistRepository,
//     @InjectRepository(FeatureFlagEntity, 'core')
//     private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
//     @InjectCacheStorage(CacheStorageNamespace.Messaging)
//     private readonly cacheStorage: CacheStorageService,
//   ) {}

//   public async fetchConnectedAccountThreads(
//     workspaceId: string,
//     connectedAccountId: string,
//   ) {
//     const connectedAccount = await this.connectedAccountRepository.getById(
//       connectedAccountId,
//       workspaceId,
//     );

//     if (!connectedAccount) {
//       this.logger.error(
//         `Connected account ${connectedAccountId} not found in workspace ${workspaceId} during full-sync`,
//       );

//       return;
//     }

//     const refreshToken = connectedAccount.refreshToken;
//     const workspaceMemberId = connectedAccount.accountOwnerId;

//     if (!refreshToken) {
//       throw new Error(
//         `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId} during full-sync`,
//       );
//     }

//     const gmailMessageChannel =
//       await this.messageChannelRepository.getFirstByConnectedAccountId(
//         connectedAccountId,
//         workspaceId,
//       );

//     if (!gmailMessageChannel) {
//       this.logger.error(
//         `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId} during full-syn`,
//       );

//       return;
//     }

//     const gmailMessageChannelId = gmailMessageChannel.id;

//     const gmailClient =
//       await this.gmailClientProvider.getGmailClient(refreshToken);

//     const isBlocklistEnabledFeatureFlag =
//       await this.featureFlagRepository.findOneBy({
//         workspaceId,
//         key: FeatureFlagKeys.IsBlocklistEnabled,
//         value: true,
//       });

//     const isBlocklistEnabled =
//       isBlocklistEnabledFeatureFlag && isBlocklistEnabledFeatureFlag.value;

//     const blocklist = isBlocklistEnabled
//       ? await this.blocklistRepository.getByWorkspaceMemberId(
//           workspaceMemberId,
//           workspaceId,
//         )
//       : [];

//     const blocklistedEmails = blocklist.map((blocklist) => blocklist.handle);

//     const messages = await gmailClient.users.messages.list({
//       userId: 'me',
//       maxResults: 500,
//       pageToken: nextPageToken,
//       q: gmailSearchFilterExcludeEmails(blocklistedEmails),
//     });
//   }

//   public async fetchAllMessagesFromGmail(gmailClient, blocklistedEmails) {
//     const allMessages = [];
//     let pageToken = null;
//     let isMoreMessages = true;

//     while (isMoreMessages) {
//       const response = await gmailClient.users.messages.list({
//         userId: 'me',
//         maxResults: 500,
//         pageToken: pageToken, // Initially null, then updated with each loop iteration
//         q: gmailSearchFilterExcludeEmails(blocklistedEmails),
//       });

//       if (response.data.messages) {
//         allMessages.push(...response.data.messages);
//       }

//       pageToken = response.data.nextPageToken;
//       isMoreMessages = pageToken ? true : false;
//     }

//     return allMessages;
//   }
// }
