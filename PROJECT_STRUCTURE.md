# KTV Fußball - Projektstruktur

```
ktv-football-app/
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
│
├── app/
│   ├── layout.tsx                    # Root Layout (Header, Meta)
│   ├── page.tsx                      # Main Page (Routing Logic)
│   └── globals.css                   # Global Styles
│
├── components/
│   ├── LoginView.tsx                 # Login + Passwort-Änderung
│   ├── AdminView.tsx                 # Admin-Bereich
│   └── UserView.tsx                  # User Anmeldeliste
│
├── lib/
│   ├── supabase.ts                   # Supabase Client + Types
│   ├── db.ts                         # Database Service Layer
│   ├── migrations.ts                 # Auto-Migration Runner
│   └── __tests__/
│       └── db.test.ts                # Unit Tests
│
├── migrations/
│   └── 001_initial_setup.sql         # Initial DB Schema
│
├── public/
│   ├── manifest.json                 # PWA Manifest
│   ├── icon-192.png                  # App Icon (192x192)
│   └── icon-512.png                  # App Icon (512x512)
│
├── .env.example                      # Environment Variables Template
├── .gitignore                        # Git Ignore Rules
├── jest.config.js                    # Jest Configuration
├── jest.setup.js                     # Jest Setup
├── next.config.js                    # Next.js Configuration
├── package.json                      # Dependencies
├── postcss.config.js                 # PostCSS Configuration
├── tailwind.config.js                # Tailwind Configuration
├── tsconfig.json                     # TypeScript Configuration
│
├── README.md                         # Ausführliche Dokumentation
├── QUICKSTART.md                     # Schnellanleitung
├── DEPLOYMENT_CHECKLIST.md           # Deployment Checkliste
└── PROJECT_STRUCTURE.md              # Diese Datei
```

## Wichtige Dateien erklärt

### Konfiguration
- **package.json**: Alle Dependencies, Scripts
- **tsconfig.json**: TypeScript Compiler Settings
- **tailwind.config.js**: Tailwind CSS Konfiguration (Farben, etc.)
- **next.config.js**: Next.js App Configuration

### App-Logic
- **app/page.tsx**: Main Entry Point, View Routing
- **components/*.tsx**: React Components für UI
- **lib/db.ts**: Alle Datenbank-Funktionen
- **lib/supabase.ts**: Supabase Client Setup

### Database
- **migrations/**: SQL Migration Scripts
- Auto-Migration beim App-Start via `lib/migrations.ts`

### Testing & CI/CD
- **lib/__tests__/**: Unit Tests
- **.github/workflows/ci.yml**: Automatische Tests bei Git Push

### PWA (Progressive Web App)
- **public/manifest.json**: App Metadata
- **public/icon-*.png**: App Icons (erstelle diese noch!)

## Was fehlt noch?

### Icons erstellen
Du brauchst noch App-Icons:
1. Erstelle ein Logo/Icon (192x192 und 512x512 px)
2. Speichere als `public/icon-192.png` und `public/icon-512.png`
3. Oder nutze einen Generator wie favicon.io

### Optional: Weitere Features
- Email-Benachrichtigungen (z.B. via Supabase Edge Functions)
- Push-Notifications
- Statistiken/Reports
- Export-Funktion für Anmeldungen

## Dateien zum Hochladen

**Mindestens diese Dateien brauchst du:**

### Root Level (11 Dateien)
1. package.json
2. tsconfig.json
3. tailwind.config.js
4. postcss.config.js
5. next.config.js
6. .env.example
7. .gitignore
8. jest.config.js
9. jest.setup.js
10. README.md
11. QUICKSTART.md

### app/ (3 Dateien)
12. app/layout.tsx
13. app/page.tsx
14. app/globals.css

### components/ (3 Dateien)
15. components/LoginView.tsx
16. components/AdminView.tsx
17. components/UserView.tsx

### lib/ (4 Dateien)
18. lib/supabase.ts
19. lib/db.ts
20. lib/migrations.ts
21. lib/__tests__/db.test.ts

### migrations/ (1 Datei)
22. migrations/001_initial_setup.sql

### public/ (1 Datei)
23. public/manifest.json

### .github/workflows/ (1 Datei)
24. .github/workflows/ci.yml

**Total: 24 Dateien** (+ optional 2 Icon-Dateien)

## Größe
- Gesamtgröße: ~50 KB (ohne node_modules)
- Mit node_modules: ~200 MB (wird von Vercel automatisch installiert)
