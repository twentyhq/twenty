-- Old CRM Policy Sync Pipeline
-- Syncs today's new policies from the old CRM every 5 minutes
--
-- Run via: kubectl exec -it deploy/twenty-server -- psql "$DATABASE_URL" -f -

-- Replace this with your actual workspace ID
\set workspace_id '''YOUR_WORKSPACE_ID'''

-- Insert pipeline
INSERT INTO core."ingestionPipeline" (
  "name",
  "mode",
  "targetObjectNameSingular",
  "sourceUrl",
  "sourceHttpMethod",
  "sourceAuthConfig",
  "sourceRequestConfig",
  "responseRecordsPath",
  "schedule",
  "dedupFieldName",
  "paginationConfig",
  "isEnabled",
  "workspaceId"
) VALUES (
  'Old CRM Policy Sync',
  'pull',
  'policy',
  'https://omnia.geogrowth.com/api/orgadmin/lead-report-api',
  'GET',
  NULL,
  NULL,
  'response.data',
  '*/5 * * * *',
  'oldCrmPolicyId',
  '{"type": "page", "paramName": "page", "pageSize": 10, "maxPages": 20}',
  true,
  :workspace_id
)
RETURNING id AS pipeline_id;

-- Use the returned pipeline_id below, or run this to get it:
-- SELECT id FROM core."ingestionPipeline" WHERE name = 'Old CRM Policy Sync' AND "deletedAt" IS NULL;

-- Insert field mappings (replace PIPELINE_ID with actual value)
\set pipeline_id '''PIPELINE_ID'''

INSERT INTO core."ingestionFieldMapping" ("pipelineId", "sourceFieldPath", "targetFieldName", "targetCompositeSubField", "transform", "workspaceId") VALUES
  (:pipeline_id, 'policy_id',       'oldCrmPolicyId',  NULL,             NULL,            :workspace_id),
  (:pipeline_id, 'policy_number',   'policyNumber',    NULL,             'sanitizeNull',  :workspace_id),
  (:pipeline_id, '_displayName',    'name',            NULL,             NULL,            :workspace_id),
  (:pipeline_id, '_status',         'status',          NULL,             NULL,            :workspace_id),
  (:pipeline_id, '_effectiveDate',  'effectiveDate',   NULL,             NULL,            :workspace_id),
  (:pipeline_id, '_expirationDate', 'expirationDate',  NULL,             NULL,            :workspace_id),
  (:pipeline_id, '_premiumMicros',  'premium',         'amountMicros',   NULL,            :workspace_id),
  (:pipeline_id, '_usd',            'premium',         'currencyCode',   NULL,            :workspace_id),
  (:pipeline_id, '_personId',       'leadId',          NULL,             NULL,            :workspace_id),
  (:pipeline_id, '_carrierId',      'carrierId',       NULL,             NULL,            :workspace_id),
  (:pipeline_id, '_productId',      'productId',       NULL,             NULL,            :workspace_id),
  (:pipeline_id, '_agentId',        'agentId',         NULL,             NULL,            :workspace_id),
  (:pipeline_id, '_submittedDate',  'submittedDate',   NULL,             NULL,            :workspace_id),
  (:pipeline_id, '_leadSourceId',   'leadSourceId',    NULL,             NULL,            :workspace_id);
