# SamyStackOS

**SamyStackOS** is an early-stage, Debian-based homelab operating-system project exploring simpler management of a cluster of mini PCs and home servers.

> **Status:** In development. The public website describes a product vision and includes a non-functional dashboard mockup. There is currently **no production-ready installer** published in this repository.

## Website

The public website lives in [`docs/`](docs/).

- Website (after DNS and Pages activation): https://samystack.com
- Temporary GitHub Pages URL (before the custom domain is configured): https://zeginbarrett.github.io/SamyStackOS/
- [Landing page source](docs/index.html)

### Publish with GitHub Pages

1. Open **Settings → Pages** in this repository.
2. Set **Source** to **Deploy from a branch**.
3. Select branch **main**, folder **/docs**, then **Save**.
4. When GitHub Pages is working, add **samystack.com** under **Custom domain** in the same Pages settings and save.
5. In Namecheap **Domain List → Manage → Advanced DNS**, use these host records:

   | Type | Host | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | zeginbarrett.github.io |

   Remove only conflicting **web** A/AAAA/CNAME/URL Redirect records for `@` or `www`; **do not remove MX/TXT or other unrelated mail records**. These steps assume Namecheap DNS is authoritative for this domain.

6. After DNS and certificate provisioning finish, enable **Enforce HTTPS** in GitHub Pages settings.

**Note:** GitHub Pages custom-domain setup is not completed by uploading these files alone; the repository owner must enable Pages, configure the custom domain, and update DNS.

## Planned platform directions

- Node discovery and guided installation
- Virtual-machine and container management
- Unified web dashboard
- Cluster resource visibility
- Storage and networking controls
- Backup, recovery, and eventual high availability
- Easier deployment of self-hosted services

These items are targets, not claims of currently delivered functionality.

## Editing the website

The site is static and needs **no framework, build step, Node.js, or paid hosting**. Update `docs/index.html`, `docs/styles.css`, or `docs/app.js` and commit to `main`. GitHub Pages will redeploy from the selected folder.

## Project information

Independent project, not affiliated with Proxmox. No production stability or security guarantees are made at this stage.
