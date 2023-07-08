import { registerEnumType } from '@nestjs/graphql';

export enum FileFolder {
  ProfilePicture = 'profile-picture',
  WorkspaceLogo = 'workspace-logo',
}

registerEnumType(FileFolder, {
  name: 'FileFolder',
});
