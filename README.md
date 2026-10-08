# StumpScore Marketing & APK Download Web App

This is the standalone marketing landing page and APK distribution web application for **StumpScore**.

## 🚀 Key Features

1. **Direct 1-Click APK Download**: Serves `downloads/stumpscore-release.apk` with automatic MIME attachment headers.
2. **Interactive Scorecard Simulator**: Visitors can score live deliveries (+1, +2, +4, +6, Wicket, Wide), rotate strike, track partnerships, and hear synthesized sound effects in real time.
3. **3D CSS Phone Mockup**: Shows the live scoring interface with real-time match stats.
4. **8-Card Core Feature Showcase**: Details the app's scoring engine, dismissals, tournaments (ICC NRR), leaderboards, sound effects, and squad management.
5. **3-Step Android Sideloading Install Guide**: Clear visual instructions for users installing APKs on Android.
6. **Built-in Modals**: Privacy Policy, Terms of Service, and Contact Us form.
7. **Stadium Dark & Crisp Light Themes**: Toggleable with persistent localStorage preferences.

---

## 📦 Deployment Instructions (Vercel)

Deploying to Vercel is seamless and configured via `vercel.json`:

```bash
cd cricket-scoring-webapp
npx vercel login
npx vercel --prod
```

Your live web app URL: **`https://cricket-scoring-webapp.vercel.app`**

---

## 💻 Local Preview
To test locally, you can use Python, Node, or any static server:
```bash
cd cricket-scoring-webapp
# Python:
python -m http.server 8080

# Or Node npx:
npx serve .
```
Then visit `http://localhost:8080` in your browser.
