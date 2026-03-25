import { z } from 'zod';

export const objectRecordSchema = z
  .record(z.string(), z.any())
  .describe(
    'Record data object. Use nested objects for relationships (e.g., "company": {"id": "{{reference}}"}). Common patterns:\n' +
      '- Person: {"name": {"firstName": "John", "lastName": "Doe"}, "emails": {"primaryEmail": "john@example.com"}, "company": {"id": "{{trigger.object.id}}"}}\n' +
      '- Company: {"name": "Acme Corp", "domainName": {"primaryLinkUrl": "https://acme.com"}}\n' +
      '- Task: {"title": "Follow up", "status": "TODO", "assignee": {"id": "{{user.id}}"}}',
  );
