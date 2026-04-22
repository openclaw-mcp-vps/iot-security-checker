param(
  [string]$NetworkCidr = "192.168.1.0/24"
)

$OutputFile = "iot_scan.txt"
Write-Host "Running IoT security scan on $NetworkCidr..."
Write-Host "This may take several minutes."

nmap.exe -sS -sV -O --open --script vuln $NetworkCidr -oN $OutputFile

Write-Host "Scan complete. Output saved to $OutputFile."
Write-Host "Upload or paste the output into IoT Security Checker."
