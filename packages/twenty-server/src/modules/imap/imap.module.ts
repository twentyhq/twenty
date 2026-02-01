
import { Module } from '@nestjs/common';
import { ImapService } from './imap.service';

@Module({
  providers: [ImapService],
  exports: [ImapService],
})
export class ImapModule {}
