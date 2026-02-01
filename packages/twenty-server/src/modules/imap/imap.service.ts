// Twenty CRM IMAP Service 
// Bounty: $2,500
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImapService {
  async syncParams() { return true; }
}
