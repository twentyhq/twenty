import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { AttachmentLimitValidatorService } from 'src/engine/metadata-modules/field-metadata/validators/attachment-limit-validator.service';
import { ImageMimeValidatorService } from 'src/engine/metadata-modules/field-metadata/validators/image-mime-validator.service';
import { PdfMimeValidatorService } from 'src/engine/metadata-modules/field-metadata/validators/pdf-mime-validator.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@Injectable()
export class CompositeFieldValidatorService {
  constructor(
    private readonly imageMimeValidator: ImageMimeValidatorService,
    private readonly pdfMimeValidator: PdfMimeValidatorService,
    private readonly attachmentLimitValidator: AttachmentLimitValidatorService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  async validateImageField(
    attachmentIds: string[] | null | undefined,
    recordId: string,
    workspaceId: string,
    isRequired: boolean,
  ): Promise<void> {
    // Handle null/empty
    if (!attachmentIds || attachmentIds.length === 0) {
      if (isRequired) {
        throw new ValidationError(
          'Image field is required and must have at least one image attachment',
        );
      }

      return;
    }

    // Validate count
    this.attachmentLimitValidator.validate(attachmentIds);

    // Fetch attachments
    const attachmentRepository =
      await this.twentyORMManager.getRepository<AttachmentWorkspaceEntity>(
        'attachment',
      );

    const attachments = await attachmentRepository.findBy({
      id: In(attachmentIds),
    });

    // Validate all IDs exist
    if (attachments.length !== attachmentIds.length) {
      const foundIds = new Set(attachments.map((att) => att.id));
      const missingIds = attachmentIds.filter((id) => !foundIds.has(id));

      throw new ValidationError(
        `Attachment IDs not found: ${missingIds.join(', ')}`,
      );
    }

    // Validate file types
    attachments.forEach((attachment) => {
      // Check if it's an image based on type or file extension
      const isImage =
        attachment.type === 'Image' ||
        attachment.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

      if (!isImage) {
        throw new ValidationError(
          `Attachment "${attachment.name}" is not an image file. Only image files are allowed for image fields.`,
        );
      }
    });
  }

  async validatePdfField(
    attachmentIds: string[] | null | undefined,
    recordId: string,
    workspaceId: string,
    isRequired: boolean,
  ): Promise<void> {
    // Handle null/empty
    if (!attachmentIds || attachmentIds.length === 0) {
      if (isRequired) {
        throw new ValidationError(
          'PDF field is required and must have at least one PDF attachment',
        );
      }

      return;
    }

    // Validate count
    this.attachmentLimitValidator.validate(attachmentIds);

    // Fetch attachments
    const attachmentRepository =
      await this.twentyORMManager.getRepository<AttachmentWorkspaceEntity>(
        'attachment',
      );

    const attachments = await attachmentRepository.findBy({
      id: In(attachmentIds),
    });

    // Validate all IDs exist
    if (attachments.length !== attachmentIds.length) {
      const foundIds = new Set(attachments.map((att) => att.id));
      const missingIds = attachmentIds.filter((id) => !foundIds.has(id));

      throw new ValidationError(
        `Attachment IDs not found: ${missingIds.join(', ')}`,
      );
    }

    // Validate file types
    attachments.forEach((attachment) => {
      // Check if it's a PDF based on type or file extension
      const isPdf =
        attachment.type === 'TextDocument' || // PDFs often classified as TextDocument
        attachment.name.toLowerCase().endsWith('.pdf');

      if (!isPdf) {
        throw new ValidationError(
          `Attachment "${attachment.name}" is not a PDF file. Only PDF files are allowed for PDF fields.`,
        );
      }
    });
  }

  /**
   * Optional: Validate attachments belong to the record
   * Uncomment if strict ownership is required
   */
  // private validateAttachmentOwnership(
  //   attachments: AttachmentWorkspaceEntity[],
  //   recordId: string,
  // ): void {
  //   const invalidAttachments = attachments.filter((att) => {
  //     // Check if attachment is linked to the record via any relation field
  //     // This requires knowing the object type and checking the appropriate foreign key
  //     // For now, this is left as a placeholder for future enhancement
  //     return false;
  //   });
  //
  //   if (invalidAttachments.length > 0) {
  //     throw new ValidationError(
  //       `Some attachments do not belong to this record: ${invalidAttachments.map((a) => a.name).join(', ')}`,
  //     );
  //   }
  // }
}
