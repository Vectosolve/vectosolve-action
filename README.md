# VectoSolve Action - Convert Images to SVG

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-VectoSolve-blue?logo=github)](https://github.com/marketplace/actions/vectosolve-image-to-svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Convert raster images (PNG, JPG, WebP, BMP, TIFF, GIF) to clean, scalable SVG vector format using [VectoSolve](https://vectosolve.com) AI-powered vectorization.

---

## Usage

### Single file conversion

```yaml
name: Vectorize Image
on: [push]

jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Convert image to SVG
        uses: go-to-agency/vectosolve-action@v1
        with:
          api_key: ${{ secrets.VECTOSOLVE_API_KEY }}
          file_path: assets/logo.png

      - name: Commit SVG
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add "*.svg"
          git commit -m "Convert images to SVG" || echo "No changes"
          git push
```

### Batch conversion with glob

```yaml
name: Batch Vectorize
on:
  push:
    paths:
      - "assets/images/**"

jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Find and convert images
        run: |
          for file in assets/images/*.{png,jpg,webp}; do
            [ -f "$file" ] || continue
            echo "Converting $file..."
          done

      - name: Convert each image
        uses: go-to-agency/vectosolve-action@v1
        with:
          api_key: ${{ secrets.VECTOSOLVE_API_KEY }}
          file_path: assets/images/logo.png
          output_path: assets/vectors/logo.svg
```

### On pull request (convert changed images)

```yaml
name: Vectorize Changed Images
on:
  pull_request:
    paths:
      - "**.png"
      - "**.jpg"
      - "**.webp"

jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Get changed image files
        id: changed
        run: |
          FILES=$(git diff --name-only HEAD~1 -- '*.png' '*.jpg' '*.webp' 2>/dev/null || echo "")
          echo "files=$FILES" >> "$GITHUB_OUTPUT"

      - name: Convert first changed image
        if: steps.changed.outputs.files != ''
        uses: go-to-agency/vectosolve-action@v1
        with:
          api_key: ${{ secrets.VECTOSOLVE_API_KEY }}
          file_path: ${{ steps.changed.outputs.files }}
```

### Custom output path

```yaml
- name: Convert with custom output
  uses: go-to-agency/vectosolve-action@v1
  with:
    api_key: ${{ secrets.VECTOSOLVE_API_KEY }}
    file_path: src/assets/photo.jpg
    output_path: public/vectors/photo.svg
```

---

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api_key` | Yes | - | Your VectoSolve API key. Store as a [GitHub secret](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions). |
| `file_path` | Yes | - | Path to the image file to convert (PNG, JPG, WebP, BMP, TIFF, GIF). |
| `output_path` | No | `{input_name}.svg` | Path for the output SVG file. Defaults to the input filename with `.svg` extension. |

## Outputs

| Output | Description |
|--------|-------------|
| `svg_path` | Absolute path to the generated SVG file |
| `processing_time_ms` | Total processing time in milliseconds |
| `credits_used` | Number of credits consumed for this conversion |
| `credits_remaining` | Your remaining credit balance |

---

## Setup

1. **Get an API key** at [vectosolve.com/dashboard](https://vectosolve.com/dashboard)
2. **Add the key** as a repository secret named `VECTOSOLVE_API_KEY`
3. **Use the action** in your workflow as shown above

---

## Pricing

Each vectorization costs **$0.20** (1 credit). Free preview conversions are available on [vectosolve.com](https://vectosolve.com).

View plans and purchase credits at [vectosolve.com/pricing](https://vectosolve.com/pricing).

---

## Supported Formats

| Input Format | Extension |
|-------------|-----------|
| PNG | `.png` |
| JPEG | `.jpg`, `.jpeg` |
| WebP | `.webp` |
| BMP | `.bmp` |
| TIFF | `.tiff`, `.tif` |
| GIF | `.gif` |

**Output**: SVG (Scalable Vector Graphics)

---

## Links

- [VectoSolve](https://vectosolve.com) - AI-powered image to SVG converter
- [Developer Docs](https://vectosolve.com/developers) - API reference and SDKs
- [Pricing](https://vectosolve.com/pricing) - Plans and credit packs
- [Dashboard](https://vectosolve.com/dashboard) - Manage your API keys

---

## License

MIT - see [LICENSE](LICENSE) for details.
