# Responsive review — 13 October 2026

## Character and room

`hero-scene.js` observes the hero, character and stage dimensions. It aligns the
room image's configured `hero.background.floorAnchor` with the rendered contact
point under the shoes, including after fonts and artwork load. The room keeps its
natural aspect ratio. `character-layers.js` draws the contact shadow and pivots
the grounded character at the feet; greetings no longer lift it off the floor.

## Browser checks

Tested local Chromium previews at widths **320, 390, 600, 768, 900, 1024, 1280,
1536 and 1920 CSS pixels**, plus **320 × 568** and **844 × 390** for short and
landscape screens. This covers representative sizes and the site's main layout
breakpoints, rather than every possible device/browser combination.

- All nine widths: no document horizontal overflow; header actions fit; inspected
  hero, personality, skills, project and contact text had no horizontal clipping.
- Floor anchor versus rendered shoe/contact point: difference rounded to **0 px**
  at all nine tested widths.
- Visually reviewed desktop/mobile hero floor placement, phone About/Contact and
  project cards, tablet Skills, and light/dark themes.
- Mobile section menu opens, navigates and closes; Escape closes it and returns
  focus to the toggle. Existing section labels remain JSON-driven.
- Resume menu fits at 320 px. Existing PDF link and local file were verified.
- UX/UI project filter returned KU Eater, EcoWear, Referite, Goodoo and PowerBank
  Lender. KU Eater and ByteArk detail dialogs opened and closed.
- Portrait and landscape detail panels remain inside the viewport with scrollable
  text and a visible close control; the Q&A dialog fits at 320 × 568.
- Small-phone intro video panel opens and closes inside the viewport.
- Mobile Q&A stops automatic movement, hides duplicate marquee copies, and keeps
  a native horizontally scrollable, keyboard-focusable region plus Show all.
- No browser console errors observed during the review. External destination
  pages and sending email/phone/share actions were not exercised.

## Fixes included

- Add a mobile/tablet navigation disclosure instead of hiding all section links.
- Wrap project links and long contact values; keep resume dropdown within the nav.
- Use dynamic viewport heights and scrollable detail content, including a split
  layout on short landscape screens.
- Reduce the mobile video tab footprint and unnecessary tablet skill-card height.
- Improve small evidence/contact label contrast in light mode.

Pre-change checkpoint: `4d3f7d9` (cozy hero background).

## Follow-up: room edge coverage and hero spacing

The user reported a right-edge gap at **863 × 1143**. The earlier floor-anchor
check verified foot alignment, but did not verify that the image reached both
horizontal edges. With a centered character, the off-center room anchor left
too little image to the right.

The image width now includes independent left/right coverage constraints, with
2 px overscan, while preserving the floor anchor and image aspect ratio.
Rechecked widths **320, 390, 600, 768, 863, 900, 901, 1024, 1280, 1536, 1920**:
both edges covered, no page overflow, and rounded foot-anchor error of 0 px.
Visually checked the reported 863 × 1143 size, desktop dark mode and mobile
light mode; no console errors observed.

The character is approximately 15–18% larger. Hero top padding is now 112 px on
desktop, 94 px on tablet, and 90 px on phone; the copy is aligned to the top so
the enlarged character does not reintroduce empty space above it.
Pre-fix checkpoint: `fcee21d`.

## Follow-up: available viewport height (24 October 2026)

Checkpoint: `a08689c`, confirmed pushed before editing.

- Hero heading size and spacing now respond to both width and small viewport
  height. Desktop character/stage dimensions reserve space for the fixed nav
  and the interaction caption. No fixed section height or text clipping.
- Preserve the content order: roles, introduction, links. On phones the
  character follows this complete group instead of separating text from links.
- Desktop checks: 1920x900, 1920x720, 1440x640, 1366x600, 1280x600,
  1024x600 and 901x600. All three CTA buttons and the character/caption fit
  in the opening viewport. At 1440x640 the CTA bottom is 567 px.
- Also checked 863x1143, 768x1024, 600x800, 390x844, 375x667, 320x568
  and 844x390. CTA buttons fit the first viewport except at 320x568 and
  844x390, where natural page scrolling preserves readable text and usable
  controls. On phones the illustration continues below the text and links.
- No horizontal page overflow or heading/nav overlap at these sizes. After
  resize layout settles, room edges remain covered and rounded floor-anchor
  error is 0 px. The final tablet adjustment also keeps the caption within
  768x1024 (bottom 1017 px).
- Visually checked desktop dark/light themes, 375x667 mobile and 768x1024
  tablet. Theme toggle, View Projects navigation, resume menu/link and the
  KU Eater detail dialog open/close were checked. External social destinations
  and actual PDF downloading were not exercised in this focused follow-up.

## Follow-up: soft cursor light and character hops (25 October 2026)

Checkpoint: `742296a`, pushed before editing.

- Added a warm, soft pointer light with separate light/dark colors and no
  pointer hit area. It hides on pointer exit, window blur, touch input and
  reduced-motion preference; updates are coalesced into animation frames.
- Character greetings use two rigid hops and a gentle sway, with a fixed floor
  shadow that shrinks/fades in flight. Pointer entry, click and occasional idle
  greetings trigger the movement; repeated input cannot restart a hop midair.
- Checked the live page at 1440x800 dark and 390x844 light. No horizontal
  overflow; clicks triggered positive hop heights and returned to 0.00.
  The cursor light followed the pointer with pointer-events: none. Theme
  switching worked and no browser console errors were recorded.
- Rechecked the mobile navigation: open menu remained visible while scrolling
  (menu-open scrolled at y=738.5), and the logo returned to the top.
- Both edited/new JavaScript files passed Node syntax checks. Touch and
  reduced-motion guards were inspected in code, not device-emulated.
