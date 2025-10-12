# KTV Fußball - Vereins-Management App

Eine moderne Web-Applikation für die Verwaltung von Fußballverein-Events und Anmeldungen.

## Features

- ✅ **Admin-Bereich**: Mitglieder und Events verwalten
- ✅ **Sommer/Winter-Modus**: Wechsel zwischen Saison-Utensilien
- ✅ **Utensilien-Management**: Spieler melden, welche Utensilien sie mitbringen
- ✅ **User-Bereich**: Anmeldungen zu Events mit Ja/Nein/Kommentar
- ✅ **Gäste registrieren**: Auch bei Absagen möglich
- ✅ **Aktivierung/Deaktivierung**: Mitglieder für Sommer/Winter-Saison
- ✅ **Event-Sperre**: 1 Stunde vor Event-Start keine Änderungen mehr möglich
- ✅ **PWA**: Installierbar als App auf Android/iOS
- ✅ **Auto-Migrations**: Datenbank-Updates automatisch beim Deployment
- ✅ **Unit Tests**: Automatische Tests mit GitHub Actions

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Testing**: Jest

---

## 🚀 Setup-Anleitung (Schritt für Schritt)

### 1. Supabase-Account erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke auf "Start your project"
3. Melde dich an (GitHub-Login empfohlen)
4. Klicke auf "New Project"
5. Wähle einen Namen (z.B. "ktv-football")
6. Wähle ein Passwort
7. Wähle eine Region (Frankfurt für Deutschland)
8. Klicke "Create new project"
9. **Warte 2-3 Minuten** bis das Projekt bereit ist

### 2. Supabase Datenbank initialisieren

**WICHTIG:** Du musst nur die **erste Migration** manuell ausführen. Alle weiteren laufen automatisch!

1. In deinem Supabase-Projekt, klicke links auf **"SQL Editor"**
2. Klicke auf "New query"
3. **Kopiere** den kompletten Inhalt von `migrations/001_initial_setup.sql`
4. **Füge ihn ein** in den SQL Editor
5. Klicke auf **"Run"** (oder drücke Ctrl/Cmd + Enter)
6. Du solltest sehen: "Success. No rows returned"

**Das war's!** Alle zukünftigen Migrations laufen automatisch beim Deployment.

### 3. Supabase Keys kopieren

1. Klicke links auf **"Settings"** (Zahnrad-Icon)
2. Klicke auf **"API"**
3. Kopiere:
   - **Project URL** (z.B. `https://xxxxx.supabase.co`)
   - **anon public** Key (langer String)

### 4. Admin-Passwort setzen

1. Gehe zurück zum SQL Editor
2. Führe diesen Befehl aus (ersetze `DEIN_PASSWORT`):

```sql
UPDATE members 
SET password_hash = crypt('DEIN_PASSWORT', gen_salt('bf'))
WHERE email = 'ransient.t@gmail.com';
```

3. Merke dir dieses Passwort gut!

### 5. Code auf GitHub hochladen

#### Option A: GitHub Web (im Browser - empfohlen für Handy)

