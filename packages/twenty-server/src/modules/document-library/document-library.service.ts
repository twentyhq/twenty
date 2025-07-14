import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentWorkspaceEntity } from './document.workspace-entity';

@Injectable()
export class DocumentLibraryService {
  constructor(
    @InjectRepository(DocumentWorkspaceEntity)
    private readonly documentRepository: Repository<DocumentWorkspaceEntity>,
  ) {}

  async createDocument(doc: Partial<DocumentWorkspaceEntity>): Promise<DocumentWorkspaceEntity> {
    const newDoc = this.documentRepository.create(doc);
    return this.documentRepository.save(newDoc);
  }

  async getDocuments(): Promise<DocumentWorkspaceEntity[]> {
    return this.documentRepository.find();
  }
}
