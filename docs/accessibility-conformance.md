# Accessibility conformance

Fairview Volunteers targets WCAG 2.2 Level AA. This page records where the app stands on each criterion that applies to it, so a spec can say exactly which row a change would move.

**Note:** this is a lightweight stand-in for a full Voluntary Product Accessibility Template. It lists only the criteria the app's two pages touch today. When a story adds a pattern that brings a new criterion into play, add its row in the same PR.

**Conformance levels:**

- **Supports ---** the app meets the criterion with no known exceptions.
- **Partially supports ---** some of the app doesn't meet it. The remarks say which part.
- **Does not support ---** most of the app doesn't meet it.
- **Not applicable ---** the app has nothing the criterion covers.

| Criterion | Level | Conformance | Remarks |
| --- | --- | --- | --- |
| 1.1.1 Non-text content | A | Supports | The app has no images or icons. Everything is text. |
| 1.3.1 Info and relationships | A | Supports | Headings, lists and landmarks mark the structure. Every form field has a programmatic label. |
| 1.3.5 Identify input purpose | AA | Supports | The name and email fields declare `autocomplete`. |
| 1.4.1 Use of color | A | Supports | A full shift says "Full" in text. Errors are text, not only a red border. |
| 1.4.3 Contrast (minimum) | AA | Supports | All text meets 4.5:1, checked by axe on every page. |
| 1.4.10 Reflow | AA | Supports | Every page works at 320 CSS pixels wide with no sideways scrolling. |
| 1.4.11 Non-text contrast | AA | Supports | Field borders and the focus ring meet 3:1. |
| 2.1.1 Keyboard | A | Supports | Everything works from the keyboard. An end-to-end test completes a sign-up with the keyboard alone. |
| 2.4.1 Bypass blocks | A | Supports | A skip link is the first thing on every page. |
| 2.4.3 Focus order | A | Supports | Focus follows reading order. After a sign-up, focus moves to the confirmation. |
| 2.4.7 Focus visible | AA | Supports | Every control has a visible focus ring. |
| 2.5.8 Target size (minimum) | AA | Supports | Buttons are at least 44 by 44 CSS pixels; links in the shift list have room around them. |
| 3.3.1 Error identification | A | Supports | Each error names the field and says what's wrong. |
| 3.3.2 Labels or instructions | A | Supports | Every field has a visible label. |
| 4.1.2 Name, role, value | A | Supports | Native HTML controls only. |
| 4.1.3 Status messages | AA | Supports | Confirmations use `role="status"`, and field errors use `role="alert"`. |

## How to update this page

- **Change a row ---** in the same PR as the change that moves it, and say so in the PR description. A row that drops below **Supports** needs the product owner's sign-off in the spec's Concerns table first.
- **Keep remarks plain ---** they're for a procurement officer or a volunteer, not a developer. Say what the app does, not which component does it.