1. Gehe zu [github.com](https://github.com)
2. Klicke auf **"New"** (grüner Button oben links)
3. Repository-Name: `ktv-football-app`
4. Wähle **"Private"** (empfohlen)
5. Klicke **"Create repository"**

6. **Dateien hochladen:**
   - Klicke auf "uploading an existing file"
   - Lade **ALLE Dateien** einzeln hoch:
     - `package.json`
     - `tsconfig.json`
     - `tailwind.config.js`
     - `postcss.config.js`
     - `next.config.js`
     - `.env.example`
     - `.gitignore`
     - Ordner `app/` (page.tsx, layout.tsx, globals.css)
     - Ordner `components/` (alle .tsx Dateien)
     - Ordner `lib/` (alle .ts Dateien)
     - Ordner `migrations/` (SQL-Dateien)
     - Ordner `public/` (manifest.json)
     - Ordner `.github/workflows/` (ci.yml)
     - Etc.

7. Bei jedem Upload schreibe eine Commit-Message (z.B. "Add files")
8. Klicke "Commit changes"

#### Option B: Git Command Line (Desktop)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN_USERNAME/ktv-football-app.git
git push -u origin main
```

### 6. Vercel Deployment

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke "Sign Up" und melde dich mit **GitHub** an
3. Klicke "Add New..." → "Project"
4. Wähle dein Repository **"ktv-football-app"**
5. Klicke "Import"

6. **Environment Variables konfigurieren:**
   - Klicke auf "Environment Variables"
   - Füge hinzu:
     - Name: `NEXT_PUBLIC_SUPABASE_URL`
     - Value: (deine Supabase Project URL)
   - Klicke "Add"
   - Füge hinzu:
     - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Value: (dein Supabase anon Key)
   - Klicke "Add"

7. Klicke **"Deploy"**
8. Warte 2-3 Minuten
9. **Fertig!** Du bekommst eine URL wie `ktv-football-app.vercel.app`

### 7. Als App installieren (PWA)

#### Android (Chrome):
1. Öffne die URL in Chrome
2. Tippe auf die drei Punkte (⋮)
3. Tippe auf "Zum Startbildschirm hinzufügen"
4. Fertig! Die App ist jetzt installiert

#### iPhone (Safari):
1. Öffne die URL in Safari
2. Tippe auf das Teilen-Icon (Quadrat mit Pfeil)
3. Scrolle runter und tippe "Zum Home-Bildschirm"
4. Fertig!

---

## 📱 Wie funktioniert die App?

### Für Admins (ransient.t@gmail.com):

1. **Login** mit deiner E-Mail und Passwort
2. Im **Admin-Bereich** kannst du:
   - **Saison wechseln**: Sommer ☀️ oder Winter ❄️
   - Neue Mitglieder hinzufügen (bekommst Auto-Passwort)
   - Mitglieder aktivieren/deaktivieren (für Winter/Sommer)
   - Events erstellen (Datum, Zeit, Ort)
   - Zusagen pro Event sehen

3. Klicke auf "Zur Anmeldeliste" um zur User-Ansicht zu wechseln

**Utensilien:**
- **Sommer**: Schlüssel, Ball, Überzieher, Handschuhe, Pumpe
- **Winter**: Hallenball, Überzieher, Pumpe

### Für User (Mitglieder):

1. **Login** mit E-Mail und Initial-Passwort (vom Admin erhalten)
2. Beim ersten Login: **Passwort ändern** (wird erzwungen)
3. In der **Anmeldeliste**:
   - **Utensilien-Übersicht** oben: Siehst wer welche Utensilien mitbringt
   - Klicke auf eine Zelle in deiner Zeile
   - **Dialog öffnet sich** mit:
     - Zusage/Absage-Buttons
     - **Utensilien-Checkboxen** (z.B. Ball, Pumpe)
     - Gäste-Zähler (+/-)
     - Kommentar-Feld
   - Andere Kommentare sehen via Sprechblase-Icon 💬

4. **Regeln:**
   - 1 Stunde vor Event-Start: Keine Änderungen mehr möglich (🔒)
   - Inaktive User können nur lesen, nicht ändern
   - Gäste zählen zum Gesamt-Total dazu
   - Utensilien helfen bei der Organisation

---

## 🔄 Updates und Änderungen

### Bei Code-Änderungen:

1. Ersetze die geänderten Dateien auf GitHub
2. Vercel erkennt das automatisch
3. Deployment startet automatisch
4. Neue Version ist in 2-3 Minuten live

### Bei Datenbank-Änderungen:

**Super einfach - läuft automatisch!** 🎉

1. Neue Migration wird in `lib/migrations.ts` hinzugefügt
2. Du lädst die neue Version auf GitHub hoch
3. Die App führt beim Start automatisch alle neuen Migrations aus
4. Fertig!

**Beispiel:** Wenn ich dir später ein Update gebe mit neuen Features:
- Du ersetzt die Dateien auf GitHub
- Vercel deployed automatisch
- App startet und führt neue DB-Updates automatisch aus
- Alles funktioniert!

**Keine manuelle SQL-Arbeit mehr nötig!** ✅

---

## 🧪 Tests lokal ausführen

```bash
npm install
npm run test
```

Tests laufen auch automatisch bei jedem Git-Push via GitHub Actions!

---

## 🆘 Probleme?

### "Missing Supabase environment variables"
→ Prüfe ob die Environment Variables in Vercel korrekt gesetzt sind

### "E-Mail oder Passwort falsch"
→ Setze das Admin-Passwort neu mit dem SQL-Befehl von oben

### App lädt nicht
→ Prüfe Browser-Konsole (F12) für Fehler

### Deployment failed
→ Prüfe GitHub Actions Tab für Details

---

## 📊 Kosten-Übersicht

- **GitHub**: Kostenlos ✅
- **Vercel**: Kostenlos (Hobby Plan) ✅
- **Supabase**: Kostenlos (bis 500MB) ✅
- **Total**: 0 EUR/Monat ✅

Erst bei 500+ aktiven Usern würden Kosten entstehen!

---

## 🎯 Technische Details

### Datenbank-Schema

**members**
- Speichert alle Vereinsmitglieder
- `is_active`: Aktiv/Inaktiv für Saison
- `is_admin`: Admin-Rechte
- `must_change_password`: Erzwingt Passwort-Änderung

**events**
- Speichert alle Fußball-Events
- Datum + Von/Bis-Zeit + Ort

**registrations**
- Mapping: Welcher User bei welchem Event
- Status: yes/no/pending
- Kommentar optional

**schema_migrations**
- Tracking welche DB-Updates bereits gelaufen sind

### Sicherheit

- Passwörter: bcrypt-Hash (10 Rounds)
- Row Level Security (RLS) aktiviert
- Environment Variables für Secrets
- HTTPS erzwungen

---

Viel Erfolg mit deiner KTV Fußball App! ⚽🎉
