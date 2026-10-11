# Alpha release and class submission checklist

## Source and local artifact

- [ ] Confirm the intended personal GitHub account is `qarteu` before publishing.
- [ ] Run `npm run validate` and `npm test`; record actual outcomes in `VERIFICATION.md`.
- [ ] Run `npm run package`; retain the ZIP and SHA-256 file from `artifacts/`.
- [ ] Unzip that ZIP into a clean directory and load the directory in Chrome.
- [ ] Verify the main flows and record the Chrome version, date, data source, and limitations.
- [ ] Commit source, documentation, issue forms, and validation scripts.

## GitHub publication

- [ ] Publish the repository as `qarteu/cartscope`.
- [ ] Create tag `v0.1.0` at the verified release commit.
- [ ] Publish a release with the 0.1.0 notes from `CHANGELOG.md`, installation instructions, and known limits.
- [ ] Upload `cartscope-alpha-0.1.0.zip` and its `.sha256` file as release assets.
- [ ] Verify the links in `README.md` and `ALPHA_EMAIL.md` resolve.
- [ ] Publish the static browser preview on GitHub Pages and verify its public URL; no AWS setup is needed.
- [ ] Create/link implementation, next-sprint, and release-gate issues; synchronize their statuses with `SPRINT_BOARD.md`.

## Reference-user preview

- [ ] Identify ten real participants who agree to test and assign R01–R10 privately.
- [ ] Personalize and send the draft in `ALPHA_EMAIL.md` using the team's authorized email account.
- [ ] Record actual invitation dates in `REFERENCE_USERS.csv`; keep contact details and delivery evidence private.
- [ ] Collect task outcomes, times, ratings, and written feedback through the issue form or private replies.
- [ ] Triage findings and revise next-sprint priorities from the evidence.

## Attach to the submission

1. Repository URL: `https://github.com/qarteu/cartscope`.
2. Downloaded working alpha ZIP: `cartscope-alpha-0.1.0.zip` from the GitHub release.
3. The actual sent announcement template, plus private delivery evidence if required. The current `ALPHA_EMAIL.md` is a draft until sent.
4. Tracker URL: the repository's [Sprint board](https://github.com/qarteu/cartscope/blob/main/docs/SPRINT_BOARD.md) and linked GitHub issues; include the original Trello URL after reconciliation if the course requires it.

Unfinished external tasks must remain marked pending. Creating a draft or a participant slot is not evidence of delivery or feedback.
