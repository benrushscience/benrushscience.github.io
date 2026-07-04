# username.github.io

Starter layout for a GitHub Pages personal website.

## Structure

- `index.html` - Home page
- `pages/*/index.html` - Section pages
- `assets/css/site.css` - Shared styles
- `assets/js/site.js` - Shared script
- `data/cv.yml` - Source data for the CV page
- `scripts/build-cv-page.js` - Rebuilds the CV page from `data/cv.yml`
- `assets/images/` - Image assets
- `assets/docs/` - Downloadable files (CV, PDFs)

## CV updates

Edit `data/cv.yml` when adding or changing CV entries. The section `content` blocks
support the same HTML tables and paragraphs that render on the website.

After editing the data file, run:

```sh
node scripts/build-cv-page.js
```

The script updates the generated CV content in `pages/cv/index.html` while keeping
the page shell, navigation, footer, and accordion behavior intact.

## Publish steps

1. Rename this folder/repo to your exact GitHub username format: `<username>.github.io`.
2. Push to GitHub as that repository name.
3. In GitHub repo settings, enable Pages from `main` branch root.
4. Visit `https://benrushscience.github.io/`.
