# 🍬 Treat Yourself

A cute, guilt-free added-sugar tracker for people who are prediabetic.

> Work in progress. This README is finished in the last build step.

## Run it

No build step and nothing to install. Serve the folder, then open the page:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000. Opening `index.html` directly won't work, because browsers block JavaScript modules on `file://`.

## Test it

```bash
npm test
```

This uses Node's built-in test runner and installs nothing.

## License

MIT. See [LICENSE](LICENSE).
