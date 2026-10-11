#!/usr/bin/env python3
"""Build the Canvas write-up and PDF from the repository's recorded release evidence.

Run with the bundled Python (reportlab installed). Use --draft while the new
Chrome run is pending. A final build rejects stale version/hash/screenshots.
"""
from __future__ import annotations
import argparse
from collections import Counter
from datetime import datetime
import hashlib
import html
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
REPO = 'https://github.com/qarteu/cartscope'
DEMO = 'https://qarteu.github.io/cartscope/'
FEEDBACK = REPO + '/issues/new?template=alpha-feedback.yml'
PROTOTYPE = 'https://www.figma.com/design/6rJ6LQuCiH2rufqc1Pj7QH/UniCart-UI-Prototype?node-id=0-1'


def read_json(path):
    return json.loads((ROOT / path).read_text())


def context(draft):
    manifest = read_json('extension/manifest.json')
    chrome = read_json('docs/CHROME_TEST_RESULTS.json')
    ui = read_json('docs/UI_TEST_RESULTS.json')
    visuals = read_json('docs/visuals/render-manifest.json')
    stories = read_json('docs/issues.json')
    verification = (ROOT / 'docs/VERIFICATION.md').read_text()
    node = re.search(r'Behavioral tests\s*\|\s*(\d+) passed,\s*(\d+) failed', verification)
    if not node:
        raise ValueError('Record actual behavioral totals in docs/VERIFICATION.md before building.')
    checks = chrome.get('checks', [])
    passed = sum(check['status'] == 'passed' for check in checks)
    failed = sum(check['status'] == 'failed' for check in checks)
    ui_checks = ui.get('checks', [])
    ui_passed = sum(check['status'] == 'passed' for check in ui_checks)
    ui_failed = sum(check['status'] == 'failed' for check in ui_checks)
    if passed != chrome.get('passed') or failed != chrome.get('failed'):
        raise ValueError('Chrome report totals disagree with its named checks.')
    if ui_passed != ui.get('passed') or ui_failed != ui.get('failed'):
        raise ValueError('DOM report totals disagree with its named checks.')
    version = manifest['version']
    release = chrome.get('release', {})
    zip_path = ROOT / 'artifacts' / f'cartscope-alpha-{version}.zip'
    if not draft:
        release_gate = re.search(r'\|\s*Current GitHub release download\s*\|\s*([^|]+)', verification)
        if not release_gate or not release_gate[1].strip().startswith('Passed'):
            raise ValueError('Final report requires a passed downloaded-release gate in docs/VERIFICATION.md.')
        if chrome.get('status') != 'passed' or release.get('version') != version:
            raise ValueError('Final report requires a passing Chrome run for the current manifest version.')
        if not zip_path.exists() or hashlib.sha256(zip_path.read_bytes()).hexdigest() != release.get('sha256'):
            raise ValueError('The local release ZIP differs from the ZIP exercised in Chrome.')
        if visuals.get('verification_status') != 'passed' or visuals.get('browser_version') != chrome['browser']:
            raise ValueError('Screenshot provenance does not match the passing Chrome run.')
        if visuals.get('browser_checks', {}).get('passed') != passed or visuals.get('browser_checks', {}).get('failed') != failed:
            raise ValueError('Screenshot provenance totals differ from the named Chrome checks.')
        public_demo = chrome.get('publicDemo', {})
        if public_demo.get('status') != 200 or any(public_demo.get(key) != version for key in ('landingVersion', 'iframeVersion', 'aboutVersion')):
            raise ValueError('Final report requires a public-demo check for this release version.')
        for item in visuals['screenshots']:
            path = ROOT / 'docs/visuals' / item['file']
            if hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256']:
                raise ValueError(f'Screenshot hash differs from the recorded source: {path.name}')
        if int(node[2]) or failed or ui_failed or ui.get('status') != 'passed' or chrome.get('errors'):
            raise ValueError('The final report cannot claim a passing release with recorded failures.')
    state_counts = Counter(story['status'] for story in stories)
    label_counts = Counter(story['label'] for story in stories)
    ci_run = visuals.get('ci_run', '')
    if not ci_run:
        links = re.findall(r'https://github.com/qarteu/cartscope/actions/runs/\d+', verification)
        ci_run = links[-1] if links else REPO + '/actions'
    timestamp = chrome.get('finishedAt', chrome.get('generatedAt', ''))
    date = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime('%B %d, %Y').replace(' 0', ' ')
    return dict(version=version, minimum_chrome=manifest['minimum_chrome_version'], chrome=chrome,
                browser=chrome.get('browser', 'Not recorded'), chrome_passed=passed, chrome_failed=failed,
                ui_passed=ui_passed, node_passed=int(node[1]), node_failed=int(node[2]),
                zip_path=zip_path, sha=release.get('sha256', ''), tested_version=release.get('version', ''),
                stories=stories, total_stories=len(stories), states=state_counts, labels=label_counts,
                ci_run=ci_run, visuals=visuals, date=date, draft=draft,
                release_url=REPO + f'/releases/tag/v{version}',
                download_url=REPO + f'/releases/download/v{version}/cartscope-alpha-{version}.zip')


