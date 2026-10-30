#!/usr/bin/env python3
"""Export the running local HTML deck using its print composition."""
import argparse
from pathlib import Path
import subprocess
import tempfile
import time

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:4173/pitchdeck/')
parser.add_argument('--output', default='public/pitchdeck.pdf')
parser.add_argument('--browser', default='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
args = parser.parse_args()
output = Path(args.output).resolve()
if not Path(args.browser).is_file():
    raise SystemExit('Chrome was not found. Pass its executable path with --browser.')
with tempfile.TemporaryDirectory(prefix='wiskers-deck-') as temporary:
    temporary = Path(temporary)
    pdf = temporary / 'pitchdeck.pdf'
    command = [args.browser, '--headless', '--no-sandbox', '--disable-background-networking',
               '--disable-component-update', '--disable-sync', '--disable-default-apps',
               '--no-first-run', '--enable-unsafe-swiftshader', '--use-gl=angle',
               '--use-angle=swiftshader', '--no-pdf-header-footer', '--virtual-time-budget=5000',
               '--user-data-dir=' + str(temporary / 'profile'), '--print-to-pdf=' + str(pdf), args.url]
    process = subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(80):
            if pdf.is_file() and pdf.stat().st_size > 1000:
                time.sleep(1)
                break
            if process.poll() is not None:
                break
            time.sleep(.5)
    finally:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
    if not pdf.is_file():
        raise SystemExit('No PDF was produced. Check that the local preview server is running.')
    data = pdf.read_bytes()
    if not data.startswith(b'%PDF-') or b'%%EOF' not in data[-2048:]:
        raise SystemExit('The PDF was incomplete; the previous output was preserved.')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(data)
print(f'Saved {output} ({len(data):,} bytes)')
