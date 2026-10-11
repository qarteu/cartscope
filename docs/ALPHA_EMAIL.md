# CartScope Alpha invitation

**Status: draft — not sent.** Personalize one copy for each consenting reference user. Participant slots are still unassigned; record actual invitation dates only after sending. Keep contacts and delivery evidence private.

**To:** [agreed participant's private email address]<br>
**Subject:** Try our CartScope Alpha and tell us what needs fixing

Hi [first name],

We're ready for you to try CartScope Alpha 0.1.1. It keeps products from different stores in one Chrome panel so you can compare offers you've checked and keep track of your budget. Your reference-user ID is **[R01–R10]**.

[Download the extension and read the release notes](https://github.com/qarteu/cartscope/releases/tag/v0.1.1) · [Source and instructions](https://github.com/qarteu/cartscope) · [Browser demo](https://qarteu.github.io/cartscope/)

To install it in Chrome:

1. Download **cartscope-alpha-0.1.1.zip** from the release page and unzip it into a folder you'll keep.
2. Open `chrome://extensions`, enable **Developer mode**, and select **Load unpacked**.
3. Choose the unzipped folder containing `manifest.json`. Pin CartScope in Chrome's Extensions menu.
4. Open a product page, click CartScope's toolbar icon, and select **Capture this page**. Check the details before saving.

Use Chrome 116 or newer. Your shopping records stay on your device. You can export or delete them in Settings, and remove the extension at `chrome://extensions`. Please leave personal order and payment information out of your test notes.

Please try these tasks:

- Capture and save an item. Correct any details that came through incorrectly.
- Save something from another store, change a quantity, and set a budget.
- Add a checked offer for the same model and variant, then compare the total and delivery details.
- Set a watch and capture or update the same offer again. If its price or stock changed, check the resulting alert. You can also try a price change in the labeled sample workspace.
- Enter an order manually, update its status, and check its tracking link.
- Try the payment calculator and export a backup.

The [full task sheet](https://github.com/qarteu/cartscope/blob/main/docs/FEEDBACK_PLAN.md) explains what to record. The browser demo works without installation, but it cannot capture your shopping tab or deliver Chrome notifications. If you use it, select browser-demo mode and mark installation/capture as not attempted.

This version compares information you capture or enter. It does not automatically search retailers, check prices while you're away, update shipments, or complete checkout. Sample prices and alerts are examples. Confirm actual stock and final charges with the retailer.

Please send feedback through the [Alpha feedback form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml), or reply to this email if you prefer a private response or don't have a GitHub account. Include:

- Your reference ID and whether you tested the extension or browser demo.
- Which tasks you completed, failed, or skipped, and how long each took.
- Ratings from 1 to 5 for ease, clarity, usefulness, and confidence in the information, using the task sheet's scales.
- What confused you, what was missing, and the one change you'd want us to make next.

If something breaks, include your Chrome version, operating system, and the step where it happened. Please keep names, addresses, payment details, and personal order numbers out of public GitHub issues. An unsuccessful task is useful feedback too.

Please reply by **[date and time, Pacific]**.

Thanks,

Kartik Malunjkar<br>
CartScope team — Kartik, Jake Clevenger, and Eashan

---

## Before sending

- Confirm participation and assign the recipient's unique R01–R10 ID.
- Verify the release links and ZIP installation instructions.
- Replace the recipient, ID, and deadline. Send individually through the team's authorized email account.
- Record `invited_at` and later `response_received_at` in `REFERENCE_USERS.csv`; retain private delivery evidence.
- Update recruitment, sending, and feedback tasks only after each action happens.
