# Support Ticket (Helpdesk)

Customer support ticket management with multi-channel intake (email/WhatsApp/chat/phone/form), priority-based SLA, assignment, escalation, and resolution tracking.

## Entities
- `SupportTicketEntity` — subject, description, status (open/in_progress/waiting_customer/escalated/resolved/closed), priority (low/medium/high/urgent), channel (email/whatsapp/chat/phone/form), category (bug/question/complaint/billing/feature_request), accountId, assigneeId, SLA fields

## Service Methods
- `SupportTicketService` — creates tickets from multiple channels, assigns to agents, tracks SLA compliance, escalates overdue tickets, resolves/closes with resolution data

## Feature Flag
`IS_MODULE_SUPPORT_TICKET_ENABLED`

## Dependencies
- None
