[CmdletBinding()]
param(
    [string]$BootstrapPath = (Join-Path $PSScriptRoot "..\JEJAK.md"),
    [string]$OutputPath = (Join-Path $PSScriptRoot "..\.env.local"),
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$bootstrapFullPath = [System.IO.Path]::GetFullPath($BootstrapPath)
$outputFullPath = [System.IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path -LiteralPath $bootstrapFullPath -PathType Leaf)) {
    throw "Bootstrap lokal tidak ditemukan."
}

if ((Test-Path -LiteralPath $outputFullPath) -and -not $Force) {
    throw "Env lokal sudah ada. Pakai -Force hanya kalau memang mau membangunnya ulang."
}

$allowedNames = @(
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_JWKS_URL",
    "GEMINI_API_KEY_1",
    "GEMINI_API_KEY_2",
    "GEMINI_API_KEY_3",
    "GEMINI_API_KEY_4",
    "GROQ_API_KEY_1",
    "GROQ_API_KEY_2",
    "GROQ_API_KEY_3",
    "GROQ_API_KEY_4"
)

$values = @{}
foreach ($line in Get-Content -LiteralPath $bootstrapFullPath) {
    if ($line -notmatch '^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.+?)\s*$') {
        continue
    }

    $name = $Matches[1]
    $value = $Matches[2]

    if ($allowedNames -contains $name -and -not [string]::IsNullOrWhiteSpace($value)) {
        $values[$name] = $value
    }
}

$requiredNames = @("SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY")
$missingNames = @($requiredNames | Where-Object { -not $values.ContainsKey($_) })
if ($missingNames.Count -gt 0) {
    throw "Bootstrap lokal belum punya field wajib: $($missingNames -join ', ')"
}

$mappedValues = [ordered]@{
    "NEXT_PUBLIC_SUPABASE_URL" = $values["SUPABASE_URL"]
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" = $values["SUPABASE_PUBLISHABLE_KEY"]
    "SUPABASE_SECRET_KEY" = $values["SUPABASE_SECRET_KEY"]
}

foreach ($optionalName in $allowedNames) {
    if ($optionalName -in $requiredNames -or $optionalName -in @("SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY")) {
        continue
    }

    if ($values.ContainsKey($optionalName)) {
        $mappedValues[$optionalName] = $values[$optionalName]
    }
}

$outputLines = @(
    "# Dibuat lokal dari JEJAK.md. File ini wajib tetap di luar Git.",
    "# Jangan salin nilainya ke dokumentasi, log, atau client bundle."
)
foreach ($entry in $mappedValues.GetEnumerator()) {
    $outputLines += "$($entry.Key)=$($entry.Value)"
}
$outputLines += "APP_VERSION=0.1.0"
$outputLines += "BUILD_ID=local"

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($outputFullPath, $outputLines, $utf8WithoutBom)

Write-Output "Env lokal dibuat aman dengan $($mappedValues.Count + 2) field; nilai tidak ditampilkan."
