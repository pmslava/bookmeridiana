#!/usr/bin/env python3
"""Generate the printable "Rezervišite teren" QR poster.

Output:  qr-option-2-yellow.png  (1800×2400, placed next to this script)

Deps:    qrencode, rsvg-convert  (apt install qrencode librsvg2-bin)
         Python 3 stdlib only.

Verify scan:  zbarimg --quiet qr-option-2-yellow.png

Style decisions are documented in CLAUDE.md ("Visual design rules").
The central tennis ball uses the exact SVG the site uses in index.html.
QR error-correction level H (30%) absorbs the center knockout.
"""
import re
import subprocess
import tempfile
from pathlib import Path

URL = "https://teniskosmos.com/"           # canonical domain (Serbian spelling, single 'n')
URL_LABEL = "teniskosmos.com"
HEADLINE = "Rezervišite teren"

HERE = Path(__file__).resolve().parent
OUT_PNG = HERE / "qr-option-2-yellow.png"

# --- Generate raw QR SVG via qrencode ---------------------------------------
with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    raw_svg = tmp / "qr.svg"
    subprocess.check_call(["qrencode", "-t", "SVG", "-l", "H", "-m", "0", "-o", str(raw_svg), URL])
    src = raw_svg.read_text()
    rects_raw = re.search(r'<g id="Pattern"[^>]*>(.*?)</g>', src, re.S).group(1)
    GRID = int(re.search(r'viewBox="0 0 (\d+) (\d+)"', src).group(1))

    # Parse module grid into a 2D bitmap
    grid = [[0] * GRID for _ in range(GRID)]
    for m in re.finditer(r'<rect x="(\d+)" y="(\d+)" width="1" height="1"', rects_raw):
        x, y = int(m.group(1)), int(m.group(2))
        grid[y][x] = 1

    # --- Poster layout constants --------------------------------------------
    W, H = 600, 800
    QR_SIZE = 420
    QR_X = (W - QR_SIZE) // 2
    QR_Y = 205                          # tuned so top/bottom gaps are visually balanced
    MODULE = QR_SIZE / GRID

    BALL_MODULES = 7                    # center knockout: ~21% of grid (safe at level H)
    BALL_PX = BALL_MODULES * MODULE
    BALL_SIZE = BALL_PX * 0.78          # ball sits inside knockout with whitespace ring
    CX_MOD_LO = (GRID - BALL_MODULES) // 2
    CX_MOD_HI = CX_MOD_LO + BALL_MODULES
    CX = QR_X + QR_SIZE / 2
    CY = QR_Y + QR_SIZE / 2

    def in_finder(r, c):
        """True if module (r,c) belongs to one of the three corner finder patterns."""
        return (r < 7 and c < 7) or (r < 7 and c >= GRID - 7) or (r >= GRID - 7 and c < 7)

    def in_knockout(r, c):
        return CX_MOD_LO <= c < CX_MOD_HI and CX_MOD_LO <= r < CX_MOD_HI

    # Data modules → dots (skip finders and center knockout)
    dots = []
    dot_r = MODULE * 0.46
    for r in range(GRID):
        for c in range(GRID):
            if grid[r][c] and not in_finder(r, c) and not in_knockout(r, c):
                cx = QR_X + (c + 0.5) * MODULE
                cy = QR_Y + (r + 0.5) * MODULE
                dots.append(f'<circle cx="{cx:.3f}" cy="{cy:.3f}" r="{dot_r:.3f}"/>')

    def finder(row, col):
        """Rounded-square finder pattern (7×7 modules)."""
        x0 = QR_X + col * MODULE
        y0 = QR_Y + row * MODULE
        r_out = MODULE * 1.8
        r_in = MODULE * 0.9
        return f'''    <g>
      <rect x="{x0:.3f}" y="{y0:.3f}" width="{7*MODULE:.3f}" height="{7*MODULE:.3f}" rx="{r_out:.3f}" ry="{r_out:.3f}" fill="#000000"/>
      <rect x="{x0+MODULE:.3f}" y="{y0+MODULE:.3f}" width="{5*MODULE:.3f}" height="{5*MODULE:.3f}" rx="{r_out*0.75:.3f}" ry="{r_out*0.75:.3f}" fill="#ffffff"/>
      <rect x="{x0+2*MODULE:.3f}" y="{y0+2*MODULE:.3f}" width="{3*MODULE:.3f}" height="{3*MODULE:.3f}" rx="{r_in:.3f}" ry="{r_in:.3f}" fill="#000000"/>
    </g>'''

    finders = "\n".join([finder(0, 0), finder(0, GRID - 7), finder(GRID - 7, 0)])

    def tennis_ball(cx, cy, size):
        """The site's tennis ball (index.html): #c5e84c circle + two white seams."""
        r = size / 2
        def p(x, y):
            return (cx + (x - 50) / 50 * r, cy + (y - 50) / 50 * r)
        p1 = [p(22, 15), p(50, 50), p(22, 85)]
        p2 = [p(78, 15), p(50, 50), p(78, 85)]
        sw = size * 0.06
        return (
            f'<circle cx="{cx}" cy="{cy}" r="{r:.3f}" fill="#c5e84c"/>\n'
            f'  <path d="M {p1[0][0]:.2f} {p1[0][1]:.2f} Q {p1[1][0]:.2f} {p1[1][1]:.2f}, {p1[2][0]:.2f} {p1[2][1]:.2f}" '
            f'stroke="white" stroke-width="{sw:.2f}" fill="none" opacity="0.75" stroke-linecap="round"/>\n'
            f'  <path d="M {p2[0][0]:.2f} {p2[0][1]:.2f} Q {p2[1][0]:.2f} {p2[1][1]:.2f}, {p2[2][0]:.2f} {p2[2][1]:.2f}" '
            f'stroke="white" stroke-width="{sw:.2f}" fill="none" opacity="0.75" stroke-linecap="round"/>'
        )

    FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    dot_block = "\n    ".join(dots)

    svg = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="{FONT}">
  <!-- Yellow rounded frame with white inner panel -->
  <rect x="0" y="0" width="{W}" height="{H}" rx="40" ry="40" fill="#c5e84c"/>
  <rect x="18" y="18" width="{W-36}" height="{H-36}" rx="26" ry="26" fill="#ffffff"/>

  <!-- Headline -->
  <text x="{W/2}" y="135" text-anchor="middle" font-size="38" font-weight="700"
        fill="#000000" letter-spacing="-0.5">{HEADLINE}</text>

  <!-- QR data dots -->
  <g fill="#000000">
    {dot_block}
  </g>

  <!-- QR rounded finder patterns -->
{finders}

  <!-- Center knockout + tennis ball -->
  <rect x="{CX - BALL_PX/2:.3f}" y="{CY - BALL_PX/2:.3f}" width="{BALL_PX:.3f}" height="{BALL_PX:.3f}" fill="#ffffff"/>
  {tennis_ball(CX, CY, BALL_SIZE)}

  <!-- URL label -->
  <text x="{W/2}" y="{H-80}" text-anchor="middle" font-size="26" font-weight="600"
        fill="#000000" letter-spacing="0.5">{URL_LABEL}</text>
</svg>
'''

    poster_svg = tmp / "poster.svg"
    poster_svg.write_text(svg)

    # --- Rasterise to 1800×2400 PNG -----------------------------------------
    subprocess.check_call([
        "rsvg-convert", "-w", "1800", "-h", "2400", str(poster_svg), "-o", str(OUT_PNG),
    ])

print(f"wrote {OUT_PNG.relative_to(HERE)} ({OUT_PNG.stat().st_size:,} bytes)")
