# Publication record

The site is live at **https://andrewgrupp.com** on GitHub Pages with HTTPS enforced. The `www` host and the old project address (https://hearthwalker.github.io/andrewgrupp.com/) redirect there.

## Still to do

1. **Kit mailing address.** US law (CAN-SPAM) requires a valid postal address in every marketing email, and Kit prints the account's address in each footer. Use a virtual mailbox or PO box, never a residence: a USPS PO Box, a UPS Store mailbox, or a virtual-mail service such as Anytime Mailbox or iPostal1. Set it before the first send.
2. **Kit sending-domain verification.** The SPF/DKIM/DMARC records are in Namecheap and match publicly; Kit's check had not passed yet. Press **Verify** again in Kit. If it still fails 48 hours after the records went in, ask Kit support.
3. **Deliverability test.** Once verified, send a test broadcast to a personal Gmail address and confirm it lands in the inbox, not spam or promotions.
4. **Welcome email.** Add a short welcome sequence in Kit. Optionally include a small thank-you (an unpublished poem or an early Housefall passage).
5. **Books.** Add `andrewgrupp.com/letters/` to the back matter of the next Ash and Pine revision (Kindle and print).

## What is live

- **Site:** built and checked by `.github/workflows/pages.yml` on every push to `main`, then deployed to the `github-pages` environment. Pages source is **GitHub Actions**. The Actions variable `SITE_URL` is `https://andrewgrupp.com`.
- **Correspondence:** `hello@andrewgrupp.com` forwards (free, through Namecheap) to the author's personal inbox, and delivery has been tested. The Contact page publishes it (`emailEnabled: true`).
- **Letters (email list):** Kit's free Newsletter plan. Form `10089306`, with email confirmation required. `hello@andrewgrupp.com` is Kit's default sender. Signup sections are on the homepage and Housefall page, with `/letters/`, `/letters/thanks/` and `/letters/confirmed/`. Kit's form settings redirect to the last two after signup and after confirmation.

Privacy: the site itself loads no scripts or trackers. Kit's emails track opens and clicks by default; review the tracking options in Kit's settings if you'd rather limit them.

To change the Kit form, update `letters.formAction` in `content/site.json`; the build accepts only `https://app.kit.com/forms/<ID>/subscriptions`. Setting `letters.enabled` to `false` removes every form, the Letters pages and the navigation link.

## DNS (Namecheap)

Records at Namecheap **Advanced DNS** serve the website, mail forwarding and Kit. When editing any of them, change only what you mean to and preserve the rest:

| Purpose | Type | Host | Value |
| --- | --- | --- | --- |
| Website | A | @ | 185.199.108.153 |
| Website | A | @ | 185.199.109.153 |
| Website | A | @ | 185.199.110.153 |
| Website | A | @ | 185.199.111.153 |
| Website | CNAME | www | hearthwalker.github.io |
| GitHub domain verification | TXT | as issued by GitHub | keep |
| Mail forwarding | MX / TXT | as set by Namecheap email forwarding | keep |
| Kit sending | SPF / DKIM records | as supplied by Kit | keep |
| Reporting | TXT | _dmarc | DMARC monitoring policy (`p=none`) |

Do not add a wildcard record. In Namecheap, the **Host** field takes only the part before the domain (for example `_dmarc`, not `_dmarc.andrewgrupp.com`).

If the site ever moves, also update `SITE_URL` and the custom domain in the repository's **Settings → Pages**.

Official references, checked October 21, 2026:

- [GitHub: managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub: verifying domain ownership](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-your-github-pages)
- [Namecheap: linking a domain to GitHub Pages](https://www.namecheap.com/support/knowledgebase/article.aspx/9645/2208/how-do-i-link-my-domain-to-github-pages/)
