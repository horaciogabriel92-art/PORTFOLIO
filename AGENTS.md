# AGENTS.md - Horacio Morales Portfolio

> This file contains project-specific information for AI coding agents.  
> Project: Personal portfolio website for Horacio Morales, a web developer.  
> Language: English (all code comments and documentation)

---

## Project Overview

This is a **single-page portfolio website** showcasing the work and skills of Horacio Morales, a self-taught web developer specializing in WordPress customization and interactive web experiences.

The site features:
- Hero section with particle background animation
- Selected work/case studies showcase
- **Interactive Labs** - 8 complex JavaScript modules demonstrating various web development techniques
- Code Vault with reusable code snippets
- About section with bio
- Contact form

### Key Characteristics

- **Pure vanilla JavaScript** - No frameworks like React or Vue for the main app
- **Self-contained demos** - Interactive Labs are built from scratch without external libraries
- **Dark theme UI** with glassmorphism design
- **Responsive design** with mobile menu support

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Build Tool | Vite | ^7.3.1 |
| CSS Framework | Tailwind CSS | ^4.2.1 |
| CSS Processor | PostCSS + Autoprefixer | ^8.5.8 / ^10.4.27 |
| Icons | Lucide | (CDN) |
| Fonts | Google Fonts | Inter, JetBrains Mono, Cinzel, Quicksand |

---

## Build Commands

```bash
# Start development server
npm run dev

# Build for production (outputs to `dist/`)
npm run build

# Preview production build locally
npm run preview
```

### Build Configuration

- **Entry point**: `index.html`
- **Source files**: `src/` directory
- **Output directory**: `dist/`
- **Module type**: ES Modules (`"type": "module"` in package.json)
- **Tailwind integration**: Via `@tailwindcss/vite` plugin (see `vite.config.js`)

---

## Project Structure

```
portfolio/
├── index.html              # Main HTML file (all page sections)
├── package.json            # NPM configuration and scripts
├── vite.config.js          # Vite build configuration
├── .gitignore              # Git ignore rules
├── src/
│   ├── main.js             # Main JavaScript (all interactive logic)
│   ├── style.css           # Custom CSS + Tailwind imports
│   ├── counter.js          # Unused demo component (can be removed)
│   └── javascript.svg      # Unused asset
├── public/
│   └── vite.svg            # Favicon
└── dist/                   # Build output (generated, gitignored)
```

### Code Organization

The application follows a **single-file architecture** for simplicity:

1. **index.html** - Contains all HTML markup including:
   - Navigation
   - Hero section
   - Work/case studies
   - Interactive Labs (8 demo modules)
   - Code Vault
   - About section
   - Contact form

2. **src/main.js** - Contains all JavaScript logic:
   - Particle background animation (Canvas API)
   - Oracle/State Machine demo
   - Kanban drag-and-drop implementation
   - Live code editor simulation
   - 3D card flip animation
   - Data visualization charts
   - Command palette
   - Password strength checker
   - Image comparison slider
   - Form handling and utilities

3. **src/style.css** - Contains:
   - Tailwind CSS import (`@import "tailwindcss"`)
   - Custom CSS variables and utilities
   - Glassmorphism component styles
   - Code syntax highlighting colors
   - Animation keyframes
   - 3D transform utilities

---

## Interactive Labs

The main feature of this portfolio is the **Interactive Labs** section containing 8 demo modules:

| Lab | Description | Key Technologies |
|-----|-------------|------------------|
| State Management System | Oracle card draw with state machine | State machine pattern, CSS transitions |
| Drag & Drop API | Kanban board with columns | HTML5 Drag and Drop API |
| Live Code Editor | Simulated code editor with output | Textarea manipulation, regex |
| 3D CSS Transforms | Flippable credit card | CSS 3D transforms, perspective |
| Data Visualization | Interactive bar chart | CSS animations, DOM manipulation |
| Command Interface | Command palette with ⌘K shortcut | Keyboard events, DOM filtering |
| Real-time Validation | Password strength checker | RegExp, dynamic class switching |
| Comparison Slider | Before/after image slider | Mouse events, width manipulation |

### Important Implementation Notes

