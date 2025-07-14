import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { LeadDistributionService } from 'src/modules/lead-distribution/lead-distribution.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GmailService {
  private oauth2Client;

  constructor(
    @InjectRepository(PersonWorkspaceEntity)
    private readonly personRepository: Repository<PersonWorkspaceEntity>,
    private readonly leadDistributionService: LeadDistributionService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI,
    );
  }

  async getAuthUrl(): Promise<string> {
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async handleOAuth2Callback(code: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    // In a real application, you would save the tokens to the database
    // so you can use them to access the user's Gmail account in the future.
  }

  async fetchNewLeads(): Promise<void> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread label:YourLeadLabel', // Customize this query to match your needs
    });

    const messages = res.data.messages;
    if (messages) {
      for (const message of messages) {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });

        const fromHeader = msg.data.payload.headers.find((h) => h.name === 'From');
        const subjectHeader = msg.data.payload.headers.find((h) => h.name === 'Subject');

        const email = this.parseEmail(fromHeader.value);
        const name = this.parseName(fromHeader.value);
        const listing = this.parseListing(subjectHeader.value);

        const newLead = new PersonWorkspaceEntity();
        newLead.name = { firstName: name, lastName: '' };
        newLead.emails = { primaryEmail: email, additionalEmails: [] };
        // In a real application, you would link the lead to the listing
        // newLead.listing = listing;

        const savedLead = await this.personRepository.save(newLead);
        await this.leadDistributionService.distributeLead(savedLead);

        await gmail.users.messages.modify({
          userId: 'me',
          id: message.id,
          requestBody: {
            removeLabelIds: ['UNREAD'],
          },
        });
      }
    }
  }

  private parseEmail(fromHeader: string): string {
    const match = fromHeader.match(/<(.*)>/);
    return match ? match[1] : fromHeader;
  }

  private parseName(fromHeader: string): string {
    const match = fromHeader.match(/(.*)</);
    return match ? match[1].trim() : '';
  }

  private parseListing(subject: string): string {
    // This is a placeholder. You'll need to customize this to parse the listing from the subject.
    return subject;
  }
}
