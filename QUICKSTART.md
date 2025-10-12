# 🚀 Quick Start - In 15 Minuten live!

## 1️⃣ Supabase (5 Min)
```
1. supabase.com → Sign Up → New Project
2. SQL Editor → Kopiere migrations/001_initial_setup.sql → Run
3. Settings → API → Kopiere URL + anon Key
4. SQL Editor → Führe aus:
   UPDATE members SET password_hash = crypt('DeinPasswort', gen_salt('bf'))
   WHERE email = 'ransient.t@gmail.com';
```

## 2️⃣ GitHub (5 Min)
```
1. github.com → New Repository "ktv-football-app"
2. Upload alle Dateien (oder git push)
```

## 3️⃣ Vercel (5 Min)
```
1. vercel.com → Import GitHub Repo
2. Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL = [deine URL]
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = [dein Key]
3. Deploy
```

## ✅ Fertig!
Öffne deine App-URL und logge dich ein! 🎉

**Ausführliche Anleitung:** Siehe README.md