FEATURES = [
    ('1. Product capture and review', 'Read the active product page, edit the result, and save it.', 'Extraction fixtures + Chrome toolbar capture; category pages rejected.'),
    ('2. Cart and budget', 'Products from several stores, quantities, notes, save-for-later, budget and retailer links.', 'Chrome add/edit/quantity checks; persistence through real extension storage.'),
    ('3. Offer comparison', 'Model, variant and condition checks; full cost components; total, delivery, pickup and return ranking.', 'Core arithmetic/identity tests + Chrome mismatch and unknown-shipping checks.'),
    ('4. History and alerts', 'Timestamped observations, opted-in drop/restock watches, in-app notifications.', 'Chrome observation transitions; repeat captures or edits, not background polling.'),
    ('5. Order records', 'Manual order creation, dates, status, notes and safe tracking links.', 'Chrome create/update flow; storage rejects invalid quantities and dates.'),
    ('6. Payment calculator', 'Full obligation, entered interest/fees, due dates and exact-cent installments.', 'Core rounding/leap-day tests + Chrome full-total and remainder checks.'),
    ('7. Data controls', 'Export/import/delete, atomic validation, separate real and sample workspaces.', 'Chrome backup round trip; storage failure and sample-provenance regressions.'),
    ('8. Browser demo and layout', 'The same app in browser storage, sample mode, responsive screens.', 'Chrome preview persistence/isolation, narrow layouts and hosted demo checks.')
]


