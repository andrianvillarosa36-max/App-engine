# TileForge

A mobile-first tool for building 2D game menus and tile-based worlds —
prototype UI for the app described in `Game_Engine_Application_Design_And_Feature_Specification.txt`.

Built with React + Vite. Currently a UI prototype: navigation, project
management (create/rename/delete/reorder), a guided project wizard, and
placeholder Menu/Tilemap editor screens are all wired up. There's no real
canvas or persistence yet — that's the next milestone.

## Project structure

```
tileforge/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx      # React entry point
│   ├── App.jsx        # All screens + app shell
│   └── index.css      # Global reset
└── .gitignore
```

## Running it locally (in Termux)

Termux can't run a GUI, so you develop here and preview in your phone's
browser over `localhost`.

**1. Install Node and git, if you haven't already:**

```bash
pkg update && pkg upgrade
pkg install nodejs-lts git
```

**2. Get the project into Termux.**

If you're starting from this scaffold, copy/move the `tileforge/` folder
into your Termux home (e.g. via a shared storage folder — run
`termux-setup-storage` once if you need access to `~/storage/shared`),
then:

```bash
cd tileforge
```

**3. Install dependencies:**

```bash
npm install
```

**4. Run the dev server:**

```bash
npm run dev
```

Vite will print a `Local` and a `Network` URL. Open the `Network` one
(something like `http://192.168.x.x:5173`) in your phone's browser to see
the app live — the `--host` flag in the `dev` script is what exposes it
beyond localhost.

## Pushing to GitHub from Termux

**1. Create the repo on GitHub first** (via the website or GitHub app) —
name it, don't initialize it with a README since this project already has
one.

**2. Set your git identity (once per Termux install):**

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**3. Authentication — GitHub no longer accepts your account password over
git.** Use a Personal Access Token instead:

- On GitHub: Settings → Developer settings → Personal access tokens →
  Fine-grained tokens → Generate new token. Give it `Contents:
  Read and write` on this repo.
- Copy the token somewhere safe — GitHub only shows it once.
- When you `git push`, use your GitHub username as the username and the
  token as the password when prompted.

**4. From inside `tileforge/`:**

```bash
git init
git add .
git commit -m "Initial commit: TileForge UI prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

If typing the token at the prompt is annoying, you can instead put it
directly in the remote URL (fine for a personal device, just don't commit
it anywhere):

```bash
git remote set-url origin https://<your-username>:<token>@github.com/<your-username>/<repo-name>.git
```

## Building for production

```bash
npm run build
```

Outputs a static site to `dist/` — deployable as-is to GitHub Pages,
Netlify, Vercel, or any static host.

## Roadmap

Tracking the "Future Roadmap" section of the original spec:

- [ ] Project Manager (persistence — currently in-memory only)
- [ ] Asset Manager
- [ ] Terrain Manager
- [ ] Character Editor
- [ ] Dialogue System
- [ ] Quest System
- [ ] Inventory System
- [ ] Combat System
- [ ] Export Playable Game
