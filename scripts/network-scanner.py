#!/usr/bin/env python3
"""
IoT Security Checker local network scanner.

Usage:
  python3 network-scanner.py --subnet 192.168.1.0/24 --output scan-results.json
"""

import argparse
import concurrent.futures
import ipaddress
import json
import platform
import re
import socket
import subprocess
import sys
import time
from datetime import datetime, timezone

COMMON_IOT_PORTS = [
    22,
    23,
    53,
    80,
    81,
    123,
    443,
    554,
    1883,
    1900,
    5000,
    5353,
    8000,
    8080,
    8443,
]


def parse_args():
    parser = argparse.ArgumentParser(description="Scan a local subnet for IoT devices")
    parser.add_argument("--subnet", help="CIDR subnet, e.g. 192.168.1.0/24")
    parser.add_argument("--timeout", type=float, default=0.4, help="Port connect timeout in seconds")
    parser.add_argument("--workers", type=int, default=48, help="Parallel worker count")
    parser.add_argument("--ports", nargs="*", type=int, default=COMMON_IOT_PORTS, help="Ports to probe")
    parser.add_argument("--output", default="", help="Optional path to write JSON output")
    return parser.parse_args()


def detect_local_subnet():
    if platform.system().lower() == "windows":
        return "192.168.1.0/24"

    try:
        route = subprocess.check_output(["ip", "route"], text=True, stderr=subprocess.DEVNULL)
        for line in route.splitlines():
            if "src" in line and "/" in line and "default" not in line:
                candidate = line.split()[0]
                ipaddress.ip_network(candidate, strict=False)
                return candidate
    except Exception:
        pass

    return "192.168.1.0/24"


def ping_host(ip):
    system = platform.system().lower()
    if system == "windows":
        command = ["ping", "-n", "1", "-w", "300", ip]
    else:
        command = ["ping", "-c", "1", "-W", "1", ip]

    result = subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return result.returncode == 0


def detect_open_ports(ip, ports, timeout):
    open_ports = []
    for port in ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        try:
            if sock.connect_ex((ip, int(port))) == 0:
                open_ports.append(int(port))
        except Exception:
            pass
        finally:
            sock.close()
    return sorted(open_ports)


def resolve_hostname(ip):
    try:
        hostname = socket.gethostbyaddr(ip)[0]
        return hostname
    except Exception:
        return "unknown"


def resolve_mac(ip):
    commands = [["arp", "-n", ip], ["arp", "-a", ip]]
    for command in commands:
        try:
            output = subprocess.check_output(command, text=True, stderr=subprocess.DEVNULL)
            match = re.search(r"([0-9A-Fa-f]{2}[:\-]){5}([0-9A-Fa-f]{2})", output)
            if match:
                return match.group(0).replace("-", ":").lower()
        except Exception:
            continue
    return "unknown"


def scan_host(ip, ports, timeout):
    if not ping_host(ip):
        return None

    hostname = resolve_hostname(ip)
    mac = resolve_mac(ip)
    open_ports = detect_open_ports(ip, ports, timeout)

    return {
        "ip": ip,
        "hostname": hostname,
        "mac": mac,
        "openPorts": open_ports,
    }


def main():
    args = parse_args()
    subnet = args.subnet or detect_local_subnet()

    try:
        network = ipaddress.ip_network(subnet, strict=False)
    except ValueError:
        print(f"Invalid subnet: {subnet}", file=sys.stderr)
        sys.exit(1)

    hosts = [str(host) for host in network.hosts()]

    started = time.time()
    devices = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(scan_host, ip, args.ports, args.timeout) for ip in hosts]
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result:
                devices.append(result)

    devices.sort(key=lambda item: item["ip"])

    payload = {
        "scanner": "iot-security-checker",
        "scanned_at": datetime.now(timezone.utc).isoformat(),
        "subnet": subnet,
        "duration_seconds": round(time.time() - started, 2),
        "device_count": len(devices),
        "devices": devices,
    }

    json_output = json.dumps(payload, indent=2)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as handle:
            handle.write(json_output)

    print(json_output)


if __name__ == "__main__":
    main()
