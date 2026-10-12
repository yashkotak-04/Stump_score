# StumpScore Promo Video: Video Editing & Post-Production Guide

**Editing Software Supported:** Adobe Premiere Pro, DaVinci Resolve, Final Cut Pro, CapCut Desktop  
**Sequence Settings:** 1080 x 1920 (9:16 Vertical) | 60.00 FPS | Square Pixels (1.0) | Rec.709  

---

## 1. Timeline Layout & Track Organization

* **Video Track 5 (V5):** Graphic overlays, safety margins, callouts, and download badges.
* **Video Track 4 (V4):** Dynamic on-screen animated typography and kinetic captions.
* **Video Track 3 (V3):** UI mockups, 3D floating phone renders, and screen recording screencasts.
* **Video Track 2 (V2):** B-roll cricket action footage and stadium cinematic clips.
* **Video Track 1 (V1):** Background textures, mesh gradients, and dark stadium vignettes.
* **Audio Track 1 (A1):** Voiceover Dialogue (Mastered with Compressor & De-esser, normalized to -14 LUFS).
* **Audio Track 2 (A2):** Sound Effects (SFX) — Impacts, whooshes, UI clicks, bat cracks.
* **Audio Track 3 (A3):** Background Music (BGM) — Auto-ducked by -6dB whenever VO is active.

---

## 2. Pacing, Speed Ramps & Motion Transitions

1. **The Hook Cut (00:00 – 00:05):**
   * Cut on the beat of the pencil scratches.
   * Add camera handheld micro-shake (Shake effect: amplitude 0.2, frequency 1.5).
   * **Transition into Reveal:** Directional Whip-Pan to the left (12 frames) with Motion Blur enabled (180° shutter angle).
2. **UI Screen Interactions (00:05 – 00:27):**
   * Apply a **Speed Ramp**: Start at 100% speed, accelerate to 250% during scrolling, decelerate back to 100% on the moment a button is pressed (Speed Ramp Curve: Bezier smooth ease).
   * Zoom punches: Add a 105% to 112% digital push-in on key taps (`+4`, `+6`, `WICKET`) timed exactly to the SFX bat crack.
3. **Poster Expansion (00:27 – 00:32):**
   * 3D Card Extrusion: Use 3D DVE or Basic 3D effect in Premiere/DaVinci.
   * Rotate Y: from -15° to 0° over 18 frames with Exponential Ease-Out.

---

## 3. Kinetic Typography & On-Screen Text

* **Primary Font:** **Outfit** (ExtraBold 800 / Black 900)
* **Secondary / Numbers Font:** **JetBrains Mono** or **Inter** (Bold 700)
* **Color Palette:**
  * Primary: Pure White (`#FFFFFF`)
  * Highlight Brand: Pitch Green (`#00E676`)
  * Accent Social: Radiant Gold (`#F59E0B`) / Cyber Cyan (`#38BDF8`)
* **Text Animation Preset:**
  * Pop-in scale (0% to 108% to 100% over 8 frames).
  * 2-word kinetic subtitle highlighting: Current spoken word lights up in `#00E676` while remaining words stay in white.

---

## 4. Color Grading (LUT & Visual Tone)

* **Contrast:** High-contrast modern sports commercial look. Deep inky blacks (`#0B1326`), vibrant greens and stadium floodlight golds.
* **LUT Recommendation:** Clean Commercial Pop or Teal & Orange Sports variant modified with green midtone push.
* **Highlights:** Soft roll-off on smartphone screens to prevent blown-out whites.
* **Vignette:** Subtle -0.8 oval vignette on bottom corners to guide viewer focus to the center UI actions.

---

## 5. Master Export Specifications

* **Format:** MP4 (H.264 / AVC) or ProRes 422 for master archive.
* **Resolution:** 1080 x 1920 (Vertical 9:16)
* **Target Bitrate:** 24 – 32 Mbps (VBR 2-Pass) for ultra-sharp mobile compression resistance on Instagram & TikTok.
* **Audio:** AAC Stereo, 320 kbps, 48 kHz.
* **Safe Area Check:** Ensure all critical UI elements and captions stay within the **central 1080 x 1420 box** to avoid obstruction by Instagram Reels/TikTok UI buttons (Like, Comment, Share, Description).
