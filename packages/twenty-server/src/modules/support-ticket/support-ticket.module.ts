import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicketEntity, SLAPolicyEntity, TicketCommentEntity } from './support-ticket.entity';
import { SupportTicketService } from './support-ticket.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicketEntity, SLAPolicyEntity, TicketCommentEntity]),
  ],
  providers: [SupportTicketService],
  exports: [SupportTicketService],
})
export class SupportTicketModule {}
