import { registerEnumType } from '@nestjs/graphql';

export enum FileFolder {
  ProfilePicture = 'profilePicture',
}

registerEnumType(FileFolder, {
  name: 'FileFolder',
});
