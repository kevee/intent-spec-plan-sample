# Accessibility

**Standard:** WCAG 2.2 Level AA, with AAA where it's cheap.
**Where we stand:** `docs/accessibility-conformance.md`.
**Checked by:** an axe scan at the end of every Playwright page test, plus the checklist below.

## Checklist for UI changes

1. **Native elements first ---** `<button>`, `<a>`, `<input>`, `<select>`. Never put `onClick` on a `<div>` or `<span>`.
2. **Labels ---** every input has a visible label. Use `TextField`, which wires the label, the error and `aria-describedby` for you. A placeholder is never the label.
3. **Errors ---** say what's wrong and how to fix it, next to the field, through `FieldError` (`role="alert"`). Never disable a submit button without saying why.
4. **Outcomes ---** a result the user needs to hear, like a confirmation, goes in a `StatusMessage` (`role="status"`).
5. **Color ---** never the only signal. A full shift says **Full** in text. Text contrast at least 4.5:1, borders and focus rings at least 3:1.
6. **Focus ---** always visible. When content replaces the control that had focus (the form becoming a confirmation), focus moves somewhere sensible, not to the top of the page.
7. **Targets ---** at least 24 by 24 CSS pixels, and 44 by 44 for buttons.
8. **Structure ---** one `<h1>` per page, headings in order, landmarks (`<header>`, `<main>`), and the skip link in `layout.tsx` stays first.
9. **Tab order ---** only `tabIndex={0}` or `tabIndex={-1}`, never a positive value.

## When a spec needs a pattern the app doesn't have

Drag and drop, custom date pickers, combo boxes, content that updates on its own, time limits, anything signalled by color: each is an accessibility concern in the spec, with the WCAG criteria it touches and the row in `docs/accessibility-conformance.md` it could move. Offer the accessible alternative alongside it (a native control, a list instead of a board, text next to color).
