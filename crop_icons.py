import os
from PIL import Image

img_path = r'C:/Users/darkv/.gemini/antigravity/brain/fe0576a9-8d57-4342-bf10-3ab103f89eb2/.user_uploaded/media_1788760754793.jpg'
im = Image.open(img_path)
out_dir = r'public/images/game-icons'
os.makedirs(out_dir, exist_ok=True)

# Row Y ranges (top, bottom of image inside borders)
# Row 1: y 5 to 146
# Row 2: y 153 to 283
# Row 3: y 289 to 416
# Row 4: y 424 to 548
# Row 5: y 557 to 672

rows = [
    # (y1, y2, [(x1, x2), ...], name_prefix)
    (5, 146, [
        (6, 201),   # 1. blue orchid
        (208, 404), # 2. rhododendron
        (412, 612), # 3. marigold
        (618, 816), # 4. red hibiscus
        (823, 1018) # 5. purple water lily
    ], "flower"),
    (153, 283, [
        (6, 201),   # 6. oranges
        (208, 404), # 7. pineapple
        (412, 612), # 8. bananas
        (618, 816), # 9. guava
        (823, 1018) # 10. lychee
    ], "fruit"),
    (289, 416, [
        (6, 201),   # 11. brass kalash
        (208, 404), # 12. cane basket
        (412, 612), # 13. clay matka
        (618, 816), # 14. burning diya
        (823, 1018) # 15. hand fan
    ], "heritage"),
    (424, 548, [
        (6, 201),   # 16. tea cup
        (208, 391), # 17. rice bowl
        (397, 517), # 18. bamboo shoots
        (523, 688), # 19. gamusa
        (694, 851), # 20. textile
        (857, 1018) # 21. jaapi hat
    ], "daily"),
    (557, 672, [
        (6, 201),   # 22. tea leaves
        (208, 391)  # 23. hornbill bird
    ], "nature")
]

saved_icons = []
icon_idx = 1

for r_idx, (y1, y2, cols, cat) in enumerate(rows):
    for c_idx, (x1, x2) in enumerate(cols):
        # Crop inner area (inset by 1-2px to avoid the black border line)
        box = (x1 + 1, y1 + 1, x2 - 1, y2 - 1)
        cropped = im.crop(box)
        
        # Check if cropped is essentially white/blank
        # Sample center or check variance
        stat = cropped.convert('L')
        extrema = stat.getextrema()
        if extrema[0] > 240 and extrema[1] > 240:
            print(f"Skipping empty cell at row {r_idx+1}, col {c_idx+1}")
            continue

        filename = f"icon-{icon_idx:02d}.png"
        save_path = os.path.join(out_dir, filename)
        cropped.save(save_path, "PNG", quality=95)
        saved_icons.append((filename, cropped.size, cat))
        print(f"Saved {filename} ({cropped.size[0]}x{cropped.size[1]}) - {cat}")
        icon_idx += 1

print(f"\nTotal cropped icons saved: {len(saved_icons)}")
