| | |
| --- | --- |
| **Runbook name** | Infrastructure and costs |
| **Description** | What Fairview Volunteers runs on, what it costs each month, and who approves anything that adds to it. |
| **Resources** | `.github/workflows/ci.yml` |
| **Owner** | Marcus Bell (volunteer program lead) |
| **Version** | 1.0.0 |
| **Version date** | 2026-10-14 |

**Note:** Fairview County is fictional, and so is this deployment. The repo doesn't deploy anywhere. This page exists so the `/spec` skill has a real budget to check a story against, the way it would in a production app.

## What runs today

| Component | What it does | Monthly cost |
| --- | --- | --- |
| Web app | One small container running `pnpm start`. Serves both pages and the sign-up action. | About $12 |
| Database volume | A 1 GB persistent volume holding the SQLite file. | About $1 |
| CI | GitHub Actions on a public repo. | $0 |

That's the whole bill: roughly $13 a month. The program's budget for the app is $25 a month.

**Nothing sends email or text messages.** Nothing runs on a schedule. There are no paid third-party services.

## What needs approval

Anything that adds a recurring cost is a concern in the story's spec, and the program lead decides it before the build starts:

- **A new component ---** a second service, a worker, a scheduled job. Each one is its own instance and its own line on the bill, and a scheduled job runs whether or not it has work.
- **A bigger instance ---** or more than one of anything.
- **A paid service ---** an email or SMS provider, a monitoring tool, an API with a paid tier. Give the provider's price at our volume, not its free tier.
- **Storage that grows with use ---** uploads, exports, logs kept longer than a week.

A rough order of magnitude is enough for the spec ("one more small instance, about $12 a month"). A precise figure you can't support isn't.

## Secrets and environment variables

The app reads one: `DATABASE_URL`. A new one isn't a cost, but it is a deployment change. Name it in the spec and add it to the README's setup section in the same PR.
