param(
  [switch]$ResetDb,
  [switch]$SkipServiceChecks,
  [int]$StartupTimeoutSeconds = 120
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

function Write-Err([string]$Message) {
  Write-Host "[twenty-dev] $Message" -ForegroundColor Red
}

function Test-TcpPort(
  [string]$HostName,
  [int]$Port,
  [int]$TimeoutMs = 1000
) {
  $tcpClient = New-Object System.Net.Sockets.TcpClient

  try {
    $asyncResult = $tcpClient.BeginConnect($HostName, $Port, $null, $null)
    $connected = $asyncResult.AsyncWaitHandle.WaitOne($TimeoutMs, $false)

    if (-not $connected) {
      return $false
    }

    $tcpClient.EndConnect($asyncResult) | Out-Null
    return $true
  } catch {
    return $false
  } finally {
    $tcpClient.Close()
  }
}

function Get-ListeningProcessIds([int[]]$Ports) {
  $pattern = ($Ports | ForEach-Object { ":$_" }) -join '|'
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

function Stop-Ports([int[]]$Ports) {
  $processIds = Get-ListeningProcessIds -Ports $Ports

  if (-not $processIds -or $processIds.Count -eq 0) {
    Write-Step "No listeners on ports $($Ports -join ', ')."
    return
  }

  Write-Step "Stopping listeners on ports $($Ports -join ', '): $($processIds -join ', ')"

  foreach ($procId in $processIds) {
    try {
      Stop-Process -Id $procId -Force -ErrorAction Stop
      Write-Step "Stopped PID $procId"
    } catch {
      Write-Warn "Could not stop PID ${procId}: $($_.Exception.Message)"
    }
  }
}

function Wait-Port(
  [int]$Port,
  [int]$TimeoutSeconds = 120
) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-TcpPort -HostName '127.0.0.1' -Port $Port -TimeoutMs 1000) {
      return $true
    }

    Start-Sleep -Milliseconds 500
  }

  return $false
}

function Show-LogTail(
  [string]$Path,
  [string]$Label
) {
  if (-not (Test-Path $Path)) {
    return
  }

  Write-Host "----- $Label ($Path) -----" -ForegroundColor Yellow
  Get-Content $Path -Tail 120
}

function Stop-StartedProcesses([int[]]$ProcessIds) {
  foreach ($processId in ($ProcessIds | Sort-Object -Unique)) {
    if (-not $processId -or $processId -le 0) {
      continue
    }

    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
      Write-Step "Stopped PID $processId"
    } catch {
      Write-Warn "Could not stop PID ${processId}: $($_.Exception.Message)"
    }
  }
}

if (-not (Test-Path $logsDir)) {
  New-Item -ItemType Directory -Path $logsDir | Out-Null
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Err 'Node.js is not installed or not in PATH.'
  exit 1
}

$requiredNodeVersion = ''
$nvmrcPath = Join-Path $repoRoot '.nvmrc'

if (Test-Path $nvmrcPath) {
  $requiredNodeVersion = (Get-Content $nvmrcPath | Select-Object -First 1).Trim()
}

$currentNodeVersion = (& node -v).Trim().TrimStart('v')

if ($requiredNodeVersion -and $currentNodeVersion -ne $requiredNodeVersion) {
  Write-Warn "Node version mismatch. Current: $currentNodeVersion, required: $requiredNodeVersion."
  Write-Warn "Run: nvm use $requiredNodeVersion"
}

$serverEnvPath = Join-Path $repoRoot 'packages/twenty-server/.env'
$serverEnvExamplePath = Join-Path $repoRoot 'packages/twenty-server/.env.example'
$frontEnvPath = Join-Path $repoRoot 'packages/twenty-front/.env'
$frontEnvExamplePath = Join-Path $repoRoot 'packages/twenty-front/.env.example'

if (-not (Test-Path $serverEnvPath)) {
  Copy-Item $serverEnvExamplePath $serverEnvPath
  Write-Step 'Created packages/twenty-server/.env from .env.example'
}

if (-not (Test-Path $frontEnvPath)) {
  Copy-Item $frontEnvExamplePath $frontEnvPath
  Write-Step 'Created packages/twenty-front/.env from .env.example'
}

