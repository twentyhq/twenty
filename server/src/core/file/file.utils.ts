import { kebabCase } from 'src/utils/kebab-case';
import { FileFolder } from './interfaces/file-folder.interface';
import { KebabCase } from 'type-fest';
import { BadRequestException } from '@nestjs/common';
import { basename } from 'path';
import { settings } from 'src/constants/settings';
import { AttachmentType } from '@prisma/client';

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

export function getAttachmentTypeFromFileName(
  fileName: string,
): AttachmentType {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'mp4':
    case 'avi':
    case 'mov':
      return AttachmentType.Video;

    case 'mp3':
    case 'wav':
    case 'ogg':
      return AttachmentType.Audio;

    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return AttachmentType.Image;

    case 'txt':
    case 'doc':
    case 'docx':
    case 'pdf':
      return AttachmentType.TextDocument;

    case 'xls':
    case 'xlsx':
    case 'csv':
      return AttachmentType.Spreadsheet;

    case 'zip':
    case 'rar':
    case 'tar':
    case '7z':
      return AttachmentType.Archive;

    default:
      return AttachmentType.Other;
  }
}
