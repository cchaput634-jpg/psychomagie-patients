# Cabinet de Psychomagie — Suivi des Patients

Application de suivi des patients pour RP, avec **base de données** (Cloudflare D1)
et tri automatique par priorité / ancienneté.

**Stack :** Vite · React · TypeScript · Tailwind v4 · shadcn (Radix) · Motion ·
Cloudflare Worker + D1 (SQLite), via `@cloudflare/vite-plugin`.

## Lancer l'application

**Une seule commande, un seul serveur :**

```bash
npm run dev
```

Puis ouvrir **http://localhost:5173**

Le serveur Vite fait tourner le frontend **et** l'API + la base D1 dans le même
processus (grâce à `@cloudflare/vite-plugin`). Hot-reload inclus. Pas de second
serveur à lancer, pas de port à retenir.

## Architecture

```
src/                    Frontend React
  components/ui/         Primitives shadcn (button, dialog, switch, …)
  components/            Sidebar, PatientsView, PatientCard, PatientForm
  lib/api.ts            Client HTTP vers /api
  lib/store.ts          État + mutations optimistes
  lib/sort.ts           Algorithme de tri (prioritaire / file / RDV)
  worker/index.ts       Backend : routeur API (/api/*) + base D1, sert le frontend
schema.sql              Schéma D1 (tables profiles, patients)
wrangler.toml           Worker + binding D1 (DB) + assets
```

La donnée est persistée en base D1 — synchronisée, plus de localStorage.

## Base de données

La base locale est déjà initialisée. Pour réappliquer le schéma :
```bash
npm run db:schema:local     # base locale (dev)
npm run db:schema:remote    # base de production (avant 1er déploiement)
```

Inspecter la base locale :
```bash
npx wrangler d1 execute psychomagie-patients-db --local --command "SELECT * FROM profiles"
```

## Déploiement (Cloudflare)

```bash
# 1. (une seule fois) créer les tables côté production :
npm run db:schema:remote

# 2. construire + déployer :
npm run deploy
```

- D1 database : `psychomagie-patients-db`
  (id `58869054-333c-4f5f-a6f6-ede588bae2ca`)
