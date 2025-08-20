# UPSC Prelims Predictor (GS Paper I)

### Quick Start
1. Upload your PYQ dataset to `data/pyq.csv` (see `data/pyq_template.csv`).
2. Enable **GitHub Pages**: Settings → Pages → Deploy from branch → `main` → root (/).
3. Enable **GitHub Actions** and run workflow **Retrain & Publish Artifacts**.
4. Open your Pages URL.

### Data columns (CSV)
`id,year,subject,topic,question,options_json,answer,explanation,sources_json,ca_window`

- `options_json` must be a JSON array of strings, e.g. `["A","B","C","D"]`.
- `answer` is the **0-based** index of the correct option.
- `sources_json` is a JSON array of objects: `[{"title":"PRS Note","url":"https://prsindia.org/..."}]`.
