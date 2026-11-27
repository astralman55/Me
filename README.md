# andylowry.com

Plain HTML, one stylesheet, one serverless function. No framework, no build step.

```
index.html            home
writing/              essays (one .html per post) + index
reading.html          books & sites
building.html         projects
buying.html           things worth the money
trashing.html         things thrown out
subscribe.html        newsletter
api/subscribe.js      POST → Buttondown
assets/style.css      all styles (light + dark)
assets/site.js        progressive-enhancement for the form
rss.xml, sitemap.xml  feeds
```

## Deploy (Vercel)

1. Import this repo in Vercel. Framework preset: **Other**. No build command, output dir = root.
2. Project → Settings → Domains → add `andylowry.com` (and `www` → redirect).
3. Newsletter: create a free [Buttondown](https://buttondown.com) account, copy the API key,
   add `BUTTONDOWN_API_KEY` under Project → Settings → Environment Variables, redeploy.
   Until it's set, the form politely says the newsletter isn't open yet.

## Adding a post

Copy any file in `writing/`, change the title/date/body, then add a line to
`writing/index.html`, the home page list, `rss.xml` and `sitemap.xml`.