def canvas_text(c):
    version = c['version']
    note = '**Draft - do not submit:** Final publication and evidence refresh are pending.\n\n' if c['draft'] else ''
    rows = '\n'.join(f'| {feature} | {behavior} | {evidence} |' for feature, behavior, evidence in FEATURES)
    return f'''# CartScope Alpha {version} submission

{note}Our team built CartScope to keep shopping across several stores in one place. The Chrome extension lets a shopper save products, compare offers they have checked, keep an item budget, and record orders. This submission includes the released extension, source, browser demo, test evidence, tracker, and invitation template. The Alpha is complete for that scope. The ten-user recruitment, invitation delivery, and feedback collection are still pending.

The [UniCart prototype]({PROTOTYPE}) guided saving, cart and comparison. Our design uses paper and forest colors, a custom CartScope mark and compact cost records. [Real Chrome screenshots]({REPO}/blob/main/docs/visuals/README.md) show the finished screens.

**Team:** Kartik Malunjkar - System Architect and Release Train Engineer; Jake Clevenger - Product Manager and Product Owner; Eashan - Business Owner and Scrum Coach.

## Required attachments and links

1. **Personal GitHub repository:** [{REPO}]({REPO}). It contains version-controlled source, installation instructions, release notes, test scripts, screenshots, and the MIT license.
2. **Downloaded Alpha ZIP:** [cartscope-alpha-{version}.zip]({c['download_url']}). The [release page]({c['release_url']}) includes the notes and checksum.
3. **Announcement template:** [Alpha invitation]({REPO}/blob/main/docs/ALPHA_EMAIL.md). It includes installation, release-note links, tasks, numeric ratings and written feedback. It is a draft, not a claim that messages were sent.
4. **Agile tracker:** [GitHub Issues]({REPO}/issues), [sprint board]({REPO}/blob/main/docs/SPRINT_BOARD.md), and [linked stories]({REPO}/blob/main/docs/PUBLISHED_ISSUES.md). GitHub Issues is our similar issue tracker for this submission.

**Try the app:** [Browser demo]({DEMO}). **Detailed attachment:** [Submission PDF]({REPO}/blob/main/docs/FINAL_SUBMISSION.pdf). **All files:** [Submission bundle]({REPO}/releases/download/v{version}/cartscope-submission-{version}.zip). **Screenshots:** [Chrome walkthrough]({REPO}/blob/main/docs/visuals/README.md).

## Installation and demonstration

Use Chrome {c['minimum_chrome']} or newer. Download the release ZIP, unzip it into a folder you will keep, open `chrome://extensions`, enable Developer mode, and choose Load unpacked. Select the folder containing `manifest.json`, then pin CartScope in the Extensions menu.

Open a retailer product page, click the CartScope toolbar icon, and choose Capture this page. Check the captured name, price, retailer, identifiers and variant before saving. If a page cannot be read, enter the product manually. Add another product, change its quantity, and set a budget. The cart subtotal covers item prices; Compare shows shipping, estimated tax, membership, verified discounts and eligible cashback separately.

To compare another store, add a checked offer for the same model, size, color and condition. Change the ranking to total cost, delivery, pickup or returns. Missing required costs stay unknown, and conflicting variants are not promoted as a best match. Shopping links open the retailer, where the shopper confirms final charges and completes checkout.

Set a price or restock watch, then capture or edit the same offer again to record a new observation. Add an order manually and update its status or tracking link. Use the payment calculator to enter an amount, payment count, fees, interest and dates; it shows the whole obligation and the schedule. Export a backup from Settings. Optional samples let reviewers try these flows without inventing live prices. The browser demo uses separate browser storage; capture and native Chrome notifications require the extension. No AWS setup is needed.

## Built features and evidence

| Feature | Working Alpha behavior | How we checked it |
| --- | --- | --- |
{rows}

## What we tested and how

The [verification record]({REPO}/blob/main/docs/VERIFICATION.md) records **{c['node_passed']} passing Node behavioral tests, including {c['ui_passed']} DOM flow checks**, plus **{c['chrome_passed']} passing real Chrome checks**. These are automated checks, not participants. Node tests cover cost arithmetic, matching, extraction, storage, ZIP packaging and publishing-command contracts. Happy DOM checks exercise the actual app, preview adapter and background consumer through event handlers; publishing contracts use disposable CLI doubles.

The run used **Chrome for Testing {c['browser']}** in a disposable profile. It unpacked the actual release ZIP into a clean installation directory and loaded the extension. It exercised the real service worker, local storage, toolbar action, scripting and downloads. Capture was denied before the toolbar click and succeeded after the activeTab grant. An HTTP product-page fixture returned the expected product; a category fixture was rejected. Other checks covered cart, comparison, watches, orders, financing, backup, hostile inputs, narrow layouts and demo persistence. The public-demo check and its response are recorded in the [machine-readable Chrome report]({REPO}/blob/main/docs/CHROME_TEST_RESULTS.json). [The workflow run]({c['ci_run']}) and screenshot provenance are linked for review.

The fixtures make the checks reproducible. They do not validate changing markup on every current retailer website, live retailer feeds, testers' operating systems, or native desktop notification delivery. We still need field testing for those cases. Sample prices, stock and shipments are labeled examples.

## Feedback and next sprint

Reference users can use the [Alpha feedback form]({FEEDBACK}) or reply privately to the invitation email. We ask for an assigned R01-R10 ID, extension/demo mode, task completion or failure, time taken, 1-5 ratings for ease, clarity, usefulness and confidence, and written comments about confusing steps, missing information and the most valuable improvement. The [task protocol]({REPO}/blob/main/docs/FEEDBACK_PLAN.md) defines the questions and rating scales. Public feedback must omit contact, payment and private order details.

The tracker contains **{c['total_stories']} records**, including **{c['labels']['next-sprint']} planned next-sprint stories** and **{c['labels']['backlog']} later backlog stories**. The linked board records current statuses for implementation, publication and pending user work. Next-sprint priorities are real-store capture validation, authorized automatic offer discovery, fixes from observed feedback, and source-dependent price-check/order-update integrations.

The [reference roster]({REPO}/blob/main/docs/REFERENCE_USERS.csv) still has ten unassigned slots. We have prepared the email and feedback routes, but we have not recruited ten agreed recipients, sent their invitations, or collected their results. Automatic retailer discovery, unattended polling, carrier updates, provider-backed financing and account synchronization also remain planned. The released Alpha works with user-captured or entered information and keeps its shopping records on the device.
'''


