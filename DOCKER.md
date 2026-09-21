# Docker — LUNA

## Production-like (standalone Next + Mongo)

```bash
cp .env.example .env
# renseigner JWT_SECRET, GOOGLE_*, etc.

docker compose up --build
```

- App : http://localhost:3000  
- Mongo : `mongodb://localhost:27017/luna` (port exposé)

### Seed

```bash
# Depuis la machine hôte (Mongo exposé sur 27017)
MONGODB_URI=mongodb://127.0.0.1:27017/luna npm run seed

# Ou profil seed
docker compose --profile seed run --rm seed
```

## Développement (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

## Variables utiles

| Variable | Docker Compose |
|----------|----------------|
| `MONGODB_URI` | `mongodb://mongo:27017/luna` (réseau interne) |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `SECRET` | depuis `.env` |

## Notes

- Les **médias** (audio/vidéo) restent en URL externes ou Vercel Blob — pas de volume fichiers app obligatoire.
- Pour la prod cloud, préférez **Vercel + Atlas** (voir DEPLOY.md) ; Docker convient au VPS / self-host.
- Image multi-stage avec `output: "standalone"` Next.js.
