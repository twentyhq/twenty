import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BinderWorkspaceEntity } from './binder.workspace-entity';
import * as PDFDocument from 'pdfkit';
import { ListingWorkspaceEntity } from '../listing/standard-objects/listing.workspace-entity';
import { DocumentWorkspaceEntity } from '../document-library/document.workspace-entity';

@Injectable()
export class BinderService {
  constructor(
    @InjectRepository(BinderWorkspaceEntity)
    private readonly binderRepository: Repository<BinderWorkspaceEntity>,
  ) {}

  async createBinder(binder: Partial<BinderWorkspaceEntity>): Promise<BinderWorkspaceEntity> {
    const newBinder = this.binderRepository.create(binder);
    return this.binderRepository.save(newBinder);
  }

  async getBinders(): Promise<BinderWorkspaceEntity[]> {
    return this.binderRepository.find({ relations: ['client', 'listings', 'documents'] });
  }

  async generatePdf(binderId: string): Promise<Buffer> {
    const binder = await this.binderRepository.findOne({
      where: { id: binderId },
      relations: ['client', 'listings', 'documents'],
    });

    if (!binder) {
      throw new Error('Binder not found');
    }

    const pdfDoc = new PDFDocument();
    const buffers: Buffer[] = [];

    pdfDoc.on('data', buffers.push.bind(buffers));

    pdfDoc.fontSize(25).text(binder.name, { align: 'center' });
    pdfDoc.moveDown();
    pdfDoc.fontSize(16).text(`Client: ${binder.client.name.firstName} ${binder.client.name.lastName}`);
    pdfDoc.moveDown();

    if (binder.listings && binder.listings.length > 0) {
      pdfDoc.fontSize(20).text('Listings');
      pdfDoc.moveDown();
      for (const listing of binder.listings) {
        pdfDoc.fontSize(14).text(`- ${listing.name}`);
        pdfDoc.moveDown(0.5);
      }
    }

    if (binder.documents && binder.documents.length > 0) {
      pdfDoc.fontSize(20).text('Documents');
      pdfDoc.moveDown();
      for (const doc of binder.documents) {
        pdfDoc.fontSize(14).text(`- ${doc.name}`);
        pdfDoc.moveDown(0.5);
      }
    }

    return new Promise((resolve) => {
      pdfDoc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      pdfDoc.end();
    });
  }
}