- **Título:** "Product Developer & AI Architect - Orchestrator" (NO usar "Ingeniero" ni "Fullstack")
- **Theme Toggle:** Implementado en nav, guarda preferencia en localStorage
- All interactive functions are attached to `window` object to work with inline HTML event handlers
- Uses `lucide.createIcons()` from CDN to render SVG icons
- Canvas-based particle background runs continuously
- Blog section incluye 2 posts SEO-optimizados (ocultos inicialmente)

---

## Code Style Guidelines

### HTML

- Use semantic HTML5 elements (`<nav>`, `<main>`, `<section>`, `<footer>`)
- All sections have `id` attributes for anchor navigation
- Inline event handlers are used throughout: `onclick="functionName()"`
- Lucide icons use `data-lucide` attributes: `<i data-lucide="icon-name">`

### CSS

- **Primary framework**: Tailwind CSS utility classes
- **Custom classes** for glassmorphism effects:
  - `.glass-panel` - Main card component
  - `.glass-card` - Smaller card variant
  - `.code-window` - Code display container
- **Color scheme**: Dark theme with slate/blues/purples
- **CSS variables** defined in `:root`:
  - `--dark-bg: #020617`
  - `--card-bg: rgba(15, 23, 42, 0.6)`

### JavaScript

- **ES6+ features**: const/let, arrow functions, template literals
- **No external libraries** for the interactive demos (intentional constraint)
- Functions attached to `window` for inline HTML compatibility
- Event delegation pattern used where appropriate

---

## Testing

**No automated testing is currently configured.** Testing is manual:

1. Run `npm run dev` to start development server
2. Test all 8 Interactive Labs manually
3. Verify responsive design at mobile breakpoint (< 768px)
4. Test contact form submission (currently client-side only)

---

## Deployment

The site is built as a **static website** suitable for:

- Static hosting (Netlify, Vercel, GitHub Pages)
- Traditional web hosting
- CDN distribution

### Build Process

```bash
npm run build
```

Generates optimized assets in `dist/`:
- Minified CSS and JS
- Optimized assets
- Ready for deployment

---

## Security Considerations

- Contact form uses **JWT authentication** para admin panel
- **AES encryption** para datos de clientes en Redis
- Rate limiting implementado en APIs
- No sensitive data in client-side code
- CDN resources loaded from unpkg.com and Google Fonts (HTTPS)

---

## Dependencies

### Production
None - This is a static site with no runtime dependencies.

### Development

```json
{
  "@tailwindcss/vite": "^4.2.1",
  "autoprefixer": "^10.4.27",
  "postcss": "^8.5.8",
  "tailwindcss": "^4.2.1",
  "vite": "^7.3.1"
}
```

### External CDN Resources (loaded in index.html)

- `lucide@latest` - Icon library
- `devicon@latest` - Tech stack icons
- Google Fonts (Inter, JetBrains Mono, Cinzel, Quicksand)

---

## 🎨 Secciones Principales

| Sección | Descripción | ID |
|---------|-------------|-----|
| Hero | Título + Badges tech stack | #hero |
| Work | Proyectos con métricas (Bordados Pando: -40% tiempo) | #work |
| Process | 4 pasos del workflow (Discovery → Deploy) | #process |
| Stack | Tech stack visual con iconos | #stack |
| Labs | 8 Interactive Labs (vanilla JS) | #labs |
| Blog | 2 posts SEO-optimizados | #blog |
| Code Vault | Snippets reutilizables | #snippets |
| About | Terminal JSON effect + Story | #about |
| Contact | Formulario de cotización wizard | #quote |

---

## Common Tasks

### Adding a New Interactive Lab

1. Add HTML markup in `index.html` within `#labs` section
2. Add corresponding JavaScript functions in `src/main.js`
3. Attach function to `window` object at bottom of main.js
4. Add any custom CSS in `src/style.css`
5. Test functionality with `npm run dev`

### Modifying Styles

- Use Tailwind utility classes for layout and spacing
- Use custom CSS classes for glassmorphism effects
- Update CSS variables in `:root` for global color changes

### Updating Content

- **Work section**: Edit the project cards in `#work` section
- **About section**: Update text in `#about` section
- **Code Vault**: Update snippet code blocks in `#snippets`

---

## Notes for AI Agents

- The project uses **Tailwind CSS v4** with the new `@import "tailwindcss"` syntax
- Do not introduce new build tools or frameworks without explicit permission
- Keep the "no external libraries for demos" constraint when modifying Interactive Labs
- Maintain the dark theme aesthetic
- Test on mobile viewport after any layout changes
