## Production (Vercel)

Voir **[DEPLOY.md](./DEPLOY.md)** — MongoDB Atlas, Vercel Blob, variables d'environnement.

# ShopNext – E-commerce Musique, Médias & Événements

Next.js 15 · TypeScript · Tailwind · MongoDB · PayPal · Abonnements

## Fonctionnalités v1.3

### Streaming audio en direct
- Page `/live` avec lecteur (play/pause, volume)
- Badge **EN DIRECT** + point rouge animé
- Admin : onglet **Live** pour créer/éditer flux, activer/désactiver
- Compatible Icecast, Shoutcast, URL MP3 stream
- Seed : 1 flux live démo + 2 hors antenne

## Fonctionnalités v1.2

### Admin (CRUD complet)
- **Utilisateurs** : créer, modifier, supprimer, gérer rôles et abonnements
- **Produits** : physiques, vidéos, photos
- **Musiques** : onglet dédié (prix, preview, format, URL fichier)
- **Événements** : concerts, festivals, workshops…

### Abonnement musique
- Sans abo → préécoute 30–45 s **ou** achat à l’unité
- Avec abo mensuel/annuel → **téléchargements illimités** de tout le catalogue musical
- Page `/subscription` + paiement PayPal
- Admin peut activer/désactiver un abo manuellement

### Autre
- PayPal sandbox au checkout
- Téléchargement post-achat (vidéos, photos, musique achetée)
- Calendrier d’événements

## Installation

```bash
unzip ecommerce-nextjs.zip && cd ecommerce-nextjs
npm install
cp .env.example .env.local
# MONGODB_URI = local ou Atlas
npm run seed
npm run dev
```

## Comptes démo

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@shop.com | admin123 | Admin (tout gérer) |
| user@shop.com | user123 | User sans abonnement |
| sub@shop.com | sub123 | User **avec abo mensuel actif** |

## Données en base

```bash
npm run seed
```

Doit afficher :
```
✅ 10 products
✅ 6 events
✅ 2 subscription plans
✅ 3 users
```

Si rien n’apparaît → MongoDB n’est pas démarré ou mauvaise URI dans `.env.local`.

## Structure admin

`/admin` → onglets :
1. Produits
2. Musiques
3. Événements
4. Utilisateurs

Chaque onglet : ajouter / éditer / supprimer.
