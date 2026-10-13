# Afham Ahamed — Official Developer Portfolio

> **"Building Ideas. Creating Solutions. Growing with Technology."**  
> Complete, modern, production-grade personal developer portfolio for **Abdul Nazar Afham Ahamed** (Afham Ahamed) — Web Developer, Software Developer, and AI Enthusiast from Sammanthurai, Sri Lanka.

---

## 🌟 Overview & Highlights

This portfolio website is crafted to serve as Afham Ahamed's official long-term developer platform for sharing across LinkedIn, GitHub, WhatsApp, Instagram, CVs/resumes, and career applications.

- **Zero Heavy Framework Bloat**: Built purely with high-performance semantic HTML5, modern vanilla CSS3 design systems, and vanilla modular JavaScript.
- **Sleek SaaS & Tech Aesthetic**: Tailored dark-blue palette (`#060B17`, `#0B1325`, `#00F2FE`), customizable light mode, glassmorphism headers, responsive modals, and subtle non-distracting tech animations.
- **Data-Driven Architecture**: Featured projects, certificates, achievements, and identity profiles are driven by structured JSON datasets (`data/projects.json`, `data/profile.json`, `data/certificates.json`).
- **Dynamic GitHub Public REST Integration**: Live synchronization with GitHub username `@afhamahamed7126-dotcom`. Any new public repository appears automatically without touching the HTML. Includes client-side caching to prevent rate-limit errors.
- **Interactive Lightbox & Project Details**: Full-featured modal with screenshot galleries, specifications, problems solved, role breakdown, and responsive lightbox with touch swipe and keyboard navigation.
- **Secure Contact Backend**: Complete PHP backend (`backend/contact.php`) with `.env` credential support, SMTP socket dispatch, rate limiting, anti-spam honeypot detection, input sanitization, and fallback for local development.
- **Accessibility & SEO Ready**: Structured JSON-LD schema (`Person`), OpenGraph & Twitter cards, semantic landmarks, ARIA attributes, and respects `prefers-reduced-motion`.

---

## 📁 Repository & Folder Structure

```
afham-portfolio/
│
├── index.html                  # Main responsive single-page application
│
├── assets/
│   ├── images/
│   │   ├── profile.jpg         # Profile photo (with graceful SVG fallback)
│   │   ├── profile-placeholder.svg
│   │   ├── placeholder-image.svg
│   │   ├── hero/               # Hero assets
│   │   ├── projects/
│   │   │   ├── supermarket/    # Smart Supermarket Management System
│   │   │   │   ├── cover.svg (or cover.jpg)
│   │   │   │   └── screenshots/
│   │   │   ├── student-companion/ # Student Companion Web App
│   │   │   │   ├── cover.svg (or cover.jpg)
│   │   │   │   └── screenshots/
│   │   │   └── ifdha/          # IFDHA Community Platform
│   │   │       ├── cover.svg (or cover.jpg)
│   │   │       └── screenshots/
│   │   └── certificates/       # Real certificate scans/images
│   │
│   ├── documents/
│   │   └── Afham_Ahamed_CV.pdf # Official Curriculum Vitae document
│   └── icons/
│
├── css/
│   ├── style.css               # Design system tokens, variables, typography, layouts
│   ├── responsive.css          # Responsive adaptations from 320px up to 1920px
│   └── animations.css          # Scroll reveal, typing cursors, and reduced-motion rules
│
├── js/
│   ├── main.js                 # Theme toggler, sticky nav, active scrollspy, typewriter
│   ├── projects.js             # Structured projects loader, search, filters, details modal
│   ├── github.js               # GitHub public REST API fetcher with TTL cache
│   ├── gallery.js              # Fullscreen responsive lightbox modal with swipe/keys
│   ├── contact.js              # Contact form client-side validation & AJAX handling
│   └── animations.js           # IntersectionObserver for staggered reveals
│
├── data/
│   ├── profile.json            # Identity, bio, education, experience, skills data
│   ├── projects.json           # Featured projects dataset with media & links
│   ├── certificates.json       # Certificates registry (supports rapid expansion)
│   └── achievements.json       # Verified achievements dataset
│
├── backend/
│   ├── contact.php             # Secure mailer endpoint (JSON API, honeypot, rate limiting)
│   └── config/
│       └── mail.php            # Environment loader (.env) & mail configurations
│
├── .env.example                # Template for SMTP credentials
├── .gitignore                  # Git privacy & secrets filter
└── README.md                   # Comprehensive documentation
```

---

## 🚀 Local Development Setup (XAMPP)

Because the portfolio includes a PHP contact backend, running it through **XAMPP** provides full full-stack capabilities locally.

### 1. Requirements
- **XAMPP** (with Apache and PHP 8.0+)
- Web Browser (Chrome, Edge, Firefox, or Safari)
- Visual Studio Code

### 2. Installation Steps
1. Make sure this repository folder is located inside your XAMPP `htdocs` directory:
   ```
   C:\xampp\htdocs\afham-portfolio
   ```
2. Open the **XAMPP Control Panel**.
3. Click **Start** next to **Apache**. (MySQL is optional unless you connect custom database features).
4. In your browser, navigate to:
   ```
   http://localhost/afham-portfolio/
   ```
5. You can also run PHP's built-in development server from terminal:
   ```powershell
   cd C:\xampp\htdocs\afham-portfolio
   C:\xampp\php\php.exe -S 127.0.0.1:8080
   ```
   Then open `http://localhost:8080/`.

---

## ✉️ Contact Backend & SMTP Configuration

When a visitor submits the contact form, an email is dispatched to `afhamahamed7126@gmail.com`.

