$base = 'http://localhost:3000'
function log($title, $obj) {
  Write-Host "`n== $title =="
  if ($null -ne $obj) { $obj | ConvertTo-Json -Depth 5 | Write-Host }
}
try {
  $create = Invoke-RestMethod -Method Post -Uri ($base + '/api/customers') -ContentType 'application/json' -Body (ConvertTo-Json @{ name='PS Test Khach'; phone='0123456789'; depositAmount=1000000; commission=10 })
  log 'created' $create
  $id = $create.id
  if (-not $id) { throw 'Create failed' }

  $activeBefore = Invoke-RestMethod -Method Get -Uri ($base + '/api/customers')
  log 'activeBefore length' ($activeBefore | Measure-Object).Count

  $trashBefore = Invoke-RestMethod -Method Get -Uri ($base + '/api/customers?deleted=true')
  log 'trashBefore contains id' ($trashBefore | Where-Object { $_.id -eq $id } | Measure-Object).Count

  $del = Invoke-RestMethod -Method Delete -Uri ($base + '/api/customers') -ContentType 'application/json' -Body (ConvertTo-Json @{ id=$id })
  log 'delete response' $del

  $activeAfter = Invoke-RestMethod -Method Get -Uri ($base + '/api/customers')
  log 'activeAfter contains id' ($activeAfter | Where-Object { $_.id -eq $id } | Measure-Object).Count
  $trashAfter = Invoke-RestMethod -Method Get -Uri ($base + '/api/customers?deleted=true')
  log 'trashAfter contains id' ($trashAfter | Where-Object { $_.id -eq $id } | Measure-Object).Count

  $put = Invoke-RestMethod -Method Put -Uri ($base + '/api/customers') -ContentType 'application/json' -Body (ConvertTo-Json @{ id=$id; deleted=$false })
  log 'restore response' $put

  $activeRestored = Invoke-RestMethod -Method Get -Uri ($base + '/api/customers')
  log 'activeRestored contains id' ($activeRestored | Where-Object { $_.id -eq $id } | Measure-Object).Count

  # soft-delete then permanent delete
  Invoke-RestMethod -Method Delete -Uri ($base + '/api/customers') -ContentType 'application/json' -Body (ConvertTo-Json @{ id=$id }) | Out-Null
  $perm = Invoke-RestMethod -Method Delete -Uri ($base + '/api/customers') -ContentType 'application/json' -Body (ConvertTo-Json @{ id=$id; permanent=$true })
  log 'permanent delete response' $perm

  $finalActive = Invoke-RestMethod -Method Get -Uri ($base + '/api/customers')
  log 'finalActive contains id' ($finalActive | Where-Object { $_.id -eq $id } | Measure-Object).Count
  $finalTrash = Invoke-RestMethod -Method Get -Uri ($base + '/api/customers?deleted=true')
  log 'finalTrash contains id' ($finalTrash | Where-Object { $_.id -eq $id } | Measure-Object).Count

  Write-Host '\nAll done'
} catch {
  Write-Error "Test script error: $_"
  exit 1
}
