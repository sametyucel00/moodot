$ErrorActionPreference = 'Stop'

if (-not (Test-Path '.env')) {
  throw '.env file not found in project root.'
}

$secretNames = @(
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_DATABASE_URL',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'EXPO_PUBLIC_FIREBASE_MOODOT_ROOT'
)

$envMap = @{}
Get-Content '.env' | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#')) { return }
  $idx = $line.IndexOf('=')
  if ($idx -lt 1) { return }

  $key = $line.Substring(0, $idx).Trim()
  $value = $line.Substring($idx + 1).Trim()
  $envMap[$key] = $value
}

foreach ($name in $secretNames) {
  if (-not $envMap.ContainsKey($name)) {
    throw "Missing key in .env: $name"
  }
  Set-Item -Path "Env:$name" -Value $envMap[$name]
}

foreach ($name in $secretNames) {
  $value = $envMap[$name]
  Write-Host "Setting EAS env: $name"
  $success = $false
  $visibility = 'sensitive'

  for ($attempt = 1; $attempt -le 5; $attempt++) {
    npx eas-cli@latest env:create --name $name --value $value --environment production --visibility $visibility --non-interactive --force
    if ($LASTEXITCODE -eq 0) {
      $success = $true
      break
    }

    Write-Host "Retry $attempt failed for $name, retrying..."
    Start-Sleep -Seconds (2 * $attempt)
  }

  if (-not $success) {
    throw "Failed to upload EAS variable: $name."
  }
}

Write-Host 'All variables uploaded to EAS production environment.'
