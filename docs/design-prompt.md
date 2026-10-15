# PhishGuardAI design prompts

Reusable prompts for rebuilding this UI (single-input tool, calm light theme) in a different domain. Change only the words in `[BRACKETS]`, or the headline, result words and example chips in the design-only prompt.

- [1. Design-only prompt](#1-design-only-prompt): visual design, components and motion.
- [2. Full build prompt](#2-full-build-prompt): design plus user flow and tech stack.
- [Filling it in for another domain](#filling-it-in-for-another-domain)
- [Tips for consistent results](#tips-for-consistent-results)

---

## 1. Design-only prompt

```
Design a single-purpose web tool page. Light theme, minimal, calm and trustworthy.
It should feel hand-designed by a careful person, not generated from a template.

LAYOUT
- One centred column, max width 48rem, generous whitespace, body text left-aligned.
- Landing view: a plain headline phrased as a question ("Is this [thing] OK?") in 2.6rem
  to 3.75rem, one short line of muted subtext, then ONE large pill-shaped input with a
  solid "Check" button inside it, and three small example chips underneath.
  Nothing else above the fold.

VISUAL STYLE
- Background #fbfaf8, text #15171a, muted text #6a6f76, hairlines #e8e6e1.
- Result colours, used only for results and severities:
  good #15803d (tint #effaf2, edge #b7e4c4)
  middle #b45309 (tint #fff8e6, edge #f2d58a)
  bad #c81e1e (tint #fdf0ef, edge #f4b9b4)
- Buttons are solid near-black pills with white text. Secondary buttons are white
  pills with a hairline border.
- Fonts: Bricolage Grotesque for headings, Instrument Sans for body, JetBrains Mono for the
  input and anything technical. Never Inter, Geist or Space Grotesk.
- Shapes: pills for input, buttons and chips; 2rem radius for the main result panel;
  1rem for smaller cards. Only the input and the dropdown get a soft, wide, low-opacity
  shadow. Everything else is flat with hairline borders.

KEY COMPONENTS
- Input: white pill, 1px faint ring, turns into a 2px near-black ring on focus. Mono text.
  A small "/" key hint at the right when empty.
- Recent dropdown: appears under the input on focus when empty. White rounded panel,
  each row has a coloured dot, the text in mono, and the result label on the right.
- Loading: the headline folds away, the input stays at the top, and a spinning ring
  (an arc on a faint circle) appears with muted status text that changes every half second.
- Result panel: large rounded panel tinted with the result colour. Left: a 132px score ring
  that fills from 0 and counts the number up. Right: a big headline, a one-sentence
  summary. Underneath: the user's input in a mono chip on a white background, with the key
  part highlighted as a near-black chip with white text.
- Findings: a vertical timeline with a thin hairline on the left. Each entry has a coloured
  dot, a small uppercase severity label, a medium-weight title and a muted explanation.
  Worst findings first.
- Steps: numbered rows, each in a white rounded card with a small near-black numbered
  circle.
- Actions: a solid pill "Check another" and an outlined pill "Copy report".
- Details: a collapsed white rounded section called "Technical details".
- Below the tool: "How it works" as three plain numbered columns (large faint numerals,
  no cards) and a collapsed "See every rule" list. A one-line footer disclaimer.

MOTION
- Result sections rise in with a short stagger. The ring fills and counts up for about a
  second. Chips lift 2px on hover. Buttons shrink slightly when pressed.
- A good result gets a brief confetti burst (green, yellow, near-black, off-white).
- Respect prefers-reduced-motion by turning all of this off.

COPY
- Short, plain, specific sentences. No marketing words such as "powerful", "seamless" or
  "revolutionary". Explain things like you would to a friend.

NEVER USE (these make a design look AI-generated)
Gradients, glows, glassmorphism, blurred blobs, emoji or icon tiles above headings,
eyebrow pill labels above the headline, a row of three feature cards, purple or indigo
accents, pure black backgrounds, cards nested inside cards, stock names or invented
statistics.
```

---

## 2. Full build prompt

Use this when you want the assistant to build the whole app, not just design it.

````
Build a single-page web app called [PRODUCT NAME]. Stack: Next.js (App Router, JavaScript)
+ Tailwind CSS v4 for the frontend, and an Express API for the backend.

PURPOSE
The user pastes/enters [WHAT THE USER ENTERS: e.g. a URL, a resume, an email address,
a product link]. The app analyses it and returns one of three verdicts:
[GOOD STATE], [MIDDLE STATE], [BAD STATE], with a 0-100 [SCORE NAME] and a list of
findings that explain the verdict. The API returns JSON:
{ label, score, flags: [{ title, severity: "high" | "medium" | "good", detail }],
  features: {...}, error? }.

USER FLOW (follow exactly)
1. Landing: centred headline "[QUESTION IN PLAIN WORDS]?" + one-line subtext, then ONE
   large pill-shaped input with a "Check" button inside it, and 3 clickable example chips
   under it. Nothing else above the fold.
2. Focusing the empty input shows a "Recent" dropdown of the last 5 checks (saved in
   localStorage, each with a coloured dot and its label, with a Clear button).
3. On submit: the headline folds away smoothly so the input stays at the top. Show a
   spinning ring with status text that cycles ("[STEP 1]...", "[STEP 2]...", ...). Keep this
   state visible at least 1.8 seconds.
4. Result appears in place:
   a. Verdict panel: large rounded (2rem) panel tinted green/amber/red, containing a
      132px SVG score ring that fills from 0 and counts the number up, a headline
      ("[GOOD HEADLINE]" / "[MIDDLE HEADLINE]" / "[BAD HEADLINE]"), a one-sentence
      summary, and the input shown in a mono chip with the key part highlighted.
   b. "What we found": a vertical timeline. Each finding is a coloured dot + small
      uppercase severity label + title + plain-language explanation. Worst first.
   c. "What to do": 2-3 numbered steps, each in a white rounded card.
   d. Buttons: "Check another [THING]" (solid, scrolls to top and refocuses the input) and
      "Copy report" (outlined, copies the JSON).
   e. A collapsed "Technical details" section (key facts + raw JSON).
5. Good verdict only: a 2-second confetti burst on a canvas (skip when the user prefers
   reduced motion).
6. Below the tool: a short "How it works" section with 3 numbered steps in plain columns
   (no cards), and a collapsed "See every rule" list. Footer: one-line disclaimer.
7. Keyboard: "/" focuses the input, Enter submits, Esc resets.
8. Errors (bad input, API down) show as a soft red rounded notice with a plain message.

VISUAL DESIGN (strict)
- Light theme only. Page background #fbfaf8, text #15171a, muted #6a6f76,
  hairlines #e8e6e1.
- Verdict colours: good #15803d (tint #effaf2, edge #b7e4c4), middle #b45309
  (tint #fff8e6, edge #f2d58a), bad #c81e1e (tint #fdf0ef, edge #f4b9b4).
  Colour is used ONLY for verdicts and severities. Buttons are solid near-black.
- Fonts via next/font/google: Bricolage Grotesque for headings, Instrument Sans for body,
  JetBrains Mono for inputs and URLs. Never use Inter, Geist or Space Grotesk.
- Shape: big rounded corners (pills for input and buttons, 1.5-2rem for panels), soft
  large low-opacity shadows only on the main input and dropdown, otherwise flat.
- Layout: centred column, max width 48rem, generous whitespace, left-aligned body text.
- Motion: subtle only (rise-in on result sections, count-up ring, small hover lift on chips,
  button press scale). Respect prefers-reduced-motion.

NEVER DO (these make a UI look AI-generated)
No gradients, glows, glassmorphism or blurred blobs. No emoji or icon tiles above
headings. No eyebrow pill labels above the headline. No row of three feature cards. No
purple/indigo or neon accents. No pure black background. No nested cards. No stock
placeholder names or invented statistics. No "revolutionary / seamless / powerful" copy:
write short, plain, specific sentences.

CODE
Small, readable components: Scanner (form, state machine idle|scanning|done|error,
history), Result (verdict panel, timeline, steps, details), Ring (spinner + score ring),
Confetti. Colours and fonts defined once as Tailwind theme tokens in globals.css. Express
endpoint POST /api/analyze with CORS, input validation (400 with { error } on bad input).
After building, run it and check the landing, loading, each verdict, an error, and a
390px-wide mobile view, then fix anything that overflows or looks off.
````

---

## Filling it in for another domain

| Placeholder | Phishing app (this project) | Example: resume checker |
|---|---|---|
| Thing the user enters | a URL | a resume (pasted text) |
| Three states | Safe / Suspicious / Malicious | Strong / Needs work / Weak |
| Question headline | "Is this link safe?" | "Is your resume ready?" |
| Status steps | Reading the address, Asking the AI model | Reading your resume, Scoring each section |
| Findings | look-alike domain, no HTTPS | missing summary, no metrics |

## Tips for consistent results

- **Attach screenshots.** Give the assistant 2 screenshots of this UI (landing page and a result) and say "match this exactly". Screenshots anchor the look better than words alone.
- **Check the score direction.** Here a high score is bad ("risk"). If your domain scores "higher is better", say so and swap the ring colours.
- **Reuse the tokens.** Copy `frontend/app/globals.css` and `frontend/app/layout.js` into the new project so fonts and colours stay identical.
- **Keep the source of truth.** The live implementation is in `frontend/components/` (`Scanner.js`, `Result.js`, `Ring.js`, `Confetti.js`). When the design changes, update this file too.
