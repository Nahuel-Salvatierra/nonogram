from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / 'resources' / 'icon.png'
BRAND = (216, 239, 252, 255)
NAVY = (15, 55, 110, 255)


def fit_on_canvas(src: Image.Image, size: int, scale: float = 1.0) -> Image.Image:
  canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
  target = max(1, int(size * scale))
  icon = src.resize((target, target), Image.Resampling.LANCZOS)
  offset = (size - target) // 2
  canvas.alpha_composite(icon, (offset, offset))
  return canvas


def make_splash(master: Image.Image, width: int, height: int) -> Image.Image:
  image = Image.new('RGBA', (width, height), BRAND)
  side = int(min(width, height) * 0.42)
  icon = master.resize((side, side), Image.Resampling.LANCZOS)
  image.alpha_composite(icon, ((width - side) // 2, (height - side) // 2))
  return image.convert('RGB')


def main() -> None:
  master = Image.open(MASTER).convert('RGBA')
  if master.size != (1024, 1024):
    raise SystemExit(f'Expected 1024x1024 icon at {MASTER}, got {master.size}')

  store = ROOT / 'store-listing'
  public = ROOT / 'public'
  res = ROOT / 'android' / 'app' / 'src' / 'main' / 'res'
  store.mkdir(exist_ok=True)

  master.resize((512, 512), Image.Resampling.LANCZOS).save(store / 'icon-512.png', 'PNG')
  master.save(store / 'icon-1024.png', 'PNG')

  mipmap_sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  }
  foreground_sizes = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
  }

  for folder, size in mipmap_sizes.items():
    out = res / folder
    out.mkdir(parents=True, exist_ok=True)
    icon = fit_on_canvas(master, size)
    icon.save(out / 'ic_launcher.png', 'PNG')
    icon.save(out / 'ic_launcher_round.png', 'PNG')

  for folder, size in foreground_sizes.items():
    out = res / folder
    fit_on_canvas(master, size, 0.92).save(out / 'ic_launcher_foreground.png', 'PNG')

  splash_specs = {
    'drawable': (480, 320),
    'drawable-port-mdpi': (320, 480),
    'drawable-port-hdpi': (480, 800),
    'drawable-port-xhdpi': (720, 1280),
    'drawable-port-xxhdpi': (960, 1600),
    'drawable-port-xxxhdpi': (1280, 1920),
    'drawable-land-mdpi': (480, 320),
    'drawable-land-hdpi': (800, 480),
    'drawable-land-xhdpi': (1280, 720),
    'drawable-land-xxhdpi': (1600, 960),
    'drawable-land-xxxhdpi': (1920, 1280),
  }
  for folder, (width, height) in splash_specs.items():
    out = res / folder
    out.mkdir(parents=True, exist_ok=True)
    make_splash(master, width, height).save(out / 'splash.png', 'PNG')

  make_splash(master, 2732, 2732).save(ROOT / 'resources' / 'splash.png', 'PNG')

  master.resize((192, 192), Image.Resampling.LANCZOS).save(public / 'icon-192.png', 'PNG')
  master.resize((512, 512), Image.Resampling.LANCZOS).save(public / 'icon-512.png', 'PNG')
  master.resize((64, 64), Image.Resampling.LANCZOS).save(public / 'favicon.png', 'PNG')

  feature = Image.new('RGBA', (1024, 500), BRAND)
  draw = ImageDraw.Draw(feature)
  draw.rectangle((0, 0, 16, 500), fill=(37, 99, 160, 255))
  icon_side = 340
  icon = master.resize((icon_side, icon_side), Image.Resampling.LANCZOS)
  feature.alpha_composite(icon, (72, (500 - icon_side) // 2))
  try:
    title_font = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 96)
    subtitle_font = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 36)
  except OSError:
    title_font = ImageFont.load_default()
    subtitle_font = title_font
  draw.text((460, 160), 'Nonogram', fill=NAVY, font=title_font)
  draw.text((460, 280), 'Puzzles de lógica', fill=(37, 99, 160, 230), font=subtitle_font)
  feature.convert('RGB').save(store / 'feature-graphic-1024x500.png', 'PNG')

  print('Brand assets regenerated from', MASTER)


if __name__ == '__main__':
  main()
