# Intent: duplicate sign-ups
Story: #1
Design: none.
Author: Dana Reyes (volunteer coordinator).
Status: approved.

## Problem
Volunteers sign up for the same shift twice, usually because they can't remember whether the first sign-up went through. Last season roughly 1 in 12 sign-ups was a duplicate, so shifts look fuller than they are and people who could have helped see a shift as nearly full. Coordinators clean the lists up by hand before every event.

## Proposed outcome
Each person holds at most one spot on a shift. Someone who signs up again ends up exactly where they were after the first time, and the spot counts everyone sees reflect real people.

## Affected users and systems
Volunteers, volunteer coordinators, the sign-up form, the shift list, the database.

## Constraints
No accounts or logins: volunteers still sign up with a name and an email address. Sign-ups already in the list must survive the change. WCAG 2.2 AA for anything a volunteer sees.

## Open questions
Do "Sam.Okafor@example.org" and "sam.okafor@example.org" count as the same person?
What happens to the duplicates already in the list?
