# KTV Fußball App - Projektstruktur

## 🔗 RAW-URLs für Claude-Analyse

**Kopiere diese URLs und füge sie in den Chat ein, damit Claude alle Dateien analysieren kann:**

```
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/.github/workflows/ci.yml
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/app/layout.tsx
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/app/page.tsx
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/app/globals.css
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/components/AdminView.tsx
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/components/LoginView.tsx
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/components/UserView.tsx
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/lib/db.ts
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/lib/migrations.ts
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/lib/season-config.ts
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/lib/supabase.ts
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/lib/__tests__/db.test.ts
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/lib/__tests__/registrations.test.ts
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/lib/__tests__/season-config.test.ts
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/migrations/001_initial_setup.sql
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/migrations/002_add_guests.sql
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/migrations/003_add_season_and_utensils.sql
https://github.com/WackiTricksDaSys/KTVFussball/blob/main/migrations/004_add_items_to_registrations.sql
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/public/header.png
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/public/manifest.json
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/.env.example
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/.gitignore
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/FINALE_ZUSAMMENFASSUNG.md
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/jest.config.js
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/jest.setup.js
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/next.config.js
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/package.json
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/postcss.config.js
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/PROJECT_STRUCTURE.md
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/QUICKSTART.md
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/README.md
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/tailwind.config.js
https://raw.githubusercontent.com/WackiTricksDaSys/KTVFussball/main/tsconfig.json
```


## Übersicht

Diese Datei beschreibt die vollständige Struktur des KTV Fußball App Projekts.

```
KTVFussball/
│
├── .github/
│   └── workflows/
│       └── ci.yml                         # GitHub Actions CI/CD
│
├── app/
│   ├── layout.tsx                         # Root Layout (Header, Meta)
│   ├── page.tsx                           # Main Page (Routing Logic)
│   └── globals.css                        # Global Styles
│
├── components/
│   ├── AdminView.tsx                      # Admin-Bereich
│   ├── LoginView.tsx                      # Login + Passwort-Ändering
│   └── UserView.tsx                       # User Anmeldeliste
│
├── lib/
│   ├── __tests__/
│   │   ├── db.test.ts                     # Database Unit Tests
│   │   ├── registrations.test.ts          # Registration Tests
│   │   └── season-config.test.ts          # Season Config Tests
│   ├── db.ts                              # Database Service Layer
│   ├── migrations.ts                      # Auto-Migration Runner
│   ├── season-config.ts                   # Saison-Konfiguration (Sommer/Winter)
│   └── supabase.ts                        # Supabase Client + Types
│
├── migrations/
│   ├── 001_initial_setup.sql              # Initial DB Schema
│   ├── 002_add_guests.sql                 # Add Guests Feature
│   └── 003_add_season_and_utensils.sql    # Add Season & Utensils
│
├── public/
│   ├── header.png                         # Header Image
│   └── manifest.json                      # PWA Manifest
│
├── .env.example                           # Environment Variables Template
├── .gitignore                             # Git Ignore Rules
├── FINALE_ZUSAMMENFASSUNG.md              # Finale Zusammenfassung
├── jest.config.js                         # Jest Configuration
├── jest.setup.js                          # Jest Setup
├── next.config.js                         # Next.js Configuration
├── package.json                           # Dependencies
├── postcss.config.js                      # PostCSS Configuration
├── PROJECT_STRUCTURE.md                   # Diese Datei
├── QUICKSTART.md                          # Schnellanleitung
├── README.md                              # Ausführliche Dokumentation
├── tailwind.config.js                     # Tailwind Configuration
└── tsconfig.json                          # TypeScript Configuration
```

## Datei-Beschreibungen

### Root-Ordner (16 Dateien)

