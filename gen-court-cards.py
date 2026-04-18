"""
Generate court-number cards (court-1.png ... court-4.png).

Clay terracotta background (#c66c4d — matches the clay-court color used
elsewhere in the site), white numeral, white "TEREN" label, white
"tenniskosmos.com" footer. 1800x2400, ready to print portrait.

Run:  python3 gen-court-cards.py
"""

from PIL import Image, ImageDraw, ImageFont

W, H = 1800, 2400

CLAY = (198, 108, 77)   # #c66c4d
WHITE = (255, 255, 255)

FONT_BOLD = "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"


def font(size):
    return ImageFont.truetype(FONT_BOLD, size)


def text_centered(draw, xy, text, f, fill=WHITE):
    l, t, r, b = draw.textbbox((0, 0), text, font=f)
    tw, th = r - l, b - t
    cx, cy = xy
    draw.text((cx - tw / 2 - l, cy - th / 2 - t), text, font=f, fill=fill)


def make_card(number: int, out_path: str) -> None:
    img = Image.new("RGB", (W, H), CLAY)
    d = ImageDraw.Draw(img)

    text_centered(d, (W // 2, 420), "TEREN", font(190))
    d.rectangle([W // 2 - 240, 560, W // 2 + 240, 572], fill=WHITE)
    text_centered(d, (W // 2, H // 2 + 90), str(number), font(1500))
    text_centered(d, (W // 2, H - 180), "tenniskosmos.com", font(78))

    img.save(out_path, "PNG")


if __name__ == "__main__":
    for n in (1, 2, 3, 4):
        make_card(n, f"court-{n}.png")
        print(f"court-{n}.png")
