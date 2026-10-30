# 三國亂世：群雄爭霸

Mobile-first Three Kingdoms Roguelite prototype built with Phaser 3 + React + TypeScript + Vite.

## Current prototype
- Five selectable heroes: 呂布、趙雲、諸葛亮、關羽、黃忠.
- Landscape-first responsive battlefield.
- Dynamic touch joystick: touch anywhere in the left half; joystick appears at the touch point and follows the drag. No fixed joystick and no dodge button.
- Right side has one hero ultimate button.
- Normal attacks are automatic; movement is used to evade enemy projectiles and enemy positioning.
- XP level-up pauses battle and shows three large skill cards.
- Basic enemy waves, aimed projectiles, boss arrival and results screen.
- PWA manifest and Fullscreen API request after the user taps 開始遊戲. Browser support varies; Add-to-Home-Screen provides standalone mode where supported.

## Local development
```bash
npm install
npm run dev
npm run sprites   # generate 205 individual animation SVG frames + 5 portraits
npm run build     # sprite generation is included automatically
```

## Cloudflare Pages
1. Push this repository to GitHub.
2. In Cloudflare Pages choose Create project > Connect to Git.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Build output directory: `dist`.
6. No secrets or backend bindings are required for this single-player prototype.

## Touch model
- Pointer Events with separate pointer IDs allow movement and ultimate activation together.
- Left half: dynamic floating joystick, origin resets on every new touch.
- Right-side ultimate area: tap to cast when charged.
- Keyboard: WASD / arrow keys move. Space triggers the ultimate (wired in the combat scene).
- No attack button and no separate dodge button.

## Art pipeline
See [src/assets/README.md](src/assets/README.md) and `src/game/assets/animationManifest.ts`.
Spritesheet source must consist of one transparent PNG per frame. Every frame is 256x256, has at least 24px of safe padding, a fixed bottom-center foot anchor, and is packed with a 24px gutter. Do not trim cells. FX are separate atlases. This avoids clipping weapons, hair, capes, and animation silhouettes.

## Important scope note
This is a playable frontend prototype, not yet the complete online game. Multiplayer matchmaking, authoritative server simulation, accounts, inventory persistence, gacha, loot chests and real reward delivery are not implemented yet. The current combat timings and balancing are initial test values.
