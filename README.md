# proud
This is my portfolio include all my work experience and project details.

## Design checkpoints

Before every major redesign, commit the current website, content, and assets and push that checkpoint to GitHub **before editing**. Use a descriptive commit title and body listing the changes. After checking a major update, commit and push the result as well.

- `862f10f`: original dark violet design with JSON-driven content, Product / Project positioning, Personality & Story, and updated photos. Restore this version through Git history if needed.

Content lives in `portfolio-data.json`; the playful visual layer lives in `portfolio-playful.css`.

## Deploy on Vercel

- Import this GitHub repo in Vercel.
- Framework Preset: Other
- Build Command: leave empty or use `npm run build`
- Output Directory: leave empty
- Root route `/` is configured to open `portfolio_website.html`.
