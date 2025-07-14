import { Controller, Get, Post, Body } from '@nestjs/common';
import { DocumentLibraryService } from './document-library.service';
import { DocumentWorkspaceEntity } from './document.workspace-entity';

@Controller('document-library')
export class DocumentLibraryController {
  constructor(private readonly documentLibraryService: DocumentLibraryService) {}

  @Get()
  async getDocuments() {
    return this.documentLibraryService.getDocuments();
  }

  @Post()
  async createDocument(@Body() doc: Partial<DocumentWorkspaceEntity>) {
    return this.documentLibraryService.createDocument(doc);
  }
}
