type MktTemplateDataSeed = {
  id: string;
  name: string;
  type: MKT_TEMPLATE_TYPE;
  content: string;
  version: string;

  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

// prettier-ignore
export enum MKT_TEMPLATE_TYPE {
  EXECUTIVE_SUMMARY = 'executive_summary',
  KEY_METRICS = 'key_metrics',
  HIGHLIGHTS = 'highlights',
  CHALLENGES = 'challenges',
  NEXT_MONTH_PRIORITIES = 'next_month_priorities',
  MARKETING = 'marketing',
  SALES = 'sales',
  SUPPORT = 'support',
  EMAIL = 'email',
  INVOICE = 'invoice',
  CONTRACT = 'contract',
  TICKET = 'ticket',
  ORDER = 'order',
  SURVEY = 'survey',
  CHECKLIST = 'checklist',
  REPORT = 'report',
  CATALOG = 'catalog',
  NOTIFICATION = 'notification',
  QUOTE = 'quote',
}

// prettier-ignore
export const MKT_TEMPLATE_DATA_SEED_COLUMNS: (keyof MktTemplateDataSeed)[] = [
  'id',
  'name',
  'type',
  'content',
  'version',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

// prettier-ignore
export const MKT_TEMPLATE_DATA_SEEDS_IDS = {
  ID_1: 'b6158d8f-700c-4015-a56b-bf5b256a9c93',
  ID_2: 'c159a62f-451e-4d8d-a1ca-a4c3698f2b1e',
  ID_3: '87059b34-0d66-4274-a5c3-2e64058aab12',
  ID_4: '472b23f7-ed73-49c6-b3df-6484a397c695',
  ID_5: '9d6183bd-c1e9-4364-a99e-dbe069a59457',
  ID_6: '5d818b4f-05a7-4f46-9700-aa3d00b99262',
  ID_7: 'f5ac4b3d-229e-4c15-a499-742995ada9a8',
  ID_8: 'e4071f7c-4fd9-4d93-ab85-f8fee0dd922f',
  ID_9: '96455101-9e32-4fbc-9534-ed28d08cb229',
  ID_10: '34bb660e-75a2-4013-9ada-a7476f9483ae',
  ID_11: 'caf95c15-c617-4f6e-a48e-6b7739c4b629',
  ID_12: 'c535252e-62e5-4365-b24d-9fe07d9e705f',
  ID_13: 'c0d0fd12-d5d1-4f39-9de9-7c85b20612d9',
  ID_14: '4cb251e3-05b5-4622-a2dc-e721ba2d27df',
  ID_15: 'fdd4f417-934d-407e-8547-e66f5792cfbf',
};

// prettier-ignore
export const MKT_TEMPLATE_DATA_SEEDS: MktTemplateDataSeed[] = [
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_1,
    name: 'Welcome Email Template',
    type: MKT_TEMPLATE_TYPE.EMAIL,
    content: `Dear {{customer_name}},

Welcome to our platform! We're excited to have you on board.

Your account has been successfully created and you can now access all our features.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
{{company_name}} Team`,
    version: '1.0.0',
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Sarah Johnson',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_2,
    name: 'Invoice Template',
    type: MKT_TEMPLATE_TYPE.INVOICE,
    content: `INVOICE

Invoice Number: {{invoice_number}}
Date: {{invoice_date}}
Due Date: {{due_date}}

Customer: {{customer_name}}
Address: {{customer_address}}

Description:
{{item_description}}

Amount: {{amount}}
VAT: {{vat}}
Total: {{total_amount}}

Payment Terms: Net 30 days

Thank you for your business!`,
    version: '2.1.0',
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Michael Chen',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_3,
    name: 'License Agreement Template',
    type: MKT_TEMPLATE_TYPE.CONTRACT,
    content: `SOFTWARE LICENSE AGREEMENT

This Software License Agreement ("Agreement") is entered into between {{company_name}} ("Licensor") and {{customer_name}} ("Licensee").

1. LICENSE GRANT
Subject to the terms of this Agreement, Licensor grants Licensee a non-exclusive, non-transferable license to use the software.

2. TERM
This license is valid from {{start_date}} to {{end_date}}.

3. PAYMENT
Licensee agrees to pay the license fee of {{license_fee}}.

4. TERMINATION
This Agreement may be terminated by either party with 30 days written notice.

Signed by:
{{company_name}}: _________________
{{customer_name}}: _________________`,
    version: '1.5.0',
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'David Kim',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_4,
    name: 'Support Ticket Template',
    type: MKT_TEMPLATE_TYPE.TICKET,
    content: `SUPPORT TICKET

Ticket ID: {{ticket_id}}
Priority: {{priority}}
Category: {{category}}

Customer: {{customer_name}}
Email: {{customer_email}}

Issue Description:
{{issue_description}}

Steps to Reproduce:
{{steps_to_reproduce}}

Expected Behavior:
{{expected_behavior}}

Actual Behavior:
{{actual_behavior}}

Additional Information:
{{additional_info}}`,
    version: '1.2.0',
    position: 4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Lisa Wang',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_5,
    name: 'Order Confirmation Template',
    type: MKT_TEMPLATE_TYPE.ORDER,
    content: `ORDER CONFIRMATION

Order Number: {{order_number}}
Order Date: {{order_date}}

Customer Information:
Name: {{customer_name}}
Email: {{customer_email}}
Phone: {{customer_phone}}

Order Details:
{{order_items}}

Subtotal: {{subtotal}}
Tax: {{tax}}
Total: {{total}}

Shipping Address:
{{shipping_address}}

Estimated Delivery: {{estimated_delivery}}

Thank you for your order!`,
    version: '1.3.0',
    position: 5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jennifer Davis',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_6,
    name: 'Password Reset Template',
    type: MKT_TEMPLATE_TYPE.EMAIL,
    content: `Password Reset Request

Dear {{customer_name}},

We received a request to reset your password for your account.

Click the link below to reset your password:
{{reset_link}}

This link will expire in 24 hours.

If you didn't request this password reset, please ignore this email.

Best regards,
{{company_name}} Security Team`,
    version: '1.1.0',
    position: 6,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Robert Taylor',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_7,
    name: 'Service Agreement Template',
    type: MKT_TEMPLATE_TYPE.CONTRACT,
    content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is made between {{company_name}} ("Service Provider") and {{customer_name}} ("Client").

SERVICES
Service Provider will provide the following services:
{{service_description}}

TERM
This agreement begins on {{start_date}} and continues until {{end_date}}.

COMPENSATION
Client agrees to pay {{service_fee}} for the services provided.

TERMINATION
Either party may terminate this agreement with 30 days written notice.

Signed:
{{company_name}}: _________________
{{customer_name}}: _________________`,
    version: '2.0.0',
    position: 7,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jessica Brown',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_8,
    name: 'Product Catalog Template',
    type: MKT_TEMPLATE_TYPE.CATALOG,
    content: `PRODUCT CATALOG

{{company_name}} - {{catalog_date}}

{{#each products}}
Product: {{name}}
SKU: {{sku}}
Price: {{price}}
Description: {{description}}
Category: {{category}}
Availability: {{availability}}

{{/each}}

For more information, visit: {{website_url}}
Contact: {{contact_email}}`,
    version: '1.4.0',
    position: 8,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mark Wilson',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_9,
    name: 'Maintenance Notice Template',
    type: MKT_TEMPLATE_TYPE.NOTIFICATION,
    content: `MAINTENANCE NOTICE

Dear {{customer_name}},

We will be performing scheduled maintenance on {{maintenance_date}} from {{start_time}} to {{end_time}}.

During this time, the following services may be temporarily unavailable:
{{affected_services}}

We apologize for any inconvenience this may cause.

For urgent matters, please contact our emergency support line: {{emergency_contact}}

Thank you for your understanding.

{{company_name}} Operations Team`,
    version: '1.0.0',
    position: 9,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Christopher Martinez',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_10,
    name: 'Quote Request Template',
    type: MKT_TEMPLATE_TYPE.QUOTE,
    content: `QUOTE REQUEST

Request ID: {{request_id}}
Date: {{request_date}}

Customer Information:
Company: {{company_name}}
Contact: {{contact_name}}
Email: {{contact_email}}
Phone: {{contact_phone}}

Requirements:
{{requirements_description}}

Budget Range: {{budget_min}} - {{budget_max}}
Timeline: {{timeline}}

Additional Notes:
{{additional_notes}}

We will review your request and provide a detailed quote within 3 business days.

Thank you for considering our services.`,
    version: '1.2.0',
    position: 10,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Amanda Lopez',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_11,
    name: 'Feedback Survey Template',
    type: MKT_TEMPLATE_TYPE.SURVEY,
    content: `CUSTOMER FEEDBACK SURVEY

Dear {{customer_name}},

We value your feedback! Please take a moment to share your experience with our {{product_service}}.

Survey Link: {{survey_link}}

Your feedback helps us improve our services and better serve our customers.

As a thank you, you'll receive {{incentive}} for completing this survey.

Survey closes on: {{survey_deadline}}

Thank you for your time!

{{company_name}} Customer Success Team`,
    version: '1.1.0',
    position: 11,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Kevin Anderson',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_12,
    name: 'Renewal Reminder Template',
    type: MKT_TEMPLATE_TYPE.EMAIL,
    content: `Renewal Reminder

Dear {{customer_name}},

Your {{service_name}} subscription will expire on {{expiry_date}}.

To ensure uninterrupted service, please renew your subscription before the expiration date.

Current Plan: {{current_plan}}
Renewal Amount: {{renewal_amount}}

Renew Now: {{renewal_link}}

If you have any questions about your subscription, please contact our support team.

Thank you for your continued business!

{{company_name}} Billing Team`,
    version: '1.3.0',
    position: 12,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Michelle Garcia',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_13,
    name: 'Onboarding Checklist Template',
    type: MKT_TEMPLATE_TYPE.CHECKLIST,
    content: `ONBOARDING CHECKLIST

Customer: {{customer_name}}
Onboarding Date: {{onboarding_date}}

□ Account Setup
  □ User accounts created
  □ Access permissions configured
  □ Initial login completed

□ Training
  □ Product overview session
  □ Feature walkthrough
  □ Best practices shared

□ Configuration
  □ System configured
  □ Data imported
  □ Integrations set up

□ Documentation
  □ User guides provided
  □ Support contacts shared
  □ FAQ access granted

□ Follow-up
  □ 30-day check-in scheduled
  □ Success metrics defined
  □ Support plan established

Onboarding Manager: {{onboarding_manager}}`,
    version: '1.0.0',
    position: 13,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Daniel Thompson',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_14,
    name: 'Incident Report Template',
    type: MKT_TEMPLATE_TYPE.REPORT,
    content: `INCIDENT REPORT

Incident ID: {{incident_id}}
Report Date: {{report_date}}
Severity: {{severity}}

Incident Summary:
{{incident_summary}}

Affected Systems:
{{affected_systems}}

Impact Assessment:
{{impact_assessment}}

Root Cause:
{{root_cause}}

Resolution:
{{resolution}}

Prevention Measures:
{{prevention_measures}}

Reported by: {{reported_by}}
Resolved by: {{resolved_by}}
Resolution time: {{resolution_time}}`,
    version: '1.1.0',
    position: 14,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Rachel White',
  },
  {
    id: MKT_TEMPLATE_DATA_SEEDS_IDS.ID_15,
    name: 'Monthly Report Template',
    type: MKT_TEMPLATE_TYPE.REPORT,
    content: `MONTHLY REPORT

Period: {{report_period}}
Generated: {{generation_date}}

EXECUTIVE SUMMARY
{{executive_summary}}

KEY METRICS
- Revenue: {{revenue}}
- New Customers: {{new_customers}}
- Churn Rate: {{churn_rate}}%
- Customer Satisfaction: {{satisfaction_score}}

HIGHLIGHTS
{{highlights}}

CHALLENGES
{{challenges}}

NEXT MONTH PRIORITIES
{{next_month_priorities}}

Prepared by: {{prepared_by}}
Reviewed by: {{reviewed_by}}`,
    version: '2.0.0',
    position: 15,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Thomas Lee',
  },
];
