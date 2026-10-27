# Readership work -- October 27, 2026

## Prepared in this checkout

- [x] Kit signup directly below the homepage Hearthwalker excerpt, with the supplied invitation.
- [x] Same signup beneath the Ash and Pine playlist.
- [x] Separate Kindle $3.99 and Paperback $15 buttons on the homepage and book page.
- [x] Free to read on Kindle Unlimited beneath the Kindle button, per the author's KDP Select confirmation.
- [x] Homepage copy about the daughter never held, children 800 miles away, a God who didn't show, and the fire that stayed lit, drawn from the existing description.
- [x] Housefall retains its Letters signup.
- [x] Optional Cloudflare beacon integration, disabled until a real site token is supplied.

These are local changes until deployed through the existing GitHub Pages workflow.

Validation: the build and site checker pass for all 10 HTML pages and 179 local links/assets. Isolated builds also pass with a configured analytics token and with Letters disabled. Browser review covered the homepage at desktop and 390px, plus Ash and Pine at 390px and 320px; checked phone layouts had no horizontal overflow. Screenshots are in the ignored `artifacts/readership/` directory. No new subscription was submitted during this review.

## Cloudflare activation

- [ ] In [Cloudflare Web Analytics](https://dash.cloudflare.com/?to=/:account/web-analytics), add `andrewgrupp.com` as a site.
- [ ] Copy the site token from the supplied JavaScript snippet into `analytics.cloudflareToken` in `content/site.json`. This is a public beacon token, not an account API credential.
- [ ] Build, check and deploy the site, then confirm visits appear in the Cloudflare dashboard.

The site stays on GitHub Pages with its current DNS. Follow Cloudflare's [setup for sites not proxied through Cloudflare](https://developers.cloudflare.com/web-analytics/get-started/).

## Kit account work

- [ ] Confirm sending-domain verification and broadcast deliverability; both remained open in the publication record.
- [ ] Configure and verify signup attribution for homepage, Letters, Ash and Pine, and Housefall. All current forms submit to form `10089306`; the site does not claim page tags are being saved. Separate Kit forms per placement are one option; update the site integration after the account setup is chosen.
- [ ] Review the existing confirmation email before building a separate welcome automation. Per the October 24 launch record, it already includes a welcome note, the opening of Hearthwalker and a book link, and a Gmail test succeeded. A separate post-confirmation welcome email and mobile review are not recorded as complete.
- [ ] Write and send the first letter, including one Housefall line.
- [ ] Choose a letter rhythm and put the next date in Reminders.

## Work outside this site checkout

- Threads: check per-post link clicks, apply the posting playbook, draft the NaNo follow-up, and reply to unanswered commenters. Do not infer book sales from site traffic.
- Weekly measurement: record site visits, new confirmed subscribers and KDP books sold; compare link-in-body and link-in-reply posts after two weeks.
- Signing: generate a QR code for `https://andrewgrupp.com/letters/`, prepare the table card and paper signup backup, and handle consent and Kit import afterward.
- Event listing: add the Dotted Daisy signing to the site and announce it once its date, time and location are confirmed.

The date-sensitive priority is deploying the homepage signup before November 1. The preceding Saturday is October 31, 2026.
