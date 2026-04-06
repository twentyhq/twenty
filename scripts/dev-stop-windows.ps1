param(
  [int[]]$Ports = @(3000, 3001)
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $repoRoot '.dev-logs'
$pidsFile = Join-Path $logsDir 'pids.json'

function Write-Step([string]$Message) {
  Write-Host "[twenty-dev] $Message" -ForegroundColor Cyan
}

function Write-Warn([string]$Message) {
  Write-Host "[twenty-dev] $Message" -ForegroundColor Yellow
}

function Get-ListeningProcessIds([int[]]$PortsToCheck) {
  $pattern = ($PortsToCheck | ForEach-Object { ":$_" }) -join '|'
  $lines = netstat -ano | Select-String $pattern | ForEach-Object { $_.ToString() }
  $processIds = @()

  foreach ($line in $lines) {
    if ($line -match 'LISTENING\s+(\d+)$') {
      $procId = [int]$matches[1]

      if ($procId -ne 0) {
        $processIds += $procId
      }
    }
  }

  return $processIds | Sort-Object -Unique
}

function Stop-ById([int]$ProcessId) {
  try {
    Stop-Process -Id $ProcessId -Force -ErrorAction Stop
    Write-Step "Stopped PID $ProcessId"
  } catch {
    Write-Warn "Could not stop PID ${ProcessId}: $($_.Exception.Message)"
  }
}

if (Test-Path $pidsFile) {
  try {
    $pidData = Get-Content $pidsFile -Raw | ConvertFrom-Json
    $knownPids = @($pidData.serverPid, $pidData.frontPid) | Where-Object { $_ -is [int] -and $_ -gt 0 } | Sort-Object -Unique

    if ($knownPids.Count -gt 0) {
      Write-Step "Stopping tracked PIDs: $($knownPids -join ', ')"
      foreach ($knownPid in $knownPids) {
        Stop-ById -ProcessId $knownPid
      }
    }
  } catch {
    Write-Warn "Could not parse ${pidsFile}: $($_.Exception.Message)"
  }
}

$portProcessIds = Get-ListeningProcessIds -PortsToCheck $Ports

if (-not $portProcessIds -or $portProcessIds.Count -eq 0) {
  Write-Step "No listeners found on ports $($Ports -join ', ')."
} else {
  Write-Step "Stopping listeners on ports $($Ports -join ', '): $($portProcessIds -join ', ')"
  foreach ($portProcessId in $portProcessIds) {
    Stop-ById -ProcessId $portProcessId
  }
}

if (Test-Path $pidsFile) {
  Remove-Item $pidsFile -Force
}

Write-Step 'Stop command completed.'
