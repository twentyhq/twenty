import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { BinderService } from './binder.service';
import { BinderWorkspaceEntity } from './binder.workspace-entity';
import { Response } from 'express';

@Controller('binders')
export class BinderController {
  constructor(private readonly binderService: BinderService) {}

  @Get()
  async getBinders() {
    return this.binderService.getBinders();
  }

  @Post()
  async createBinder(@Body() binder: Partial<BinderWorkspaceEntity>) {
    return this.binderService.createBinder(binder);
  }

  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.binderService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=binder.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
