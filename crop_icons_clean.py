import os
from PIL import Image

img_path = r'C:/Users/darkv/.gemini/antigravity/brain/fe0576a9-8d57-4342-bf10-3ab103f89eb2/.user_uploaded/media_1788760754793.jpg'
im = Image.open(img_path)
out_dir = r'public/images/sequence-icons'
os.makedirs(out_dir, exist_ok=True)

rows = [
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

icon_metadata = [
    {"id": "icon-01", "name": "Neel Kuranji (Blue Orchid)", "cat": "Flowers"},
    {"id": "icon-02", "name": "Burans (Rhododendron)", "cat": "Flowers"},
    {"id": "icon-03", "name": "Genda (Marigold)", "cat": "Flowers"},
    {"id": "icon-04", "name": "Gudhal (Red Hibiscus)", "cat": "Flowers"},
    {"id": "icon-05", "name": "Kamal (Water Lily)", "cat": "Flowers"},
    {"id": "icon-06", "name": "Santra (Nagpur Orange)", "cat": "Fruits"},
    {"id": "icon-07", "name": "Ananas (Pineapple)", "cat": "Fruits"},
    {"id": "icon-08", "name": "Kela (Fresh Bananas)", "cat": "Fruits"},
    {"id": "icon-09", "name": "Amrood (Guava)", "cat": "Fruits"},
    {"id": "icon-10", "name": "Litchi (Muzaffarpur Lychee)", "cat": "Fruits"},
    {"id": "icon-11", "name": "Peetal Kalash (Brass Pot)", "cat": "Heritage"},
    {"id": "icon-12", "name": "Tokri (Woven Cane Basket)", "cat": "Heritage"},
    {"id": "icon-13", "name": "Mitti ka Matka (Clay Pot)", "cat": "Heritage"},
    {"id": "icon-14", "name": "Mitti ka Diya (Clay Lamp)", "cat": "Heritage"},
    {"id": "icon-15", "name": "Pankha (Bamboo Hand Fan)", "cat": "Heritage"},
    {"id": "icon-16", "name": "Garam Chai (Steaming Tea)", "cat": "Daily Life"},
    {"id": "icon-17", "name": "Chawal ki Katori (Rice Bowl)", "cat": "Daily Life"},
    {"id": "icon-18", "name": "Baans Karil (Bamboo Shoots)", "cat": "Daily Life"},
    {"id": "icon-19", "name": "Gamusa (Traditional Towel)", "cat": "Daily Life"},
    {"id": "icon-20", "name": "Bodo Dokhona (Tribal Weave)", "cat": "Daily Life"},
    {"id": "icon-21", "name": "Jaapi (Assamese Sun Hat)", "cat": "Daily Life"},
    {"id": "icon-22", "name": "Chai Patti (Tea Leaves)", "cat": "Nature"},
    {"id": "icon-23", "name": "Dhanesh (Great Hornbill)", "cat": "Nature"}
]

icon_idx = 0
for r_idx, (y1, y2, cols, cat) in enumerate(rows):
    for c_idx, (x1, x2) in enumerate(cols):
        # 3px inset on all sides to guarantee no black borders or white gutters
        box = (x1 + 3, y1 + 3, x2 - 3, y2 - 3)
        cropped = im.crop(box)
        
        # Save as clean PNG
        filename = f"seq-icon-{icon_idx+1:02d}.png"
        save_path = os.path.join(out_dir, filename)
        cropped.save(save_path, "PNG", quality=98)
        icon_idx += 1

print(f"Successfully re-saved {icon_idx} clean icons!")
