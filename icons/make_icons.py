from PIL import Image, ImageDraw

def make(size, pad_ratio, path):
    S = size * 4
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # background (full bleed square; Android applies its own mask)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=S * 0.22, fill=(17, 19, 24, 255))

    cx, cy = S / 2, S * 0.56
    r = S * 0.16 * (1 - pad_ratio * 0.35)

    # light beam (cone) above the bulb
    beam = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beam)
    top = S * (0.10 + pad_ratio * 0.10)
    spread = S * 0.30
    bd.polygon([(cx - spread, top), (cx + spread, top), (cx + r * 0.75, cy - r * 0.7), (cx - r * 0.75, cy - r * 0.7)],
               fill=(255, 176, 32, 70))
    beam = beam.filter(__import__("PIL.ImageFilter", fromlist=["GaussianBlur"]).GaussianBlur(S * 0.02))
    img = Image.alpha_composite(img, beam)
    d = ImageDraw.Draw(img)

    # rays
    ray = S * 0.055
    gap = r * 1.55
    for ang in (-60, -30, 0, 30, 60):
        import math
        a = math.radians(ang - 90)
        x1 = cx + math.cos(a) * gap
        y1 = cy + math.sin(a) * gap
        x2 = cx + math.cos(a) * (gap + ray)
        y2 = cy + math.sin(a) * (gap + ray)
        d.line([x1, y1, x2, y2], fill=(255, 176, 32, 255), width=int(S * 0.022))

    # bulb
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 199, 66, 255))
    d.ellipse([cx - r * 0.45, cy - r * 0.55, cx + r * 0.30, cy + r * 0.10], fill=(255, 240, 200, 255))

    # base of the torch
    d.rounded_rectangle([cx - r * 0.75, cy + r * 0.85, cx + r * 0.75, cy + r * 1.55],
                        radius=r * 0.22, fill=(70, 78, 94, 255))

    img.resize((size, size), Image.LANCZOS).save(path)
    print("wrote", path)

make(192, 0.0, "icons/icon-192.png")
make(512, 0.0, "icons/icon-512.png")
make(512, 0.6, "icons/icon-maskable-512.png")
