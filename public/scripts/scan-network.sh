#!/usr/bin/env bash
set -euo pipefail

NETWORK_CIDR="${1:-192.168.1.0/24}"
OUTPUT_FILE="iot_scan.txt"

echo "Running IoT security scan on ${NETWORK_CIDR}..."
echo "This may take a few minutes."

nmap -sS -sV -O --open --script vuln "${NETWORK_CIDR}" -oN "${OUTPUT_FILE}"

echo "Scan complete. Output saved to ${OUTPUT_FILE}."
echo "Upload or paste the output into IoT Security Checker."
