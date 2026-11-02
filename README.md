# Torch &amp; Vibrate — minimal PWA

A tiny installable web app for Android with two big buttons:

- 🔦 **Torch** — turns the phone's flashlight on/off (toggle).
- 📳 **Vibrate** — vibrates the phone in a short pattern on every press.

## Files

```
index.html            markup + 2 buttons
style.css             dark theme, big tap targets
app.js                torch (getUserMedia + torch constraint) + navigator.vibrate
manifest.webmanifest  PWA manifest
sw.js                 service worker (offline app shell)
icons/                app icons (any + maskable)
icons/make_icons.py   script that generated the icons
```

## Run it locally

```bash
cd torch-vibrate
python3 -m http.server 8080
```

Open `http://localhost:8080` in Chrome — `localhost` is a secure context, so the
torch works even over plain HTTP.

## Test it on a real Android phone

`getUserMedia()` (the API behind the torch) is **blocked on plain HTTP** on real
devices, so `http://192.168.x.x:8080` will show "Needs HTTPS". Use any of:

1. **A tunnel (easiest)**

   ```bash
   cloudflared tunnel --url http://localhost:8080
   # or: npx localtunnel --port 8080
   ```

   Open the printed `https://…` URL on the phone.

2. **Deploy for free** — push this folder to GitHub Pages, Netlify, or Vercel
   and use the `https://` URL.

3. **Chrome flag (dev only)** — open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
   on the phone, add `http://192.168.x.x:8080`, and relaunch Chrome.

## Install as an app

- Chrome: ⋮ menu → **Add to Home screen** / **Install app**
- The app then launches fullscreen (standalone) and works offline thanks to the
  service worker.

## Notes / limits

- The torch needs a camera that reports the `torch` capability (most Android phones).
  If it doesn't, the app says so instead of failing silently.
- Vibration only fires while the page is in the foreground, and only after a
  user gesture — which is exactly what a button press is.
- The camera is released when the app is backgrounded, so the torch turns off
  automatically.
- The torch turns on even when the screen is off on some devices, but Chrome
  may stop the camera stream when the app is backgrounded.
