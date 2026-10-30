# Character sprite assets

This directory is populated by `npm run sprites` or automatically before `npm run build`.

Generated output:
- 5 transparent SVG character portraits.
- 205 individual SVG animation frames (5 heroes × 6 animation sets).
- Each frame is a separate 256 × 256 image, with at least 24 px of safe padding and a fixed bottom-center foot anchor.
- Frames are not tightly packed or auto-trimmed. Phaser loads each frame as an independent texture, so hair, weapons, cloaks and effects do not get cut by atlas slicing.

Run:
```bash
npm run sprites
```

The generated `manifest.json` records frame counts, FPS, source paths and alignment rules. These are vector-style prototype assets; replace them with final commissioned art later while preserving the same frame contract.
