{
  `path`: `C:\\Users\\sxtnl\\Dev\\ai_layer\\apps\\crm-twenty\\tools\\linear-cli\\scripts\\generate-env-example.ps1`,
  `content`: `

  # generate-env-example.ps1 - Generate .env.example from .env
# Preserves structure, replaces values with helpful placeholders
#
# Usage:
#   .\\generate-env-example.ps1              # Uses .env in current directory
#   .\\generate-env-example.ps1 path\\.env    # Uses specific .env file

param(
    [string]$EnvPath = \".env\"
)

$ErrorActionPreference = \"Stop\"

# Known placeholders for common variables
$placeholders = @{
    # API Keys & Tokens
    \"API_KEY\"           = \"your-api-key\"
    \"SECRET\"            = \"generate-with-openssl-rand-base64-32\"
    \"TOKEN\"             = \"your-token\"
    \"PASSWORD\"          = \"your-password\"

    # Specific services
    \"LINEAR_CLIENT_ID\"       = \"get-from-linear.app/settings/api/applications\"
    \"LINEAR_CLIENT_SECRET\"   = \"get-from-linear.app/settings/api/applications\"
    \"LINEAR_API_KEY\"         = \"lin_api_xxx-get-from-linear.app/settings/api\"
    \"LINEAR_TEAM_ID\"         = \"uuid-or-team-key\"
    \"LINEAR_PROJECT_ID\"      = \"uuid-optional\"

    \"SUPABASE_URL\"           = \"https://your-project.supabase.co\"
    \"SUPABASE_ANON_KEY\"      = \"eyJhbG...-get-from-supabase-dashboard\"
    \"SUPABASE_SERVICE_ROLE_KEY\" = \"eyJhbG...-keep-secret\"

    \"OPENAI_API_KEY\"         = \"sk-proj-xxx\"
    \"OPENROUTER_API_KEY\"     = \"sk-or-v1-xxx\"

    \"AWS_ACCESS_KEY_ID\"      = \"AKIA...\"
    \"AWS_SECRET_ACCESS_KEY\"  = \"your-aws-secret\"

    \"DIGITALOCEAN_TOKEN\"     = \"dop_v1_xxx\"

    \"N8N_API_KEY\"            = \"eyJhbG...-create-in-n8n-settings\"
    \"N8N_ENCRYPTION_KEY\"     = \"generate-with-openssl-rand-hex-32\"
    \"N8N_JWT_SECRET\"         = \"generate-with-openssl-rand-hex-32\"

    \"REDIS_URL\"              = \"redis://localhost:6379\"
    \"DATABASE_URL\"           = \"postgresql://user:pass@host:5432/db\"

    \"BUBBLE_API_TOKEN\"       = \"your-bubble-api-token\"

    # Generic patterns
    \"EMAIL\"             = \"you@example.com\"
    \"URL\"               = \"https://example.com\"
    \"HOST\"              = \"localhost\"
    \"PORT\"              = \"3000\"
    \"USER\"              = \"username\"
}

function Get-Placeholder {
    param([string]$Key, [string]$Value)

    # Check exact match first
    if ($placeholders.ContainsKey($Key)) {
        return $placeholders[$Key]
    }

    # Check suffix patterns
    foreach ($pattern in $placeholders.Keys) {
        if ($Key -like \"*_$pattern\" -or $Key -like \"*$pattern\") {
            return $placeholders[$pattern]
        }
    }

    # Smart guess based on value format
    if ($Value -match '^https?://') {
        return \"https://your-url-here\"
    }
    if ($Value -match '^sk-') {
        return \"sk-your-api-key\"
    }
    if ($Value -match '^eyJ') {
        return \"jwt-token-here\"
    }
    if ($Value -match '^\\d+$') {
        return $Value  # Keep numeric values (ports etc)
    }
    if ($Value -match '^(true|false)$') {
        return $Value  # Keep boolean values
    }
    if ($Value -match '^(development|production|test)$') {
        return $Value  # Keep environment names
    }

    # Default
    return \"your-value-here\"
}

# Resolve paths
$EnvFile = Resolve-Path $EnvPath -ErrorAction SilentlyContinue
if (-not $EnvFile) {
    Write-Host \"❌ No .env found at $EnvPath\" -ForegroundColor Red
    exit 1
}

$EnvDir = Split-Path -Parent $EnvFile
$EnvExample = Join-Path $EnvDir \".env.example\"

Write-Host \"🔧 Generate .env.example\" -ForegroundColor Cyan
Write-Host \"========================\"
Write-Host \"   Source: $EnvFile\"
Write-Host \"   Output: $EnvExample\"
Write-Host \"\"

# Backup existing .env.example
if (Test-Path $EnvExample) {
    Copy-Item $EnvExample \"$EnvExample.backup\"
    Write-Host \"💾 Backed up existing .env.example\" -ForegroundColor Yellow
}

# Process .env line by line
$output = @()
$varCount = 0

Get-Content $EnvFile | ForEach-Object {
    $line = $_

    # Empty lines - keep as is
    if ([string]::IsNullOrWhiteSpace($line)) {
        $output += \"\"
        return
    }

    # Comments - keep as is
    if ($line -match '^\\s*#') {
        $output += $line
        return
    }

    # Variable lines - replace value with placeholder
    if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
        $key = $Matches[1]
        $value = $Matches[2]
        $placeholder = Get-Placeholder -Key $key -Value $value
        $output += \"$key=$placeholder\"
        $varCount++
        return
    }

    # Anything else - keep as is
    $output += $line
}

# Write output
$output | Set-Content $EnvExample -Encoding UTF8

Write-Host \"\"
Write-Host \"✅ Generated .env.example\" -ForegroundColor Green
Write-Host \"\"
Write-Host \"📋 Summary:\"
Write-Host \"   $varCount variables with placeholders\"
Write-Host \"   All comments preserved\"
`
}
