import os, shutil, json

os.makedirs('public/images', exist_ok=True)
os.makedirs('src/components', exist_ok=True)
os.makedirs('src/config', exist_ok=True)

# Copy extracted assets
for name in ['garden-gathering.jpg', 'caregiver-reminder.jpg', 'hands-photograph.jpg', 'marigold-footer.jpg']:
    src = os.path.join('extracted_assets', name)
    dst = os.path.join('public', 'images', name)
    shutil.copy(src, dst)
    print(f"Copied {src} -> {dst}")

hero_brain = r'C:\Users\darkv\.gemini\antigravity\brain\fe0576a9-8d57-4342-bf10-3ab103f89eb2\hero_couple_1788724649848.jpg'
dst_hero = os.path.join('public', 'images', 'hero-couple.jpg')
shutil.copy(hero_brain, dst_hero)
print(f"Copied {hero_brain} -> {dst_hero}")

pkg = {
  "name": "smritisathi",
  "private": True,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "clsx": "^2.1.1",
    "framer-motion": "^12.4.7",
    "lucide-react": "^1.16.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^3.0.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.1.1"
  }
}

with open('package.json', 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2)

print("Setup completed successfully!")
