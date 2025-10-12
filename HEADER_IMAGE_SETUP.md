# Header-Bild Setup

## So fügst du das Header-Bild ein:

### 1. Bild vorbereiten
- Speichere dein "Altherren Fussball KTV Aarau" Bild
- Empfohlene Größe: 1200 x 200 Pixel
- Format: JPG oder PNG

### 2. Bild hochladen

#### Option A: GitHub Web
1. Gehe zu deinem Repository auf github.com
2. Öffne den `public/` Ordner
3. Klicke "Add file" → "Upload files"
4. Lade dein Bild hoch und nenne es: **`header.jpg`**
5. Commit

#### Option B: Git Command Line
```bash
# Kopiere dein Bild in den public/ Ordner
cp /pfad/zu/deinem/bild.jpg public/header.jpg

# Commit
git add public/header.jpg
git commit -m "Add header image"
git push
```

### 3. Fertig!
Die App lädt automatisch `/header.jpg` - kein Code-Änderung nötig!

## Alternative Namen
Falls du das Bild anders nennen willst (z.B. `logo.png`):

Ändere in allen Komponenten:
```jsx
style={{backgroundImage: 'url(/header.jpg)'}}
```
zu:
```jsx
style={{backgroundImage: 'url(/logo.png)'}}
```

## Fallback
Wenn das Bild nicht lädt, wird ein roter Hintergrund angezeigt (rot-700).
