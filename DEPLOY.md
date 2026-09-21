# Déploiement Vercel + MongoDB Atlas + stockage médias

Vercel est **serverless** : pas de disque persistant local.  
Les fichiers audio / vidéo / images doivent être sur un **stockage cloud** (Vercel Blob, Cloudinary, S3…).  
MongoDB **ne doit pas** être `localhost` en production → **MongoDB Atlas**.

---

## 1. MongoDB Atlas (base distante)

1. Créez un compte : [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create Cluster** (Free M0)
3. **Database Access** → Add User (user + mot de passe)
4. **Network Access** → `0.0.0.0/0` (accès depuis Vercel)
5. **Connect** → Drivers → copiez l’URI :

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/luna?retryWrites=true&w=majority
```

6. Seed en local (une fois) avec cette URI dans `.env.local` :

```bash
cp .env.example .env.local
# collez MONGODB_URI Atlas
npm install
npm run seed
```

---

## 2. Vercel Blob (audio, vidéo, images)

Sur Vercel le système de fichiers est **éphémère**. Ne stockez jamais les médias dans `/public` uploadés à la volée.

### Option A — Vercel Blob (recommandé, intégré)

1. Vercel Dashboard → projet → **Storage** → **Create** → **Blob**
2. Connectez le store au projet → `BLOB_READ_WRITE_TOKEN` est injecté automatiquement
3. Admin peut uploader via `POST /api/upload` (composant `MediaUpload`)
4. L’URL publique renvoyée est enregistrée dans MongoDB (`image`, `mediaUrl`, `previewUrl`, `streamUrl`)

**Limite Hobby** : body API ~**4,5 Mo**. Pour des MP3/MP4 plus lourds :
- compressez / utilisez un extrait en preview
- ou **Option B / C** ci-dessous

### Option B — Cloudinary

1. Compte Cloudinary → upload UI ou API
2. Collez l’URL `https://res.cloudinary.com/...` dans les champs produit (admin)
3. Déjà autorisé dans `next.config.ts`

### Option C — AWS S3 / Cloudflare R2

Uploadez hors de l’app, stockez l’URL HTTPS dans MongoDB.

---

## 3. Variables d’environnement Vercel

**Project → Settings → Environment Variables**

| Variable | Exemple | Notes |
|----------|---------|--------|
| `MONGODB_URI` | `mongodb+srv://...` | **Obligatoire** Atlas |
| `JWT_SECRET` | chaîne longue aléatoire | `openssl rand -base64 32` |
| `BASE_URL` | `https://votre-app.vercel.app` | Serveur only — OAuth callbacks |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Client ID PayPal | Pas `sb` en vrai live |
| `BLOB_READ_WRITE_TOKEN` | auto si Storage Blob | Uploads admin |

Cochez Production + Preview (+ Development si besoin).

---

## 4. Déployer

```bash
# CLI
npm i -g vercel
vercel login
vercel          # preview
vercel --prod   # production
```

Ou : GitHub → Import projet sur [vercel.com/new](https://vercel.com/new) → Framework **Next.js** → ajouter les env vars → Deploy.

`vercel.json` définit la région `cdg1` (Paris) et `maxDuration: 30` pour les API.

---

## 5. Checklist post-déploiement

- [ ] `MONGODB_URI` pointe vers Atlas (pas 127.0.0.1)
- [ ] Network Access Atlas = `0.0.0.0/0`
- [ ] Seed exécuté une fois (local avec URI Atlas ou script one-shot)
- [ ] `BASE_URL` = URL Vercel réelle
- [ ] Blob store créé **ou** médias en URL externes
- [ ] Test login admin + création produit
- [ ] Test page `/live` avec URL stream HTTPS

---

## Architecture médias

```
[Navigateur / Admin]
        │ upload (admin)
        ▼
[API /api/upload] ──► [Vercel Blob / Cloudinary / S3]
        │
        ▼ URL HTTPS
[MongoDB Atlas]  ← product.image, mediaUrl, previewUrl, streamUrl
        │
        ▼
[Next.js sur Vercel] ──► lecture via URL (pas de fichier local)
```

Les **previews** et le **live** utilisent des URLs HTTPS publiques (pas de chemin disque).

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `Missing MONGODB_URI` | Ajouter la var sur Vercel + redeploy |
| Timeout MongoDB | Atlas Network Access 0.0.0.0/0 |
| Upload 413 | Fichier > 4,5 Mo → compresser ou Cloudinary/S3 |
| Images cassées | Hostname dans `next.config.ts` remotePatterns |
| Seed échoue | Même `MONGODB_URI` Atlas dans `.env.local` |


---

## Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → projet → **APIs & Services** → **Credentials**
2. **Create credentials** → **OAuth client ID** → type **Web application**
3. **Authorized JavaScript origins** :
   - `http://localhost:3000`
   - `https://votre-app.vercel.app`
4. **Authorized redirect URIs** :
   - `http://localhost:3000/api/auth/google/callback`
   - `https://votre-app.vercel.app/api/auth/google/callback`
5. Variables :

```
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-....
```

6. Sur Vercel : ajouter les 2 variables + `BASE_URL` exact de production.

Connexion / inscription : bouton **Continuer avec Google** sur `/login` et `/register`.
