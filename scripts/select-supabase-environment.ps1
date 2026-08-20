[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$CredentialFile,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9]{20}$')]
    [string]$ExpectedProjectRef,

    [switch]$ConfirmSwitch
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $ConfirmSwitch) {
    throw "Pergantian env dibatalkan. Tambahkan -ConfirmSwitch setelah project ref diverifikasi."
}

$sourcePath = [System.IO.Path]::GetFullPath($CredentialFile)
if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "File credential sumber tidak ditemukan."
}

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$envPath = Join-Path $repoRoot ".env.local"
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$sourceLines = @(Get-Content -LiteralPath $sourcePath)

function Get-SourceValue {
    param([string]$Name)

    $line = $sourceLines |
        Where-Object { $_ -match ('^\s*' + [regex]::Escape($Name) + '\s*=') } |
        Select-Object -First 1

    if (-not $line) {
        throw "Credential sumber tidak memiliki field Supabase yang diwajibkan."
    }

    return ($line -split '=', 2)[1].Trim().Trim('`').Trim('"').Trim("'")
}

function Set-OrAppendLine {
    param(
        [string[]]$Lines,
        [string]$Pattern,
        [string]$Replacement
    )

    $found = $false
    $updated = foreach ($line in $Lines) {
        if ($line -match $Pattern) {
            if (-not $found) {
                $Replacement
                $found = $true
            }
        }
        else {
            $line
        }
    }

    if (-not $found) {
        $updated += $Replacement
    }

    return @($updated)
}

$projectUrl = Get-SourceValue "SUPABASE_URL"
$publishableKey = Get-SourceValue "SUPABASE_PUBLISHABLE_KEY"
$secretKey = Get-SourceValue "SUPABASE_SECRET_KEY"
$jwksUrl = Get-SourceValue "SUPABASE_JWKS_URL"

$projectUri = [uri]$projectUrl
$jwksUri = [uri]$jwksUrl
$actualRef = $projectUri.Host.Split('.')[0].ToLowerInvariant()

if ($projectUri.Scheme -ne 'https' -or $projectUri.AbsolutePath -ne '/' -or
    $projectUri.Host -ne "$ExpectedProjectRef.supabase.co" -or
    $actualRef -ne $ExpectedProjectRef) {
    throw "Project URL tidak cocok dengan ref yang sudah diverifikasi."
}

if ($jwksUri.Scheme -ne 'https' -or $jwksUri.Host -ne $projectUri.Host -or
    $jwksUri.AbsolutePath -ne '/auth/v1/.well-known/jwks.json') {
    throw "JWKS URL tidak cocok dengan project yang dipilih."
}

if ($publishableKey -notmatch '^sb_publishable_[A-Za-z0-9_-]+$' -or
    $secretKey -notmatch '^sb_secret_[A-Za-z0-9_-]+$') {
    throw "Pasangan API key modern tidak valid."
}

foreach ($apiKey in @($publishableKey, $secretKey)) {
    try {
        $health = Invoke-WebRequest `
            -Uri "$projectUrl/auth/v1/health" `
            -Headers @{ apikey = $apiKey } `
            -UserAgent 'JEJAK-server-bootstrap/1.0' `
            -SkipHttpErrorCheck `
            -TimeoutSec 30
    }
    catch {
        throw "Project atau pasangan API key tidak dapat diverifikasi; env lokal tidak diubah."
    }

    if ([int]$health.StatusCode -ne 200) {
        throw "Project atau pasangan API key tidak valid; env lokal tidak diubah."
    }
}

$envLines = if (Test-Path -LiteralPath $envPath) {
    @(Get-Content -LiteralPath $envPath)
}
else {
    @(
        "# Env lokal JEJAK. File ini wajib tetap di luar Git.",
        "# Jangan salin nilainya ke dokumentasi, log, atau client bundle."
    )
}

$envLines = Set-OrAppendLine $envLines '^\s*NEXT_PUBLIC_SUPABASE_URL\s*=' "NEXT_PUBLIC_SUPABASE_URL=$projectUrl"
$envLines = Set-OrAppendLine $envLines '^\s*NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\s*=' "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$publishableKey"
$envLines = Set-OrAppendLine $envLines '^\s*SUPABASE_SECRET_KEY\s*=' "SUPABASE_SECRET_KEY=$secretKey"
$envLines = Set-OrAppendLine $envLines '^\s*SUPABASE_JWKS_URL\s*=' "SUPABASE_JWKS_URL=$jwksUrl"

$tempEnvPath = "$envPath.$PID.tmp"
try {
    [System.IO.File]::WriteAllLines($tempEnvPath, $envLines, $utf8WithoutBom)
    [System.IO.File]::Move($tempEnvPath, $envPath, $true)
}
finally {
    if (Test-Path -LiteralPath $tempEnvPath) {
        Remove-Item -LiteralPath $tempEnvPath -Force
    }
}
Write-Output "Env lokal sekarang memakai Supabase ref $actualRef."
