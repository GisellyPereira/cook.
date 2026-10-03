"""Regenerate the typographic brand assets (optional: Python + Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets' / 'brand'
SERIF = ROOT / 'node_modules/@expo-google-fonts/dm-serif-display/400Regular/DMSerifDisplay_400Regular.ttf'
SANS = ROOT / 'node_modules/@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf'
INK, ACCENT, PAPER = '#272822', '#AD4C35', '#FBF9F5'
ASSETS.mkdir(parents=True, exist_ok=True)


def wordmark(image, size, top, signature=True):
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(str(SERIF), size)
    width = draw.textlength('cook.', font=font)
    left = (image.width - width) / 2
    origin = top - font.getbbox('cook.', anchor='la')[1]
    draw.text((left, origin), 'cook', fill=INK, font=font, anchor='la')
    period_left = left + draw.textlength('cook', font=font)
    draw.text((period_left, origin), '.', fill=ACCENT, font=font, anchor='la')
    if signature:
        label = 'F R O M  T H I S'
        sans = ImageFont.truetype(str(SANS), int(size * .115))
        label_width = draw.textlength(label, font=sans)
        draw.text(((image.width-label_width)/2, top + size*.9), label, fill=INK, font=sans, anchor='lt')


splash = Image.new('RGBA', (1000, 500), (0, 0, 0, 0))
wordmark(splash, 300, 70, signature=False)
splash = splash.crop(splash.getbbox())
# Transparent margin; the native screen supplies the full-screen background.
framed_splash = Image.new('RGBA', (splash.width + 64, splash.height + 64), (0, 0, 0, 0))
framed_splash.paste(splash, (32, 32))
splash = framed_splash
splash.save(ASSETS / 'splash-wordmark.png')
icon = Image.new('RGB', (1024, 1024), PAPER)
wordmark(icon, 285, 360)
icon.save(ASSETS / 'icon.png')
adaptive = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
wordmark(adaptive, 285, 360)
adaptive.save(ASSETS / 'adaptive-icon.png')
favicon = Image.new('RGB', (96, 96), PAPER)
draw = ImageDraw.Draw(favicon)
font = ImageFont.truetype(str(SERIF), 80)
draw.text((17, -5), 'c', font=font, fill=INK)
draw.ellipse((68, 70, 75, 77), fill=ACCENT)
favicon.save(ASSETS / 'favicon.png')
print('Generated splash, app icon, adaptive icon and favicon.')