def report_text(c):
    check_rows = '\n'.join(f'| {index + 1} | {check["name"]} | {check["status"]} |' for index, check in enumerate(c['chrome']['checks']))
    snapshot = 'Draft for the current visual update; final browser evidence must match before export.' if c['draft'] else 'Final report generated from the recorded release evidence.'
    return canvas_text(c) + f'''
## Detailed release evidence

{snapshot}

- Runtime manifest version: `{c['version']}`; recorded Chrome-tested ZIP version: `{c['tested_version']}`.
- Browser: Chrome for Testing `{c['browser']}`; recorded run completed {c['date']}.
- Tested ZIP SHA-256: `{c['sha']}`.
- Local reproduction: `npm ci`, `npm run validate`, `npm test`, `npm run package`, `npx playwright install chromium`, `PUBLIC_DEMO_URL=https://qarteu.github.io/cartscope/ npm run test:browser`.
- Test files: `tests/core.test.mjs`, `tests/extract.test.mjs`, `tests/storage.test.mjs`, `tests/release.test.mjs`, `tests/publish.test.mjs`, `tests/ui.test.mjs`, `tests/browser.mjs`. The DOM flow checks are included in the Node total, not added again.

| Check | Named Chrome check | Result |
| --- | --- | --- |
{check_rows}

## Screenshot walkthrough

![Saved cart and budget](visuals/cart.png)

Saved products and an item budget; the retailer links remain the checkout route.

![Checked offer comparison](visuals/compare.png)

Matched variants, cost components and ranking choices; sample offers are labeled.

![Manual order records](visuals/orders.png)

User-entered statuses and tracking information; no live carrier feed is claimed.

![Full payment obligation](visuals/finance.png)

Entered terms, total owed and an exact-cent schedule. Confirm the actual provider's contract.

All screenshots are linked in [visual provenance](visuals/README.md). They show labeled sample data. The PDF presents selected portions of the original screenshots for a readable walkthrough; full-height originals remain available at those links.
'''


