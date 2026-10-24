# Publication and custom-domain handover

Intended domain: **andrewgrupp.com**. Registration and ownership are unconfirmed. No DNS or custom-domain change is made by this repository.

## Author input still needed

1. Register or confirm ownership of `andrewgrupp.com` and provide access to its DNS settings when ready.
2. Create and test `hello@andrewgrupp.com` with a mail provider. GitHub Pages does not provide email. Set `emailEnabled` to `true` only after receiving a test message successfully.
3. Set up the email list in Kit with a virtual mailing address (see [Email list](#email-list-kit) below).

The mandatory Ash and Pine front cover is extracted from Andrew's approved final PDF and integrated locally. The book description and confirmed product/playlist links are preserved. Housefall uses Andrew's supplied promotional synopsis and remains historical fiction in progress, with no publication date or purchase link. There are no remaining redesign content approvals. Journal and correspondence remain hidden until functional content or a tested mailbox is available.

## Email list (Kit)

The site's signup is built and hidden behind `letters.enabled` in `content/site.json`. Deliverability depends on the domain, so do this after the domain and its DNS are in hand.

1. **Mailing address.** US law (CAN-SPAM) requires a valid postal address in every marketing email. Use a virtual mailbox or PO box, not a residence: for example a USPS PO Box, a UPS Store mailbox, or a virtual-mail service such as Anytime Mailbox or iPostal1. Confirm the provider gives a street-style address that accepts mail.
2. **Kit account.** Sign up for the free Newsletter plan at kit.com. Enter the virtual address as the account's physical address (it appears in the email footer).
3. **Sending domain.** In Kit's email settings, set the sender to an `@andrewgrupp.com` address (for example `letters@` or `hello@`) and add the DKIM/SPF records Kit supplies to the domain's DNS. Add a DMARC record if the mail provider has not (`_dmarc` TXT, starting with `v=DMARC1; p=none;`). Preserve these when editing website records.
4. **Form.** Create an inline form in Kit. In its settings:
   - Turn on double opt-in (incentive email).
   - Set the after-subscribe redirect to `https://andrewgrupp.com/letters/thanks/`.
   - Set the after-confirm redirect to `https://andrewgrupp.com/letters/confirmed/`.
   - Copy the form's numeric ID from its URL or embed code.
5. **Welcome email.** Add a short welcome sequence or automation. Optionally include a small thank-you (an unpublished poem or an early Housefall passage).
6. **Turn it on.** In `content/site.json`, set `letters.formAction` to `https://app.kit.com/forms/<ID>/subscriptions` and `letters.enabled` to `true`. The build rejects any other form address.
7. **Test end to end** on the live site: subscribe with a personal address, confirm you land on the two pages above, confirm the welcome arrives in the inbox (not spam), and that unsubscribing works. Kit may show its own spam check (reCAPTCHA) before redirecting; that is expected.
8. **Books.** Add `andrewgrupp.com/letters/` to the back matter of the next Ash and Pine revision (Kindle and print).

Privacy: the site itself still loads no scripts or trackers. Kit's emails track opens and clicks by default; review the tracking options in Kit's settings if you'd rather limit them.

## Current GitHub Pages setup

Repository: https://github.com/hearthwalker/andrewgrupp.com

Temporary site: https://hearthwalker.github.io/andrewgrupp.com/

GitHub Pages must use **GitHub Actions** as its source. Each push to `main` rebuilds and checks the pages before deploying. The deployment environment is `github-pages`.

## Namecheap DNS, when the domain is owned

These instructions use GitHub’s documented IPv4 records and Namecheap’s Advanced DNS interface. Confirm the linked official guidance when making the change.

1. In the GitHub account’s **Settings → Pages**, verify `andrewgrupp.com` by adding the specific TXT record GitHub supplies. Its value cannot be prepared before GitHub issues it. Preserve the TXT record afterward.
2. In the repository’s **Settings → Pages → Custom domain**, enter `andrewgrupp.com` and save **before** pointing DNS at GitHub.
3. If using Namecheap BasicDNS, open **Domain List → Manage → Advanced DNS → Host Records**. If using other nameservers, edit records at the actual authoritative DNS provider instead.
4. Remove only conflicting website parking/redirect records for `@` and `www`. Preserve mail-provider MX, SPF, DKIM, DMARC and other unrelated verification records.
5. Add these records, using automatic/default TTL:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | hearthwalker.github.io |

Do not include the repository path or `https://` in DNS values. Do not add a wildcard record. IPv6 is optional; if used, copy all four current AAAA values from GitHub’s official guidance.

6. Set the repository’s Actions variable `SITE_URL` to `https://andrewgrupp.com` and rerun the publication workflow. Actions deployment does not require a CNAME file; the Pages custom-domain setting controls routing.
7. Wait for DNS verification and certificate issuance, then enable **Enforce HTTPS** in Pages settings when available. GitHub says availability can take up to 24 hours.
8. Verify `https://andrewgrupp.com`, its `www` redirect, all book pages, canonical and Open Graph URLs, `robots.txt`, and `sitemap.xml`. Check the temporary GitHub address redirects appropriately. Verify mail delivery separately.

Official references, checked October 21, 2026:

- [GitHub: managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub: verifying domain ownership](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-your-github-pages)
- [Namecheap: linking a domain to GitHub Pages](https://www.namecheap.com/support/knowledgebase/article.aspx/9645/2208/how-do-i-link-my-domain-to-github-pages/)
