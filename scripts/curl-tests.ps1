$base = 'http://localhost:8787/api'
$headers = @{ 'Content-Type' = 'application/json' }
$payload = @{ equipmentId = 'eq-1'; borrowerName = 'Somchai Jaidee'; startAt = '2026-10-20T09:00:00.000Z'; endAt = '2026-10-20T11:00:00.000Z'; purpose = 'Class presentation' } | ConvertTo-Json -Compress

function Show-Case($label, $method, $uri, $body = $null) {
	Write-Host $label
	try {
		$response = Invoke-WebRequest -Method $method -Uri $uri -Headers $headers -Body $body -UseBasicParsing
		Write-Host "Status: $($response.StatusCode)"
		Write-Host $response.Content
	} catch {
		$response = $_.Exception.Response
		Write-Host "Status: $([int]$response.StatusCode)"
		Write-Host $_.ErrorDetails.Message
	}
}

Show-Case '1 GET equipment: expected 200' Get "$base/equipment"
Show-Case '2 GET bookings: expected 200' Get "$base/bookings"
$created = Invoke-RestMethod -Method Post -Uri "$base/bookings" -Headers $headers -Body $payload
Write-Host '3 POST valid booking: expected 201'
$created | ConvertTo-Json
$id = $created.id
Show-Case '4 GET one booking: expected 200' Get "$base/bookings/$id"
$update = @{ equipmentId = 'eq-1'; borrowerName = 'Somchai Jaidee'; startAt = '2026-10-20T12:00:00.000Z'; endAt = '2026-10-20T14:00:00.000Z'; purpose = 'Updated class presentation' } | ConvertTo-Json -Compress
Show-Case '5 PATCH booking: expected 200' Patch "$base/bookings/$id" $update
$invalid = @{ equipmentId = 'eq-1'; borrowerName = 'Test User'; startAt = '2026-10-20T11:00:00.000Z'; endAt = '2026-10-20T09:00:00.000Z'; purpose = 'Invalid test' } | ConvertTo-Json -Compress
Show-Case '6 POST invalid time: expected 400' Post "$base/bookings" $invalid
$conflict = @{ equipmentId = 'eq-1'; borrowerName = 'Suda Dee'; startAt = '2026-10-20T12:30:00.000Z'; endAt = '2026-10-20T13:30:00.000Z'; purpose = 'Conflict test' } | ConvertTo-Json -Compress
Show-Case '7 POST overlapping booking: expected 409' Post "$base/bookings" $conflict
Show-Case '8 GET missing booking: expected 404' Get "$base/bookings/not-found"
Show-Case '9 DELETE booking: expected 204' Delete "$base/bookings/$id"
$unknown = @{ equipmentId = 'not-an-equipment'; borrowerName = 'Unknown Equipment Test'; startAt = '2026-10-22T09:00:00.000Z'; endAt = '2026-10-22T10:00:00.000Z'; purpose = 'Validation test' } | ConvertTo-Json -Compress
Show-Case '10 POST unknown equipment: expected 400' Post "$base/bookings" $unknown