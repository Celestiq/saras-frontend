# Prompt — Build Pricing Section

Create a responsive, accessible **Pricing Section** for the landing page. It should clearly present three plans: Daily Newsletter, Full Instant eBook, and Credits. Each plan must be displayed in a card layout with icons, price, features, and CTA buttons.

---

## Layout

- **Headline:** “Simple, Flexible Pricing”
- **Subhead:** “Choose how you want to learn — daily, instantly, or with credits for even more savings.”
- **Cards:** Place 3 cards horizontally on desktop, stacked vertically on mobile.
- **Highlight:** The Credits card should have a small “Most Value” badge.

---

## Pricing Cards

### Card 1 — Daily Newsletter
- **Icon:** Envelope
- **Title:** “$2 — 28 daily chapters”
- **Bullets:**
  - One chapter/day for 28 days
  - Builds consistent learning habit
  - Best for steady learners
- **CTA Button:** “Start Daily Learning”

### Card 2 — Full Instant eBook
- **Icon:** Open Book
- **Title:** “$3 — Full eBook now”
- **Bullets:**
  - Get entire book instantly
  - Learn at your own pace
  - Best for quick learners or urgent needs
- **CTA Button:** “Get eBook Instantly”

### Card 3 — Credits (Bulk Savings)
- **Icon:** Coins
- **Title:** “Credits — Best Value”
- **Pricing:** 
  - 10 credits = $9 ($0.90/ebook)
  - 20 credits = $15 ($0.75/ebook)
- **Bullets:**
  - 1 credit = 1 eBook (instant access)
  - Save more with bulk packs
  - Best for frequent learners
- **CTA Button:** “Buy Credits”

---

## Design Notes

- Use **rounded cards** with soft shadows.
- Use **contrasting accent colors** for CTAs.
- Newsletter card = calm/daily vibe.  
- eBook card = instant/binge vibe.  
- Credits card = highlight as “Most Value”.
- Add a **footer note below cards:**  
  - “Credits let you buy multiple eBooks at a reduced price. Perfect if you want to explore many topics.”

---

## Responsiveness & Accessibility

- On desktop: 3 cards in a row.  
- On mobile: stacked vertically.  
- Add ARIA labels to buttons.  
- Ensure all cards are keyboard-focusable.  

---

## Deliverables

- Component: `PricingSection` with 3 card subcomponents.  
- Props: None required (static pricing).  
- Output: Tailwind CSS (preferred) or minimal CSS.  
- Include placeholder icons (envelope, book, coins).  