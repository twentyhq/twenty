import { Module } from '@nestjs/common';
import { DocumentLibraryService } from './document-library.service';
import { DocumentLibraryController } from './document-library.controller';

@Module({
  providers: [DocumentLibraryService],
  controllers: [DocumentLibraryController],
  exports: [DocumentLibraryService],
})
export class DocumentLibraryModule {}