def build_pdf(c, output=None):
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_LEFT
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.utils import ImageReader
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable, KeepTogether
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    bundled_font = Path('/Users/kartik.malunjkar/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/fonts/DejaVuSans.ttf')
    bold_font = bundled_font.with_name('Ubuntu-B.ttf')
    if bundled_font.exists() and bold_font.exists():
        pdfmetrics.registerFont(TTFont('CartScopeBody', str(bundled_font)))
        pdfmetrics.registerFont(TTFont('CartScopeBold', str(bold_font)))
        pdfmetrics.registerFontFamily('CartScopeBody', normal='CartScopeBody', bold='CartScopeBold')
        body_font = 'CartScopeBody'
        heading_font = 'CartScopeBold'
    else:
        body_font = 'Helvetica'
        heading_font = 'Helvetica-Bold'
    ink = colors.HexColor('#202B25')
    paper = colors.HexColor('#F5F1E8')
    rust = colors.HexColor('#CF693B')
    teal = colors.HexColor('#2B5745')
    muted = colors.HexColor('#657269')
    rule = colors.HexColor('#D9DDD2')
    tint = colors.HexColor('#E5EADf')
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='TitleCS', fontName=heading_font, fontSize=30, leading=34, textColor=ink, spaceAfter=15))
    styles.add(ParagraphStyle(name='HeadingCS', fontName=heading_font, fontSize=19, leading=24, textColor=ink, spaceAfter=12))
    styles.add(ParagraphStyle(name='SubCS', fontName=heading_font, fontSize=11, leading=15, textColor=teal, spaceBefore=10, spaceAfter=6))
    styles.add(ParagraphStyle(name='BodyCS', fontName=body_font, fontSize=9, leading=13.5, textColor=ink, spaceAfter=8))
    styles.add(ParagraphStyle(name='SmallCS', fontName=body_font, fontSize=7.6, leading=10.4, textColor=muted, spaceAfter=6))
    styles.add(ParagraphStyle(name='TableCS', fontName=body_font, fontSize=8.1, leading=11.3, textColor=ink))
    styles.add(ParagraphStyle(name='TableHeadCS', fontName=heading_font, fontSize=8.3, leading=11.5, textColor=ink))
    W, H = letter
    width = W - 92
    story = []
    def safe(value):
        return html.escape(str(value)).replace('–', '-').replace('—', '-').replace('’', "'")
    def p(value, name='BodyCS'):
        return Paragraph(value, styles[name])
    def paragraph(value, name='BodyCS'):
        story.append(p(value, name))
    def link(title, url):
        return f'<link href="{html.escape(url, quote=True)}" color="#2B5745">{safe(title)}</link>'
    def table(rows, widths, header=True):
        cells = [[p(safe(value), 'TableHeadCS' if header and i == 0 else 'TableCS') for value in row] for i, row in enumerate(rows)]
        item = Table(cells, colWidths=widths, hAlign='LEFT', repeatRows=1 if header else 0)
        commands = [('VALIGN', (0, 0), (-1, -1), 'TOP'), ('BOX', (0, 0), (-1, -1), .5, rule),
                    ('INNERGRID', (0, 0), (-1, -1), .4, rule), ('LEFTPADDING', (0, 0), (-1, -1), 8),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 8), ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8)]
        if header:
            commands += [('BACKGROUND', (0, 0), (-1, 0), tint), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FCFBF7'), colors.HexColor('#F1F2EA')])]
        item.setStyle(TableStyle(commands))
        story.append(item)
        story.append(Spacer(1, 11))
    def page(title, subtitle):
        story.append(PageBreak())
        paragraph(title, 'HeadingCS')
        paragraph(subtitle)
    class ScreenshotViewport(Flowable):
        def __init__(self, path, size, height, source_top_fraction=0):
            super().__init__()
            self.path, self.width, self.height = str(path), size, height
            self.source_top_fraction = source_top_fraction
        def draw(self):
            reader = ImageReader(self.path)
            iw, ih = reader.getSize()
            rendered_height = ih * self.width / iw
            offset = min(rendered_height * self.source_top_fraction, max(0, rendered_height - self.height))
            canvas = self.canv
            canvas.saveState()
            clip = canvas.beginPath()
            clip.rect(0, 0, self.width, self.height)
            canvas.clipPath(clip, stroke=0, fill=0)
            canvas.drawImage(reader, 0, self.height-rendered_height+offset, width=self.width, height=rendered_height, mask='auto')
            canvas.restoreState()
            canvas.setStrokeColor(rule)
            canvas.rect(0, 0, self.width, self.height, stroke=1, fill=0)
    def screen_pair(left, right):
        columns = []
        for view, title, description, top_fraction in (left, right):
            url = REPO + '/blob/main/docs/visuals/' + view + '.png'
            columns.append([p(safe(title), 'SubCS'), ScreenshotViewport(ROOT / 'docs/visuals' / (view + '.png'), 236, 445, top_fraction),
                            Spacer(1, 7), p(safe(description)), p(link('Open full screenshot', url), 'SmallCS')])
        pair = Table([[columns[0], columns[1]]], colWidths=[250, 250], hAlign='LEFT')
        pair.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LEFTPADDING',(0,0),(-1,-1),0), ('RIGHTPADDING',(0,0),(-1,-1),14)]))
        story.append(pair)
    def footer(canvas, document):
        canvas.saveState()
        canvas.setFillColor(paper)
        canvas.rect(0, 0, W, H, stroke=0, fill=1)
        canvas.setFillColor(rust)
        canvas.rect(46, H-27, 24, 3, stroke=0, fill=1)
        canvas.setStrokeColor(rule)
        canvas.line(46, 42, W-46, 42)
        canvas.setFont(body_font, 8)
        canvas.setFillColor(muted)
        suffix = ' | LAYOUT PREVIEW' if c['draft'] else ''
        canvas.drawString(46, 27, f'CartScope Alpha {c["version"]} | IME 4403' + suffix)
        canvas.drawRightString(W-46, 27, f'{document.page}')
        canvas.restoreState()

    paragraph('CartScope', 'TitleCS')
    paragraph(f'Alpha {c["version"]} submission', 'HeadingCS')
    paragraph('Our shopping project keeps products from different stores in one Chrome side panel. The released Alpha covers captured and manually entered offers, a saved cart, a budget, observed alerts, order notes and payment arithmetic.')
    paragraph(f'The {link("UniCart prototype", PROTOTYPE)} guided saving, cart and comparison. Our design uses paper and forest colors, a custom CartScope mark and compact cost records. {link("Real Chrome screenshots", REPO+"/blob/main/docs/visuals/README.md")} show the finished screens.')
    table([['Deliverable', 'Where to find it'], ['Source', REPO], ['Release and installation notes', c['release_url']],
           ['Runtime ZIP', f'cartscope-alpha-{c["version"]}.zip'], ['Interactive browser demo', DEMO],
           ['Tracker', REPO + '/issues'], ['Email and feedback', 'docs/ALPHA_EMAIL.md and the Alpha feedback issue form']], [154, 366])
    paragraph('Open the attachments', 'SubCS')
    paragraph(' | '.join([link('Repository', REPO), link('Download ZIP', c['download_url']), link('Submission bundle', REPO + f'/releases/download/v{c["version"]}/cartscope-submission-{c["version"]}.zip'), link('Release notes', c['release_url']), link('Browser demo', DEMO), link('Tracker', REPO+'/issues')]))
    paragraph('Team', 'SubCS')
    paragraph('Kartik Malunjkar - System Architect and Release Train Engineer<br/>Jake Clevenger - Product Manager and Product Owner<br/>Eashan - Business Owner and Scrum Coach')
    paragraph('Completion status', 'SubCS')
    paragraph('The Alpha runtime and its release publication are complete for the documented scope. Ten consenting reference users, invitation delivery and collected feedback remain pending. Live retailer discovery, unattended checks and carrier synchronization are planned work.')
    paragraph(f'Recorded automated evidence: {c["node_passed"]} passing Node tests (including {c["ui_passed"]} DOM flow checks), plus {c["chrome_passed"]} passing Chrome checks. These are test counts, not reference users.', 'SmallCS')

    page('Install and use the Alpha', 'Use the packaged extension for page capture, or open the hosted demo to explore the same interface with examples.')
    paragraph('Installation', 'SubCS')
    for number, text in enumerate([
        f'Download cartscope-alpha-{c["version"]}.zip from the release page and unzip it into a folder you will keep.',
        'Open chrome://extensions, enable Developer mode, and choose Load unpacked.',
        'Select the folder containing manifest.json directly. Pin CartScope from the Extensions menu.',
        'Open a product page, click the CartScope toolbar icon, then choose Capture this page and review before saving.'
    ], 1):
        paragraph(f'<b>{number}.</b> {safe(text)}')
    paragraph(f'Chrome {c["minimum_chrome"]} or newer is required. Keep the folder in place; remove the extension from chrome://extensions when finished. No AWS account is needed.', 'SmallCS')
    paragraph('A short demonstration', 'SubCS')
    for number, text in enumerate([
        'Save an item and correct any missing product or variant details. Add another store\'s product, change quantity and set a budget.',
        'Add a checked offer for the same model, color, size and condition. Compare shipping, estimated tax, membership, discounts and eligible cashback. Switch ranking preferences.',
        'Enable a price or restock watch. Capture or update the same offer again to record a new observation and detect a qualifying change.',
        'Enter an order after retailer checkout, update its status and add a safe tracking link.',
        'Enter payment terms to see total owed and the installment schedule. Export a backup and restore it in Settings.'
    ], 1):
        paragraph(f'<b>{number}.</b> {safe(text)}')
    paragraph('Data and samples', 'SubCS')
    paragraph('Real installations start empty. Optional sample prices, stock and orders are labeled and isolated. The browser demo uses its own local storage; capture and Chrome notifications require the extension. The cart covers item prices, while Compare shows estimated complete costs. Retailer checkout sets final charges.')
    paragraph('Shopping records stay on the device. Product images and shopping links contact their source sites normally. Backups contain products, notes and order records. Public feedback should omit contact, payment and private order information.', 'SmallCS')

    page('Walkthrough in Chrome', 'Cart and comparison screens from the recorded run, using labeled sample data. These excerpts show the cart and compared offer costs; full images are linked.')
    screen_pair(('cart', 'Saved cart and budget', 'Products from several stores, quantities, save-for-later and an item-price budget.', 0),
                ('compare', 'Checked offer comparison', 'Matched offers with price, shipping, tax, membership and retailer terms. Missing required costs stay unknown.', .31))

    page('Orders and payment arithmetic', 'These views keep user-entered information together. They do not imply live carrier data or a financing-provider offer.')
    screen_pair(('orders', 'Order notes and status', 'Manual statuses, dates and tracking details. The retailer or carrier remains the source of delivery updates.', 0),
                ('finance', 'Whole payment obligation', 'Calculated total and exact-cent schedule from entered terms. Confirm the actual provider contract.', .49))

    page('Feature-to-test evidence', 'Each row ties a working Alpha feature to the checks that exercised it. The detailed reports name every recorded check.')
    table([['Feature', 'Implemented behavior', 'Evidence']] + [[feature, behavior, evidence] for feature, behavior, evidence in FEATURES], [115, 213, 192])
    paragraph('How the browser test ran', 'SubCS')
    paragraph(f'The actual release ZIP was unpacked into a clean directory and loaded in a disposable Chrome for Testing {c["browser"]} profile. The test used the real service worker, extension storage, toolbar action, scripting and downloads. Capture failed before the toolbar grant, then read a served HTTP product fixture after the click. A category fixture was rejected.')
    paragraph('The fixture pages are reproducible retailer-shaped examples. They do not validate current markup on every live store, native desktop alert delivery, or testers\' operating systems. The hosted demo check is recorded separately in the same Chrome report.', 'SmallCS')
    paragraph('Node checks include cost, matching, extraction, storage, ZIP packaging, and publishing contracts. Happy DOM runs the actual app event handlers; publisher tests use disposable CLI doubles.', 'SmallCS')
    paragraph(' | '.join([link('Verification record', REPO+'/blob/main/docs/VERIFICATION.md'), link('Chrome checks', REPO+'/blob/main/docs/CHROME_TEST_RESULTS.json'), link('DOM checks', REPO+'/blob/main/docs/UI_TEST_RESULTS.json'), link('Workflow run', c['ci_run'])]), 'SmallCS')

    page('Feedback and remaining work', 'The invitation and collection mechanisms are ready. Actual participation and delivery are still pending.')
    paragraph('Reference-user feedback', 'SubCS')
    paragraph('Assign one private participant to each R01-R10 ID. Personalize the draft invitation with the recipient, ID and deadline, then send it individually through the team\'s authorized email account. Record actual invitation and response dates; keep contacts and delivery evidence private.')
    paragraph('The Alpha feedback form or a private email reply collects task success/failure, time taken, 1-5 ease/clarity/usefulness/confidence ratings, confusing steps, missing information and the next improvement. Testers identify installed-extension or browser-demo mode; skipped capture/installation tasks are recorded as not attempted.')
    paragraph(' | '.join([link('Email draft', REPO+'/blob/main/docs/ALPHA_EMAIL.md'), link('Feedback form', FEEDBACK), link('Task protocol', REPO+'/blob/main/docs/FEEDBACK_PLAN.md'), link('Reference roster', REPO+'/blob/main/docs/REFERENCE_USERS.csv')]))
    paragraph('Tracker and next sprint', 'SubCS')
    paragraph(f'The tracker contains {c["total_stories"]} records, including {c["labels"]["next-sprint"]} next-sprint stories and {c["labels"]["backlog"]} later backlog stories. The linked board records current implementation, publication and user-work statuses. Recruitment, invitation delivery and feedback remain pending.')
    paragraph('Next priorities are current-store capture validation, an authorized cross-store source, and fixes from actual feedback. Unattended price checks and order imports depend on permitted source access. Optional accounts, hosted refreshes, provider-backed BNPL, broader accessibility testing and Chrome Web Store distribution remain backlog work.')
    paragraph('Release evidence snapshot', 'SubCS')
    paragraph(f'Runtime {c["version"]}; Chrome-tested ZIP {c["tested_version"]}; run completed {c["date"]}. Browser {c["browser"]}. Source links and the named test list are in the Markdown companion.', 'SmallCS')
    paragraph('ZIP SHA-256: '+safe(c['sha']), 'SmallCS')
    paragraph('Reproduce: npm ci; npm run validate; npm test; npm run package; npx playwright install chromium; PUBLIC_DEMO_URL=https://qarteu.github.io/cartscope/ npm run test:browser.', 'SmallCS')
    paragraph('The Alpha does not automatically discover every store\'s offer, poll prices while the user is away, import shipments, process payments, or synchronize accounts. No ten-user invitation or usability outcome is claimed.', 'SmallCS')

    output = Path(output) if output else ROOT / 'docs/FINAL_SUBMISSION.pdf'
    doc = SimpleDocTemplate(str(output), pagesize=letter, rightMargin=46, leftMargin=46, topMargin=48, bottomMargin=58,
                            title=f'CartScope Alpha {c["version"]} Submission', author='CartScope team', subject='IME 4403 Alpha release, usage and verification')
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print('Built', output)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--draft', action='store_true', help='Write draft Markdown only; permit pending browser evidence.')
    parser.add_argument('--pdf', action='store_true', help='Build final PDF after the version/hash/provenance gates pass.')
    args = parser.parse_args()
    if args.draft and args.pdf:
        parser.error('Draft mode cannot create the final PDF.')
    c = context(args.draft)
    (ROOT / 'docs/CANVAS_SUBMISSION.md').write_text(canvas_text(c))
    (ROOT / 'docs/FINAL_SUBMISSION.md').write_text(report_text(c))
    print(f'Canvas: {len(canvas_text(c).split())} whitespace-delimited words; runtime {c["version"]}; Chrome evidence {c["tested_version"]}.')
    if args.pdf:
        build_pdf(c)


if __name__ == '__main__':
    main()
