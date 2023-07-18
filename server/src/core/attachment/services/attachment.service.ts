import { Injectable } from '@nestjs/common';
import { AttachmentType } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AttachmentService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.attachment.findFirst;
  findFirstOrThrow = this.prismaService.attachment.findFirstOrThrow;

  findUnique = this.prismaService.attachment.findUnique;
  findUniqueOrThrow = this.prismaService.attachment.findUniqueOrThrow;

  findMany = this.prismaService.attachment.findMany;

  // Create
  create = this.prismaService.attachment.create;
  createMany = this.prismaService.attachment.createMany;

  // Update
  update = this.prismaService.attachment.update;
  upsert = this.prismaService.attachment.upsert;
  updateMany = this.prismaService.attachment.updateMany;

  // Delete
  delete = this.prismaService.attachment.delete;
  deleteMany = this.prismaService.attachment.deleteMany;

  // Aggregate
  aggregate = this.prismaService.attachment.aggregate;

  // Count
  count = this.prismaService.attachment.count;

  // GroupBy
  groupBy = this.prismaService.attachment.groupBy;

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