- **.env.example**: Template für Environment Variables (Supabase URL & Keys)
- **.gitignore**: Definiert ignorierte Dateien für Git
- **DEPLOYMENT_CHECKLIST.md**: Schritt-für-Schritt Deployment-Anleitung
- **FINALE_ZUSAMMENFASSUNG.md**: Zusammenfassung aller Features und Änderungen
- **HEADER_IMAGE_SETUP.md**: Anleitung zum Einrichten des Header-Bildes
- **jest.config.js**: Jest Test-Konfiguration
- **jest.setup.js**: Jest Setup-Datei für Testing Library
- **KTV Fussball - Final...pdf**: PDF-Dokumentation des Projekts
- **next.config.js**: Next.js Konfiguration (Environment Variables)
- **package.json**: NPM Dependencies und Scripts
- **postcss.config.js**: PostCSS Konfiguration für Tailwind
- **PROJECT_STRUCTURE.md**: Diese Datei - Projektstruktur-Übersicht
- **QUICKSTART.md**: Schnellstart-Guide (15 Minuten Setup)
- **README.md**: Hauptdokumentation mit ausführlicher Setup-Anleitung
- **tailwind.config.js**: Tailwind CSS Konfiguration (Farben, Plugins)
- **tsconfig.json**: TypeScript Compiler-Optionen

### .github/workflows/ (1 Datei)

- **ci.yml**: GitHub Actions für automatische Tests bei jedem Push

### app/ - Next.js App Directory (3 Dateien)

- **layout.tsx**: Root Layout mit Meta-Tags, PWA-Support, Font-Config
- **page.tsx**: Hauptseite mit Routing-Logik (Login/Admin/User Views)
- **globals.css**: Globale Styles und Tailwind CSS Imports

### components/ - React Components (4 Dateien)

- **AdminView.tsx**: Admin-Dashboard (Mitglieder verwalten, Events erstellen)
- **LoginView.tsx**: Login-Formular mit Passwort-Änderungs-Flow
- **MigrationsPanel.tsx**: Admin-Panel zum Kopieren von SQL-Migrations
- **UserView.tsx**: User-Anmeldeliste mit Matrix-View und Gäste-Funktion

### lib/ - Business Logic & Services (4 Dateien)

- **db.ts**: Database Service Layer (CRUD Operations für Members, Events, Registrations)
- **migrations.ts**: Auto-Migration Runner (läuft beim App-Start)
- **season-config.ts**: Saison-Konfiguration (Sommer/Winter Utensilien)
- **supabase.ts**: Supabase Client Setup + TypeScript Interfaces

### lib/__tests__/ - Unit Tests (3 Dateien)

- **db.test.ts**: Tests für Database Layer
- **registrations.test.ts**: Tests für Registration-Logik
- **season-config.test.ts**: Tests für Saison-Konfiguration

### migrations/ - SQL Migrations (3 Dateien)

- **001_initial_setup.sql**: Initial Schema (Members, Events, Registrations, RLS Policies)
- **002_add_guests.sql**: Fügt Gäste-Spalte zur Registrations-Tabelle hinzu
- **003_add_season_and_utensils.sql**: Fügt Saison & Utensilien-Features hinzu

### public/ - Static Assets (2 Dateien)

- **header.jpg**: Header-Bild für die App (KTV Logo/Bild)
- **manifest.json**: PWA Manifest für App-Installation

## Technologie-Stack

- **Frontend**: Next.js 14, React 18, TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Authentifizierung**: bcryptjs für Passwort-Hashing
- **Icons**: lucide-react (Check, X, Calendar, etc.)
- **Testing**: Jest 29 + Testing Library
- **Deployment**: Vercel (automatisch via GitHub)
- **CI/CD**: GitHub Actions (automatische Tests)

## Gesamtzahl Dateien

**Insgesamt: 36 Dateien**
- Konfiguration: 16 Dateien
- Code (app/ + components/ + lib/): 14 Dateien
- Tests: 3 Dateien
- Migrations: 3 Dateien
- Assets: 2 Dateien (+ 1 PDF)

*(ohne node_modules, .next/, und andere Build-Artefakte)*

## Was fehlt noch?

### Optional: App Icons
Für eine vollständige PWA-Installation wären zusätzlich empfohlen:
- `public/icon-192.png` (192x192px)
- `public/icon-512.png` (512x512px)

Diese können mit Tools wie [favicon.io](https://favicon.io) generiert werden.

---

*Letzte Aktualisierung: 12. Oktober 2025 (basierend auf GitHub Repository-Screenshots)*
