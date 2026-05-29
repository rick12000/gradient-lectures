# Gradient Lectures

A free, open, and deeply interconnected repository of machine learning and mathematical knowledge. Built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

This guide is written for anyone looking to run, edit, or build this website locally, even with little to no front-end experience.

---

## 1. Prerequisites (Environment Setup)

To run this project on your computer, you need **Node.js** (the environment that runs JavaScript outside the browser) and **npm** (Node Package Manager, which downloads the code libraries this project needs).

1. **Download Node.js**: Go to [nodejs.org](https://nodejs.org/) and download the **LTS (Long Term Support)** version.
2. **Install it**: Run the installer. It will automatically install both `node` and `npm`.
3. **Verify Installation**: Open your computer's terminal (Command Prompt or PowerShell on Windows, Terminal on Mac/Linux) and type:
   ```bash
   node -v
   npm -v
   ```
   If both commands print out version numbers (e.g., `v20.x.x`), you are ready to go!

---

## 2. Getting Started (A to Z)

Once you have the code on your machine and Node.js installed, follow these steps to get the website running.

### Step A: Open the Terminal in the Project Folder
Open your terminal and navigate to the folder where this project is located. If you are using an IDE like VS Code or Cursor, you can just open the built-in terminal (usually `Ctrl + \` or `Cmd + \`).

### Step B: Install Dependencies
The `package.json` file acts as a recipe book. It tells `npm` exactly which libraries (like Astro, Starlight, KaTeX, and Mermaid) the project needs to work.

To download all these ingredients, run:
```bash
npm install
```
*Note: You only need to do this once, or whenever someone adds a new library to `package.json`.*

### Step C: Start the Development Server
To see the website live on your computer and make changes, run:
```bash
npm run dev
```
This starts a local server. Open your web browser and go to the URL provided in the terminal (usually `http://localhost:4321/gradient-lectures`). 

**Magic feature:** As long as this server is running, any time you save a file in the code, your browser will automatically refresh to show the changes!

**How to stop the server:** When you are done working, go back to your terminal and press `Ctrl + C` (on both Windows and Mac). It will ask "Terminate batch job (Y/N)?", type `Y` and press Enter.

---

## 3. How to Develop and Edit Content

Here is where everything lives in the project:

- **`public/`**: Static files served at the site root as-is. Currently contains only `favicon.svg`. Images and other processed assets belong in `src/assets/` — do not put content here.
- **Notes & Content**: `src/content/docs/`
  - All the text is written in `.mdx` files (Markdown with extra features). You can add new folders and files here, and they will automatically become pages on the website.
- **Styling (CSS)**: `src/styles/custom.css`
  - This is where all the colors, fonts, and layout rules are defined. We use a custom Light Mode theme.
- **Components**: `src/components/`
  - Custom UI components are built here as `.astro` files: `Callout`, `TrackCard`, `TrackOverview`, `Pagination`, and sidebar layout components.
- **Configuration**: `astro.config.mjs`
  - This file controls the website's title, the left sidebar navigation structure, and plugins (like math rendering). If you add a new note, you must add it to the `sidebar` array in this file for it to show up in the navigation.

### Helper Script: Formatting Math
Because these notes were originally written in Obsidian, display math blocks need to use **multiline** `$$` delimiters (opening and closing `$$` on their own lines). Single-line `$$...$$` is parsed as inline math and will appear left-aligned.

If you add new notes from Obsidian and the math looks broken or left-aligned, run this helper script in your terminal:
```bash
npm run format-math
```
*This converts single-line `$$` to multiline display blocks, dedents math inside lists, and collapses extra blank lines (three or more become one).*

### Mermaid diagrams

Notes can include diagrams with fenced `mermaid` code blocks. Rendering is handled by [`astro-mermaid`](https://www.npmjs.com/package/astro-mermaid) (configured in `astro.config.mjs`). Diagrams render client-side as SVG using the `neutral` Mermaid theme.

Example pages: **DAG** and **TARNet** in the Causal Inference track.

If you see raw diagram text instead of a chart, restart the dev server after `npm install` so the Mermaid client bundle loads.

### Spacing in notes

Vertical spacing is controlled by CSS variables in `src/styles/custom.css` (`--gl-space-*`). In the MDX source, use **at most one blank line** between blocks — multiple blank lines create empty paragraphs and uneven gaps. Run `npm run format-math` after pasting content to normalize spacing.

---

## 4. Building for Production

When you are done making changes and want to prepare the website to be hosted on the internet (e.g., GitHub Pages), you need to "build" it. 

Building takes all your Markdown, Astro components, and CSS, and compiles them into highly optimized, plain HTML, CSS, and JavaScript files.

### Step A: Run the Build Command
In your terminal, stop the dev server (press `Ctrl + C`) and run:
```bash
npm run build
```
This will create a new folder called `dist/`. This folder contains the final, production-ready website.

### Step B: Preview the Build (Optional but Recommended)
To test exactly what the final website will look and feel like, run:
```bash
npm run preview
```
This serves the `dist/` folder locally so you can click around and ensure nothing broke during the build process.

---

## Summary of Important Commands

| Command | What it does | When to use it |
| :--- | :--- | :--- |
| `npm install` | Downloads required libraries. | First time setup, or after `package.json` changes. |
| `npm run dev` | Starts the live-reloading local server. | When you are actively writing or coding. |
| `npm run format-math`| Fixes Obsidian math block formatting. | After pasting new notes with `$$` math blocks. |
| `npm run build` | Compiles the site into static HTML/CSS. | When you are ready to publish/deploy. |
| `npm run preview` | Serves the compiled production site. | To test the final build before publishing. |