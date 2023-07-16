import { registerEnumType } from '@nestjs/graphql';

export enum FileFolder {
  ProfilePicture = 'profile-picture',
  WorkspaceLogo = 'workspace-logo',
  Attachments = 'attachments',
}

registerEnumType(FileFolder, {
  name: 'FileFolder',
});
