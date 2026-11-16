# Chrome Web Store: what you need to do

Updated November 15, 2026. Chrome's **Developer mode** at `chrome://extensions` is for loading the local ZIP. It is separate from registering a Chrome Web Store publisher. The CartScope code, tested package, public policy/support pages and upload assets are prepared; a Store listing is not claimed until Google publishes it.

## 1. Register the publisher account

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and sign in with the Google account you want to own CartScope.
2. If Google shows registration, review the developer agreement and complete its one-time registration payment yourself. Use the amount shown by Google. If you already see **Items / Add new item**, you can continue without registering again.
3. Complete the publisher profile with your actual publisher name and verify the contact email. Enable Google **2-Step Verification**, which is required before publishing or updating an extension.

Official instructions: [registration](https://developer.chrome.com/docs/webstore/register), [account setup and email verification](https://developer.chrome.com/docs/webstore/set-up-account), [2-Step Verification](https://developer.chrome.com/docs/webstore/program-policies/two-step-verification).

## 2. Upload the extension

Click **Add new item**, then upload **`cartscope-launch-0.1.2.zip`**. This is the small runtime ZIP with `manifest.json` at its root. Do not upload the outer submission bundle or the Web Store kit ZIP.

The prepared Web Store kit contains:

| Dashboard material | File / value |
| --- | --- |
| Extension package | `extension/cartscope-launch-0.1.2.zip` |
| Name | **CartScope — Shopping desk** |
| Short description | Use the uploaded manifest description; it is also in `listing/FORM_FIELDS.txt` |
| Full description | `listing/STORE_LISTING.md`, section “Detailed description — ready to paste” |
| Icon | `images/icon128.png` |
| Five screenshots | `images/screenshots/store-*-1280x800.png` |
| Small promotional image | `images/store-small-tile.png` (440 × 280) |
| Optional marquee | `images/store-marquee.png` (1400 × 560) |
| Single purpose / permission reasons / data inventory | `listing/PERMISSIONS_AND_DISCLOSURES.md` |
| Review/testing instructions | `listing/REVIEWER_INSTRUCTIONS.md` |
| Privacy policy URL | https://qarteu.github.io/cartscope/privacy.html |
| Support URL | https://qarteu.github.io/cartscope/support.html |
| Homepage | https://qarteu.github.io/cartscope/ |

The comparison screenshot is scrolled to actual checked-offer costs; the Settings screenshot shows privacy and backup controls. Images are unmodified Chrome captures with labeled sample data. Promotional graphics are separate artwork.

## 3. Complete the listing and submit

- Fill in the listing, privacy and distribution fields using the kit. Review the data declarations against the uploaded package; do not certify that it handles no data simply because storage is local.
- CartScope's code is bundled; it has no remotely hosted executable code. It uses activeTab, scripting, storage and sidePanel, with optional notifications. The kit supplies the exact explanations and limits.
- Use your real publisher/contact details. Do not add invented ratings, customers, reviews, or an approval badge. The announcement drafts contain a Store-link placeholder until the real listing exists.
- Choose the distribution that matches the intended launch. To meet the assignment's published-extension link, verify that the eventual listing is accessible to the intended customers rather than assuming a private tester-only draft is public.
- Select **Submit for review** after checking the dashboard's required fields. Google reviews submissions; uploading a ZIP or saving a draft does not create an approved public launch. [Official publishing steps](https://developer.chrome.com/docs/webstore/publish).

## 4. Return the actual item link

Once the dashboard creates the item, save its dashboard URL. After Google approves and publishes it, open its actual public `chromewebstore.google.com/detail/...` URL and confirm the title, publisher and version. Test installation from that listing. Then the real Store link can replace the pending fields in the submission and marketing drafts.

Ask independent customers for honest reviews after they use the published extension. Team members should not review their own extension; do not offer rewards or request a particular rating. [Google's review policy FAQ](https://developer.chrome.com/docs/webstore/program-policies/spam-faq).

Account registration, agreement/payment, Store submission and approval remain separate from the verified GitHub release. No action in these instructions is recorded as completed until it actually occurs.
