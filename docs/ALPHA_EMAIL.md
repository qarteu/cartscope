# Preview alpha announcement — ready-to-personalize draft

**Delivery status:** Draft. No messages have been sent by this project. The team must fill the recipient roster, confirm participation, send the messages, and record the actual send dates in `REFERENCE_USERS.csv`. Do not present this draft as a sent announcement.

**To:** One agreed reference user per message, using the contact recorded for their assigned ID.

**Subject:** Try CartScope Alpha 0.1.0 — help us improve shopping across stores

Hi [first name],

We're inviting you to preview CartScope, a Chrome extension that keeps saved products from different stores together, helps you compare offers you record, and gives you a place for your shopping budget and order notes. Your reference-test ID is **[R01–R10]**. Thank you for helping us test this early release.

**Download:** https://github.com/qarteu/cartscope/releases/tag/v0.1.0

**Release notes and source:** https://github.com/qarteu/cartscope

**Browser demo:** https://qarteu.github.io/cartscope/ (for a quick preview after the site has been published)

**Install in Chrome:**

1. On the release page, download **cartscope-alpha-0.1.0.zip** and unzip it to a folder you will keep.
2. Open `chrome://extensions`, turn on **Developer mode**, and click **Load unpacked**.
3. Choose the unzipped folder containing `manifest.json` directly. Pin CartScope from the Extensions menu.
4. Open a retailer product page and click CartScope to open its side panel. Review captured details before saving.

Use Chrome 116 or newer. You can remove the preview at any time from `chrome://extensions`. The extension stores shopping records locally on your device. Please avoid using sensitive information in order notes while testing.

The browser demo uses labeled samples and browser-local storage; active-tab capture requires the installed extension. No AWS setup is needed. If you only test the browser demo, mark installation and active-tab capture tasks as not attempted and identify browser-demo mode in your feedback.

**Please try these tasks:**

- Capture and save a product, correcting any inaccurate details.
- Save a second product from another store, change a quantity, and set a budget.
- Add another offer for the same model and variant, then compare costs and delivery information.
- Turn on a watch and capture the same product again. If its actual price or availability has changed, check the resulting observation and notification. You can use the labeled demo data to explore a changed-price example.
- Add a sample order manually, update its status, and inspect its tracking information.
- Try the installment calculator and export a data backup.

The alpha does not automatically search every retailer, poll stores for changes, track shipments live, or complete checkout. Comparisons and order records use information you enter or capture. Sample products and alerts are demonstrations, and actual retailer checkout remains the source of final costs.

**Send quantitative and written feedback here:**

https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml

The form asks for your reference ID; completion, time taken, and problems for each task; and 1–5 ratings for ease of use, clarity, usefulness, and confidence in the displayed information. It also asks what confused you, which information was missing, and the most valuable improvement for the next sprint. A blocked or unsuccessful task is useful feedback, too.

If you prefer a private response or do not have a GitHub account, reply to this email with the same answers. Please do not put your name, address, payment information, personal order numbers, or other sensitive data into a public GitHub issue. The full task instructions and rating definitions are at:

https://github.com/qarteu/cartscope/blob/main/docs/FEEDBACK_PLAN.md

Please send your feedback by **[date and time, including time zone]**. Let us know your Chrome version and operating system if something fails. If installation fails, a description of the step and the visible error is enough; include a screenshot only if it contains no sensitive information.

Thanks,

[sender name] on behalf of the CartScope team  
Kartik, Jake Clevenger, and Eashan

---

## Sender checklist

- Verify the repository and release links resolve and the ZIP installs before sending.
- Assign one unique reference ID and record a consenting participant's contact in a private team roster. The committed CSV uses IDs only.
- Replace the name, reference ID, deadline, and sender fields; send to each agreed participant individually.
- Record `invited_at`, then `response_received_at` when feedback arrives. Keep delivery evidence private.
- Move the participant/release tasks in the issue tracker only after the corresponding actions happen.
