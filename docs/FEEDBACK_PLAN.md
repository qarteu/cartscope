# Alpha reference-user feedback plan

## Purpose and current status

Test whether users can install CartScope, save and review products, compare deliberately matched offers, understand the limits of its observations, and manage their shopping records. The target is ten agreed reference testers, R01–R10. Participant recruitment, invitation, and responses are pending until actual records are added to the [reference-user roster](REFERENCE_USERS.csv). No usability results are claimed yet.

## Collection mechanisms

1. **GitHub issue form:** [Alpha feedback](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml) captures structured task results, ratings, and written comments.
2. **Private email reply:** reference users may reply to the [announcement](ALPHA_EMAIL.md). A team member records the same structured fields using the user's reference ID and removes personal information before linking a public issue.
3. **Bug report:** [Report a bug](https://github.com/qarteu/cartscope/issues/new?template=bug-report.yml) captures steps, expected behavior, actual behavior, and environment.

GitHub issues are public. Names, email addresses, shipping addresses, payment details, and private order numbers belong outside the repository. The reference ID is enough to relate feedback to an invitation. Do not ask users to buy anything to finish this protocol.

## Task protocol

Record each task as `completed`, `completed_with_help`, `blocked`, or `not_attempted`. Record elapsed seconds from starting the task to completion or abandonment. Include a short note for corrections, confusion, and errors. No stopwatch precision is required; an honest estimate is acceptable when marked as an estimate.

| ID | Task | Observable success | Information to record |
| --- | --- | --- | --- |
| T1 | Download, unzip, and load the alpha in Chrome | Side panel opens from the pinned icon | Result, elapsed seconds, install error if any |
| T2 | Capture a product page, review details, and save it | Saved card has the intended name, price, retailer, and variant | Result, elapsed seconds, captured fields corrected |
| T3 | Add a product from another store, edit quantity, and set a budget | Both saved products appear and the displayed subtotal reflects quantities | Result, elapsed seconds, subtotal/budget confusion |
| T4 | Enter another offer for the same product and variant | Comparison shows entered costs and labels any unknown costs | Result, elapsed seconds, matching mistakes, preferred sort |
| T5 | Enable a watch, revisit, and capture the product again | New observation is recorded; user understands an alert needs an observed change | Result, elapsed seconds, real or demo source, actual changed value if any |
| T6 | Add and update a sample order | Saved status, delivery note, and tracking information persist | Result, elapsed seconds, fields expected but missing |
| T7 | Enter installment inputs | Displayed payment amounts and total cost are understandable | Result, elapsed seconds, inputs used, unclear assumptions |
| T8 | Export a backup and locate import/delete controls | JSON file is saved and user can identify recovery/removal controls | Result, elapsed seconds, confidence restoring data |

For T5, do not fabricate a live retailer change. If price and availability are unchanged, record that result. Demo observations must be marked `demo`. For T6, use a fictitious order without personal information. Only delete real saved data if the tester chooses to do so after exporting it.

## Exact response fields

| Field | Type / allowed values | Meaning |
| --- | --- | --- |
| `reference_id` | R01–R10 or independent tester | Assigned invitation identifier |
| `release_version` | Text, e.g. 0.1.0 | Version actually used |
| `chrome_version` | Text | Chrome version from About Chrome |
| `operating_system` | Text | System and version if known |
| `test_mode` | Chrome extension / browser demo / both | Distinguishes extension-only capture/install testing from static preview testing |
| `task_id` | T1–T8 | Task being reported |
| `task_result` | completed / completed_with_help / blocked / not_attempted | Task outcome |
| `elapsed_seconds` | Nonnegative number or blank | Duration; leave blank if unknown |
| `duration_is_estimate` | Yes / no | Whether the duration was estimated |
| `data_source` | real observation / manually entered / demo | Origin of information used |
| `task_notes` | Text | Errors, corrections, or confusion |
| `ease_of_use` | Integer 1–5 | 1 very difficult; 5 very easy |
| `information_clarity` | Integer 1–5 | 1 very unclear; 5 very clear |
| `usefulness` | Integer 1–5 | 1 not useful; 5 very useful |
| `trust_in_displayed_information` | Integer 1–5 | 1 very low; 5 very high |
| `most_confusing_step` | Text | Qualitative usability problem |
| `missing_information` | Text | Information the user needed |
| `next_sprint_priority` | Text | The single most useful next improvement |
| `would_use_again` | Yes / maybe / no, with explanation | Intention and reason |
| `bug_reproduction` | Text, optional | Steps, expected result, and observed result |

The issue form groups task fields into one structured text response to keep the form manageable. Use this line format for every attempted task:

```text
T1 | completed | 120 seconds | estimate: no | source: manually entered | notes: none
```

The numbers above demonstrate format; they are not collected results.

Browser-demo users may mark Chrome installation and active-tab capture `not_attempted`; do not count those as completed extension tasks. Analyze preview-mode and installed-extension responses separately before comparing task results.

## Analysis rules

- **Completion rate:** completed tasks divided by attempted tasks. Report `completed_with_help` separately. Exclude `not_attempted` and show the attempted denominator.
- **Installation success:** participants who complete T1 divided by participants who attempt T1.
- **Task duration:** median of available durations for completed tasks; include the number of timings and identify estimated durations. Do not convert missing durations to zero.
- **Ratings:** report the distribution and median for each 1–5 question with the response count. Do not assume nonresponders rated the product positively.
- **Qualitative feedback:** group recurring problems by task, link the supporting feedback, and turn concrete problems into backlog stories with acceptance criteria.
- **Scope of conclusions:** ten reference users are a formative sample. Report who was invited, who responded, which tasks were attempted, and whether tasks used real observations or demo data. Do not describe the sample as a representative market survey.

## Team follow-up

After an actual response, update the roster with the response date and sanitized issue URL. Triage the issue with `feedback`, `bug`, or `enhancement` and choose a priority. Reproduce reported defects where possible, update the Sprint board, and identify a clear owner before moving a story into the next sprint. A sent-email screenshot or private delivery log can support the class submission, but this repository should not expose recipients' contact information.
