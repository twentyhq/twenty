import { Injectable } from '@nestjs/common';

import { AttachmentType } from '@prisma/client';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AttachmentService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.attachment.findFirst;
  findFirstOrThrow = this.prismaService.client.attachment.findFirstOrThrow;

  findUnique = this.prismaService.client.attachment.findUnique;
  findUniqueOrThrow = this.prismaService.client.attachment.findUniqueOrThrow;

  findMany = this.prismaService.client.attachment.findMany;

  // Create
  create = this.prismaService.client.attachment.create;
  createMany = this.prismaService.client.attachment.createMany;

  // Update
  update = this.prismaService.client.attachment.update;
  upsert = this.prismaService.client.attachment.upsert;
  updateMany = this.prismaService.client.attachment.updateMany;

  // Delete
  delete = this.prismaService.client.attachment.delete;
  deleteMany = this.prismaService.client.attachment.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.attachment.aggregate;

  // Count
  count = this.prismaService.client.attachment.count;

  // GroupBy
  groupBy = this.prismaService.client.attachment.groupBy;

  getFileTypeFromFileName(fileName: string): AttachmentType {
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
}