### 1. Setting Up Credentials
1. Duplicate `.env.example` and rename it to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Open `.env` and fill in your secure SMTP credentials:
   ```ini
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-google-app-password
   MAIL_FROM=no-reply@afhamahamed.com
   MAIL_TO=afhamahamed7126@gmail.com
   MAIL_FROM_NAME="Afham Ahamed Portfolio"
   ```

> **Security Note**: Never commit your `.env` file to version control. It is already added to `.gitignore`. If using Gmail, generate an **App Password** from your Google Account settings (Security -> 2-Step Verification -> App Passwords).

### 2. Local Testing Fallback
If you test the form on `localhost` without an active SMTP server configured, `backend/contact.php` will safely capture and record the inquiry message into your system's temp folder (`sys_get_temp_dir() . '/afham_inquiries'`) and return a successful JSON response so you can test the frontend submission flow without errors.

---

## 🌐 Automatic GitHub Projects Integration

The section **"Automatic GitHub Repositories"** connects to:
`https://api.github.com/users/afhamahamed7126-dotcom/repos`

- **Automatic Sync**: Any time you create a new public repo on GitHub, it automatically renders here sorted by **latest updated first**.
- **No Manual HTML Editing**: Eliminates tedious updates.
- **Smart 1-Hour Cache**: Results are cached in the browser's `localStorage` for 60 minutes. This ensures fast page loads and prevents hitting GitHub's unauthenticated API rate limits (60 calls/hr).
- **Graceful Error Recovery**: If GitHub's API is temporarily unreachable, a clean fallback card allows visitors to jump straight to your GitHub profile.

---

## 🛠️ How to Add New Content in the Future

The architecture is built so you never need to rewrite HTML or break layouts when adding new accomplishments!

### 1. Adding a New Featured Project
Open `data/projects.json` and append a new project object to the array:
```json
{
  "id": "new-project-slug",
  "title": "New System Name",
  "subtitle": "Short punchy description",
  "categories": ["Web", "AI"],
  "type": "Individual / Academic",
  "year": "2026",
  "status": "Completed",
  "description": "Full summary...",
  "problem": "Problem it solves...",
  "features": ["Feature 1", "Feature 2"],
  "role": "Lead Full-Stack Developer",
  "techStack": {
    "frontend": "React, Tailwind",
    "backend": "Node.js",
    "database": "PostgreSQL",
    "languages": ["JavaScript", "SQL"],
    "frameworks": ["React", "Express"],
    "tools": ["Git", "VS Code"]
  },
  "links": {
    "github": "https://github.com/afhamahamed7126-dotcom/your-repo",
    "liveDemo": "https://your-demo.com"
  },
  "media": {
    "coverImage": "assets/images/projects/your-project/cover.jpg",
    "screenshots": [
      { "src": "assets/images/projects/your-project/screenshots/screen-1.jpg", "caption": "Dashboard view" }
    ]
  }
}
```

### 2. Adding Real Screenshots
Place your screenshot image files inside:
`assets/images/projects/<project-folder>/screenshots/`
Update the `media.screenshots` array in `data/projects.json`. If an image is missing or cannot be found, the system automatically falls back to `assets/images/placeholder-image.svg` without showing broken image icons.

### 3. Adding Certificates
When you receive your digital certificate certificates:
1. Save the image or PDF in `assets/images/certificates/`
2. Add the entry to `data/certificates.json`:
   ```json
   [
     {
       "id": "cert-1",
       "name": "Higher National Diploma in Information Technology",
       "organization": "SLIATE",
       "date": "2026",
       "description": "Comprehensive IT software and database diploma.",
       "image": "assets/images/certificates/sliate-hndit.jpg",
       "pdf": "assets/images/certificates/sliate-hndit.pdf"
     }
   ]
   ```

### 4. Updating Profile Photo & CV
- **Profile Photo**: Replace `assets/images/profile.jpg` with your photo.
- **Curriculum Vitae**: Place your updated PDF at `assets/documents/Afham_Ahamed_CV.pdf`.

---

## 🚢 Deployment Architecture

### 1. Static Frontend (GitHub Pages, Cloudflare Pages, Vercel, Netlify)
> **Crucial Note on GitHub Pages**: GitHub Pages hosts **static files only** (HTML, CSS, JS, JSON, images). It **does not run PHP**.
> If hosting your frontend on GitHub Pages:
> - The entire frontend, portfolio projects, GitHub API sync, modals, lightbox, CV download, and WhatsApp link will work 100% smoothly out of the box.
> - For the contact form, either host `backend/contact.php` on a PHP-compatible host (e.g., InfinityFree, 000webhost, Hostinger, cPanel, or VPS) and point `contact.js` fetch URL to `https://your-backend.com/backend/contact.php`, OR use a static form service such as **Formspree** or **Web3Forms** by replacing the action endpoint.

### 2. Full-Stack PHP Hosting (cPanel / Apache / VPS)
Upload the entire `afham-portfolio` folder to your server's `public_html/`. Both frontend and backend run seamlessly together.

---

## 🔒 Security Practices Implemented
- **No Hardcoded Passwords**: Credentials are strictly isolated to `.env`.
- **Honeypot Anti-Bot Field**: Invisible dummy field silently drops automated spam submissions.
- **Input Sanitization & Validation**: Server and client-side validation against header injection, cross-site scripting (XSS), and string length abuse.
- **Rate Limiting**: Protects backend endpoints against denial-of-service spam loops.
- **Content Security Headers**: Includes `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`.

---

## 📄 License & Credits
- **Designed & Developed for**: Abdul Nazar Afham Ahamed (`Afham Ahamed`)
- **Year**: 2026
- **Copyright**: All Rights Reserved.
