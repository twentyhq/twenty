import { BadRequestException } from '@nestjs/common';

import { basename } from 'path';

import { KebabCase } from 'type-fest';

import { kebabCase } from 'src/utils/kebab-case';
import { settings } from 'src/constants/settings';

import { FileFolder } from './interfaces/file-folder.interface';

type AllowedFolders = KebabCase<keyof typeof FileFolder>;

export function checkFilePath(filePath: string): string {
  const allowedFolders = Object.values(FileFolder).map((value) =>
    kebabCase(value),
  );

  const sanitizedFilePath = filePath.replace(/\0/g, '');
  const [folder, size] = sanitizedFilePath.split('/');

  if (!allowedFolders.includes(folder as AllowedFolders)) {
    throw new BadRequestException(`Folder ${folder} is not allowed`);
  }

  if (size && !settings.storage.imageCropSizes[folder]?.includes(size)) {
    throw new BadRequestException(`Size ${size} is not allowed`);
  }

  return sanitizedFilePath;
}

export function checkFilename(filename: string) {
  const sanitizedFilename = basename(filename.replace(/\0/g, ''));

  if (
    !sanitizedFilename ||
    sanitizedFilename.includes('/') ||
    sanitizedFilename.includes('\\') ||
    !sanitizedFilename.includes('.')
  ) {
    throw new BadRequestException(`Filename is not allowed`);
  }

  return basename(sanitizedFilename);
}
