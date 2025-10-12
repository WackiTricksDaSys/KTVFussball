# KTV Fußball - Deployment Checkliste

Folge dieser Checkliste Schritt für Schritt. Hake ab, was du erledigt hast!

## ☐ 1. Supabase Setup (ca. 5 Minuten)

- [ ] Supabase-Account erstellt auf supabase.com
- [ ] Neues Projekt "ktv-football" erstellt
- [ ] Projekt ist bereit (2-3 Min. gewartet)
- [ ] SQL Editor geöffnet
- [ ] `migrations/001_initial_setup.sql` ausgeführt
- [ ] Success-Meldung gesehen
- [ ] Project URL kopiert
- [ ] anon public Key kopiert

**Deine Supabase-Daten (notiere sie hier):**
```
Project URL: _______________________________
Anon Key:    _______________________________
```

## ☐ 2. Admin-Passwort setzen (ca. 1 Minute)

- [ ] SQL Editor geöffnet
- [ ] Folgenden Befehl ausgeführt:

```sql
UPDATE members 
SET password_hash = crypt('DEIN_PASSWORT_HIER', gen_salt('bf'))
WHERE email = 'ransient.t@gmail.com';
```

**Dein Admin-Passwort (sicher aufbewahren!):**
```
Passwort: _______________________________
```

## ☐ 3. GitHub Repository (ca. 10 Minuten)

- [ ] github.com geöffnet
- [ ] Neues Repository erstellt: `ktv-football-app`
- [ ] Private oder Public gewählt
- [ ] Repository erstellt

**Dateien hochgeladen:**
- [ ] package.json
- [ ] tsconfig.json
- [ ] tailwind.config.js
- [ ] postcss.config.js
- [ ] next.config.js
- [ ] .env.example
- [ ] .gitignore
- [ ] jest.config.js
- [ ] jest.setup.js

**Ordner hochgeladen:**
- [ ] app/ (page.tsx, layout.tsx, globals.css)
- [ ] components/ (LoginView.tsx, AdminView.tsx, UserView.tsx)
- [ ] lib/ (supabase.ts, db.ts, migrations.ts)
- [ ] lib/__tests__/ (db.test.ts)
- [ ] migrations/ (001_initial_setup.sql)
- [ ] public/ (manifest.json)
- [ ] .github/workflows/ (ci.yml)

**Repository URL:**
```
https://github.com/DEIN_USERNAME/_______________________________
```

## ☐ 4. Vercel Deployment (ca. 5 Minuten)

- [ ] vercel.com geöffnet
- [ ] Mit GitHub angemeldet
- [ ] "Add New Project" geklickt
- [ ] Repository `ktv-football-app` ausgewählt
- [ ] "Import" geklickt

**Environment Variables hinzugefügt:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = (deine Supabase URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (dein Supabase Key)

- [ ] "Deploy" geklickt
- [ ] Deployment erfolgreich (grüner Haken)

**Deine App-URL:**
```
https://_______________________________.vercel.app
```

## ☐ 5. Ersten Login testen (ca. 2 Minuten)

- [ ] App-URL im Browser geöffnet
- [ ] Login mit ransient.t@gmail.com
- [ ] Login mit deinem Admin-Passwort
- [ ] Passwort-Änderung durchgeführt
- [ ] Admin-Bereich sichtbar

## ☐ 6. PWA Installation testen (ca. 2 Minuten)

**Android (Chrome):**
- [ ] URL im Chrome-Browser geöffnet
- [ ] Drei Punkte → "Zum Startbildschirm hinzufügen"
- [ ] App auf Homescreen sichtbar

**iPhone (Safari):**
- [ ] URL in Safari geöffnet
- [ ] Teilen-Icon → "Zum Home-Bildschirm"
- [ ] App auf Homescreen sichtbar

## ☐ 7. Erste Mitglieder hinzufügen (optional)

- [ ] Admin-Bereich → Mitglieder-Verwaltung
- [ ] Test-Mitglied hinzugefügt
- [ ] Initial-Passwort notiert
- [ ] Test-Login mit neuem Mitglied durchgeführt

## ☐ 8. Erstes Event erstellen (optional)

- [ ] Admin-Bereich → Event-Verwaltung
- [ ] Test-Event erstellt (Datum, Zeit, Ort)
- [ ] Event erscheint in Anmeldeliste
- [ ] Test-Anmeldung durchgeführt

---

## ✅ Fertig!

Wenn alle Punkte abgehakt sind, ist deine App live! 🎉

**Teile die URL mit deinen Vereinsmitgliedern:**
```
https://_______________________________.vercel.app
```

---

## 🆘 Probleme?

### Deployment failed
1. Gehe zu github.com → dein Repository
2. Klicke auf "Actions" Tab
3. Sieh dir die Fehler an
4. Meist: Environment Variables fehlen

### Datenbank-Fehler
1. Öffne Supabase → SQL Editor
2. Prüfe ob Tabellen existieren:
```sql
SELECT * FROM members;
SELECT * FROM events;
SELECT * FROM registrations;
```

### Login funktioniert nicht
1. SQL Editor in Supabase öffnen
2. Passwort neu setzen:
```sql
UPDATE members 
SET password_hash = crypt('NeuesPasswort123', gen_salt('bf'))
WHERE email = 'ransient.t@gmail.com';
```

---

## 📞 Support

Bei weiteren Fragen:
- README.md lesen (ausführliche Doku)
- GitHub Issues erstellen
- Supabase Docs: docs.supabase.com
- Vercel Docs: vercel.com/docs