if (-not $SkipServiceChecks) {
  $postgresReady = Test-TcpPort -HostName '127.0.0.1' -Port 5432 -TimeoutMs 1200
  $redisReady = Test-TcpPort -HostName '127.0.0.1' -Port 6379 -TimeoutMs 1200

  if (-not $postgresReady -or -not $redisReady) {
    if (-not $postgresReady) {
      Write-Err 'PostgreSQL is not reachable on 127.0.0.1:5432'
      Write-Host 'Start it with: make -C packages/twenty-docker postgres-on-docker'
    }

    if (-not $redisReady) {
      Write-Err 'Redis is not reachable on 127.0.0.1:6379'
      Write-Host 'Start it with: make -C packages/twenty-docker redis-on-docker'
    }

    Write-Host 'Tip: run with -SkipServiceChecks if you only want process bootstrap checks.'
    exit 1
  }
}

if ($ResetDb) {
  Write-Step 'Running database reset (this can take a while)...'
  Push-Location $repoRoot

  try {
    & npx.cmd nx database:reset twenty-server

    if ($LASTEXITCODE -ne 0) {
      throw "database:reset failed with exit code $LASTEXITCODE"
    }
  } finally {
    Pop-Location
  }
}

Stop-Ports -Ports @(3000, 3001)

$serverOutLog = Join-Path $logsDir 'server.out.log'
$serverErrLog = Join-Path $logsDir 'server.err.log'
$frontOutLog = Join-Path $logsDir 'front.out.log'
$frontErrLog = Join-Path $logsDir 'front.err.log'

$logFiles = @($serverOutLog, $serverErrLog, $frontOutLog, $frontErrLog)
foreach ($logFile in $logFiles) {
  if (Test-Path $logFile) {
    Remove-Item $logFile -Force
  }
}

$serverCommand = "cd /d `"$repoRoot`" && npx.cmd nx run twenty-server:start --excludeTaskDependencies"
$frontCommand = "cd /d `"$repoRoot`" && npx.cmd nx run twenty-front:start --excludeTaskDependencies"

Write-Step 'Starting backend...'
$serverProcess = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $serverCommand -RedirectStandardOutput $serverOutLog -RedirectStandardError $serverErrLog -PassThru

Write-Step 'Starting frontend...'
$frontProcess = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $frontCommand -RedirectStandardOutput $frontOutLog -RedirectStandardError $frontErrLog -PassThru

@{
  serverPid = $serverProcess.Id
  frontPid = $frontProcess.Id
  startedAt = (Get-Date).ToString('o')
} | ConvertTo-Json | Set-Content -Path $pidsFile

Write-Step "Backend PID: $($serverProcess.Id)"
Write-Step "Frontend PID: $($frontProcess.Id)"

$startedProcessIds = @($serverProcess.Id, $frontProcess.Id)

$frontReady = Wait-Port -Port 3001 -TimeoutSeconds $StartupTimeoutSeconds
if (-not $frontReady) {
  Write-Err 'Frontend did not open port 3001 in time.'
  Show-LogTail -Path $frontOutLog -Label 'Frontend stdout'
  Show-LogTail -Path $frontErrLog -Label 'Frontend stderr'
  Stop-StartedProcesses -ProcessIds $startedProcessIds
  exit 1
}

$serverReady = Wait-Port -Port 3000 -TimeoutSeconds $StartupTimeoutSeconds
if (-not $serverReady) {
  Write-Err 'Backend did not open port 3000 in time.'
  Show-LogTail -Path $serverOutLog -Label 'Backend stdout'
  Show-LogTail -Path $serverErrLog -Label 'Backend stderr'
  Stop-StartedProcesses -ProcessIds $startedProcessIds
  exit 1
}

$rootMode = 'unknown'
try {
  $rootHtml = (Invoke-WebRequest -Uri 'http://127.0.0.1:3000' -UseBasicParsing -TimeoutSec 8).Content

  if ($rootHtml -match '@vite/client') {
    $rootMode = 'vite-proxy'
  } elseif ($rootHtml -match 'index-[^"''\s]+\.js') {
    $rootMode = 'static-build'
  }
} catch {
  $rootMode = 'unreachable'
}

Write-Step "Stack ready. App URL: http://127.0.0.1:3000 ($rootMode)"
Write-Step 'Frontend URL: http://127.0.0.1:3001'
Write-Step "Logs: $logsDir"
Write-Step 'Stop with: yarn dev:win:stop'
