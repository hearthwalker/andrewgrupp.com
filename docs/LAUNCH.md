# Publication and custom-domain handover

Intended domain: **andrewgrupp.com**. Registration and ownership are unconfirmed. No DNS or custom-domain change is made by this repository.

## Author input still needed

1. Register or confirm ownership of `andrewgrupp.com` and provide access to its DNS settings when ready.
2. Create and test `hello@andrewgrupp.com` with a mail provider. GitHub Pages does not provide email. Set `emailEnabled` to `true` only after receiving a test message successfully.
3. Supply the actual Ash and Pine cover if it should appear. This is an optional visual addition, not a requirement for launching the text-led site.

Photography and journal entries are optional. The approved Ash and Pine description, Amazon purchase URL, and companion Spotify playlist are configured.

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
