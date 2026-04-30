<#
.SYNOPSIS
  Voicenotes webhook health check for Twenty CRM (UAT by default).

.DESCRIPTION
  Run after a week or so of real Voicenotes use to sanity-check inbound
  webhook ingestion before broadening rollout. Reports:
    - Recent log activity for the voicenotes-webhook handler (errors flagged)
    - Daily ingestion volume (last 14 days)
    - Anomalies: salesNotes with no owner, with no attendee linkage
    - Retry storms: duplicate voicenotesIds (shouldn't happen — our upsert
      is keyed on voicenotesId)
    - Total ingestion summary

  Requires the Railway CLI to be authenticated locally and project context
  set (the same token your terminal uses for `railway` commands generally).

.PARAMETER Environment
  Railway environment to inspect. Defaults to 'uat'. Use 'production' for prod.

.PARAMETER LogLines
  Approximate number of recent Railway log lines to scan. Defaults to 500.

.PARAMETER LogTimeoutSec
  Seconds to wait for `railway logs` to dump output before killing it.
  Defaults to 20. Increase if your machine is slow or the log volume is huge.

.EXAMPLE
  .\voicenotes-health-check.ps1
  .\voicenotes-health-check.ps1 -Environment production -LogLines 1000
#>

param(
  [string]$Environment = 'uat',
  [int]$LogLines = 500,
  [int]$LogTimeoutSec = 20
)

$ErrorActionPreference = 'Stop'

# Workspace schema for the Stratum Twenty instance. Same value for UAT and
# prod (Twenty schema names are workspace-id derived, not env-derived).
# To re-derive if anything ever changes:
#   railway ssh --service twenty --environment <env> -- `
#     'psql "$PG_DATABASE_URL" -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE ''workspace_%'';"'
$workspaceSchema = 'workspace_88pd7l5mqn69yo7kctctadczq'

function Section($title) {
  Write-Host ""
  Write-Host "=== $title ===" -ForegroundColor Cyan
}

# Run a SQL query on the Twenty Postgres via railway ssh. The remote shell
# expands $PG_DATABASE_URL itself, so we pass the whole thing as ONE argument
# and let bash on the other end interpret. -A -t = unaligned, no header.
function Invoke-TwentySql([string]$sql) {
  # Escape any embedded double quotes for the inner -c "..." (rare in our
  # queries but safe to handle).
  $escaped = $sql -replace '"', '\"'
  $remoteCmd = "psql `"`$PG_DATABASE_URL`" -A -F`" | `" -c `"$escaped`""
  & railway ssh --service twenty --environment $Environment -- $remoteCmd
}

# ============================================================================
# 1) Log scan
# ============================================================================
Section "Railway log scan ($Environment) — last $LogLines lines"

# `railway logs` follows by default; run it as a background job and kill after
# a short timeout to capture a recent snapshot.
$logJob = Start-Job -ScriptBlock {
  param($svc, $env)
  & railway logs --service $svc --environment $env 2>&1
} -ArgumentList 'twenty', $Environment

if (Wait-Job $logJob -Timeout $LogTimeoutSec) {
  $allLogs = Receive-Job $logJob
} else {
  Stop-Job $logJob -ErrorAction SilentlyContinue
  $allLogs = Receive-Job $logJob
}
Remove-Job $logJob -Force -ErrorAction SilentlyContinue

$recentLogs = $allLogs | Select-Object -Last $LogLines
$voicenoteLines = $recentLogs | Select-String -Pattern 'voicenotes-webhook' -SimpleMatch

if (-not $voicenoteLines -or $voicenoteLines.Count -eq 0) {
  Write-Host "No voicenotes-webhook log lines in the captured window." -ForegroundColor Yellow
  Write-Host "Either nothing has been ingested recently, or the timeout was too short." -ForegroundColor Yellow
} else {
  Write-Host "Captured $($voicenoteLines.Count) voicenotes-webhook lines."
  $errLines = $voicenoteLines | Select-String -Pattern '(error|fail|throw|exception|unhandled)' -CaseSensitive:$false
  if ($errLines -and $errLines.Count -gt 0) {
    Write-Host "  $($errLines.Count) of them look like errors:" -ForegroundColor Red
    $errLines | ForEach-Object { Write-Host "    $($_.Line.Trim())" -ForegroundColor Red }
  } else {
    Write-Host "  No error/fail/throw/exception mentions." -ForegroundColor Green
  }
  Write-Host ""
  Write-Host "  Last 5 voicenotes-webhook lines:"
  $voicenoteLines | Select-Object -Last 5 | ForEach-Object {
    Write-Host "    $($_.Line.Trim())" -ForegroundColor DarkGray
  }
}

# ============================================================================
# 2) Volume — group by day, last 14 days
# ============================================================================
Section "Daily ingestion volume — last 14 days (UTC)"
Invoke-TwentySql @"
SELECT date_trunc('day', \"createdAt\")::date AS day, COUNT(*) AS notes
FROM $workspaceSchema.\"_salesNote\"
WHERE \"voicenotesId\" IS NOT NULL
  AND \"deletedAt\" IS NULL
  AND \"createdAt\" > NOW() - INTERVAL '14 days'
GROUP BY 1 ORDER BY 1 DESC;
"@

# ============================================================================
# 3) Anomalies — owner null
# ============================================================================
Section "Anomaly: voicenote-ingested salesNotes with NULL owner"
Invoke-TwentySql @"
SELECT id, name, \"voicenotesId\", \"createdAt\"
FROM $workspaceSchema.\"_salesNote\"
WHERE \"voicenotesId\" IS NOT NULL AND \"ownerId\" IS NULL AND \"deletedAt\" IS NULL
ORDER BY \"createdAt\" DESC LIMIT 20;
"@

# ============================================================================
# 4) Anomalies — no attendee linkage
# ============================================================================
Section "Anomaly: voicenote-ingested salesNotes with no attendee linked"
Invoke-TwentySql @"
SELECT sn.id, sn.name, sn.\"voicenotesId\", sn.\"createdAt\"
FROM $workspaceSchema.\"_salesNote\" sn
LEFT JOIN $workspaceSchema.\"_salesNoteAttendee\" a
  ON a.\"salesNoteId\" = sn.id AND a.\"deletedAt\" IS NULL
WHERE sn.\"voicenotesId\" IS NOT NULL AND sn.\"deletedAt\" IS NULL AND a.id IS NULL
ORDER BY sn.\"createdAt\" DESC LIMIT 20;
"@

# ============================================================================
# 5) Retry storms — same voicenotesId on multiple rows
# ============================================================================
Section "Retry storms: voicenotesIds appearing more than once"
Invoke-TwentySql @"
SELECT \"voicenotesId\", COUNT(*) AS hits
FROM $workspaceSchema.\"_salesNote\"
WHERE \"voicenotesId\" IS NOT NULL AND \"deletedAt\" IS NULL
GROUP BY 1 HAVING COUNT(*) > 1;
"@

# ============================================================================
# 6) Total summary
# ============================================================================
Section "Overall ingestion summary"
Invoke-TwentySql @"
SELECT COUNT(*) AS total_voicenote_salesnotes,
       MIN(\"createdAt\") AS first_seen,
       MAX(\"createdAt\") AS last_seen
FROM $workspaceSchema.\"_salesNote\"
WHERE \"voicenotesId\" IS NOT NULL AND \"deletedAt\" IS NULL;
"@

Write-Host ""
Write-Host "Done." -ForegroundColor Green
