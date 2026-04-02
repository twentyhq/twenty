#!/bin/bash
# Audit duplicate leads in the CRM
# Outputs a CSV of potential duplicate groups with match details
#
# Usage: bash scripts/audit-duplicate-leads.sh > duplicate-leads-audit.csv

set -euo pipefail

DB_PASSWORD=$(kubectl get secret twenty-rds-credentials -n twentycrm -o jsonpath='{.data.password}' | base64 --decode)
WS="workspace_oyoiha4z71ppw867jthfb36d"
DB_HOST="twenty-crm-db.cluster-cgx4wwy00vhj.us-east-1.rds.amazonaws.com"

kubectl exec deployment/my-twenty-twenty-server -n twentycrm -- sh -c "PGPASSWORD='$DB_PASSWORD' psql -h $DB_HOST -U twenty_app_user -d twenty --csv -c \"
WITH lead_data AS (
  SELECT
    p.id,
    p.\\\"nameFirstName\\\" AS first_name,
    p.\\\"nameLastName\\\" AS last_name,
    p.\\\"emailsPrimaryEmail\\\" AS email,
    p.\\\"phonesPrimaryPhoneNumber\\\" AS phone,
    p.\\\"addressCustomAddressCity\\\" AS city,
    p.\\\"addressCustomAddressState\\\" AS state,
    p.\\\"addressCustomAddressStreet1\\\" AS street,
    p.\\\"addressCustomAddressPostcode\\\" AS zip,
    p.\\\"createdAt\\\",
    p.\\\"updatedAt\\\",
    -- Count linked policies
    (SELECT COUNT(*) FROM ${WS}._policy pol
     WHERE pol.\\\"leadId\\\" = p.id AND pol.\\\"deletedAt\\\" IS NULL) AS policy_count
  FROM ${WS}.person p
  WHERE p.\\\"deletedAt\\\" IS NULL
    AND p.\\\"nameFirstName\\\" IS NOT NULL
    AND p.\\\"nameFirstName\\\" != ''
),
-- Exact name matches
exact_name_dupes AS (
  SELECT
    LOWER(first_name) AS fn_key,
    LOWER(last_name) AS ln_key,
    COUNT(*) AS group_size
  FROM lead_data
  GROUP BY LOWER(first_name), LOWER(last_name)
  HAVING COUNT(*) > 1
),
-- Fuzzy name matches (first 3 chars of first name + exact last name)
fuzzy_name_dupes AS (
  SELECT
    LEFT(LOWER(first_name), 3) AS fn_prefix,
    LOWER(last_name) AS ln_key,
    COUNT(*) AS group_size
  FROM lead_data
  WHERE LENGTH(first_name) >= 3
  GROUP BY LEFT(LOWER(first_name), 3), LOWER(last_name)
  HAVING COUNT(*) > 1
),
-- Same email duplicates
email_dupes AS (
  SELECT
    LOWER(email) AS email_key,
    COUNT(*) AS group_size
  FROM lead_data
  WHERE email IS NOT NULL AND email != ''
  GROUP BY LOWER(email)
  HAVING COUNT(*) > 1
),
-- Classify each lead into a duplicate group
classified AS (
  SELECT
    ld.*,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM exact_name_dupes e
        WHERE LOWER(ld.first_name) = e.fn_key AND LOWER(ld.last_name) = e.ln_key
      ) AND EXISTS (
        SELECT 1 FROM email_dupes em WHERE LOWER(ld.email) = em.email_key
      ) THEN 'EXACT_NAME_AND_EMAIL'
      WHEN EXISTS (
        SELECT 1 FROM exact_name_dupes e
        WHERE LOWER(ld.first_name) = e.fn_key AND LOWER(ld.last_name) = e.ln_key
      ) THEN 'EXACT_NAME'
      WHEN EXISTS (
        SELECT 1 FROM email_dupes em WHERE LOWER(ld.email) = em.email_key
      ) THEN 'SAME_EMAIL'
      WHEN EXISTS (
        SELECT 1 FROM fuzzy_name_dupes f
        WHERE LEFT(LOWER(ld.first_name), 3) = f.fn_prefix
          AND LOWER(ld.last_name) = f.ln_key
          AND f.group_size > 1
      ) THEN 'FUZZY_NAME'
      ELSE NULL
    END AS match_type,
    -- Create a group key for sorting duplicates together
    COALESCE(
      LOWER(ld.last_name) || '|' || LOWER(ld.first_name),
      ld.id::text
    ) AS group_key
  FROM lead_data ld
)
SELECT
  match_type AS \\\"Match Type\\\",
  id AS \\\"Lead ID\\\",
  first_name AS \\\"First Name\\\",
  last_name AS \\\"Last Name\\\",
  email AS \\\"Email\\\",
  phone AS \\\"Phone\\\",
  street AS \\\"Street\\\",
  city AS \\\"City\\\",
  state AS \\\"State\\\",
  zip AS \\\"Zip\\\",
  policy_count AS \\\"Linked Policies\\\",
  \\\"createdAt\\\" AS \\\"Created\\\",
  \\\"updatedAt\\\" AS \\\"Updated\\\"
FROM classified
WHERE match_type IS NOT NULL
ORDER BY
  CASE match_type
    WHEN 'EXACT_NAME_AND_EMAIL' THEN 1
    WHEN 'SAME_EMAIL' THEN 2
    WHEN 'EXACT_NAME' THEN 3
    WHEN 'FUZZY_NAME' THEN 4
  END,
  group_key,
  policy_count DESC,
  \\\"createdAt\\\" ASC;
\""
