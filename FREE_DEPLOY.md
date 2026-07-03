# Pubblicazione gratis di Eikon

Obiettivo: avere il sito online sempre, gratis, con un link tipo:

```text
https://eikon-album.vercel.app
```

Il dominio `eikon.com` non e incluso gratis. Per ora usiamo il dominio gratuito di Vercel.

## 1. Account gratuiti

Servono tre account gratuiti:

- GitHub: per caricare il codice
- Supabase: per salvare album e foto
- Vercel: per tenere il sito online sempre

## 2. Supabase

1. Crea un progetto su Supabase.
2. Apri `SQL Editor`.
3. Incolla tutto il contenuto di `supabase/schema.sql`.
4. Esegui lo script.
5. Vai in `Project Settings / API`.
6. Copia questi valori:
   - `Project URL`
   - `anon public`
   - `service_role secret`

## 3. GitHub

1. Crea un nuovo repository.
2. Carica tutti i file di questo progetto.

## 4. Vercel

1. Vai su Vercel.
2. Fai `Add New Project`.
3. Importa il repository GitHub.
4. Framework: Next.js.
5. Aggiungi queste variabili ambiente:

```text
NEXT_PUBLIC_SUPABASE_URL=Project URL di Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon public di Supabase
SUPABASE_SERVICE_ROLE_KEY=service_role secret di Supabase
SITE_ACCESS_CODE=0831
ADMIN_PASSWORD_LUCA=14052005
ADMIN_PASSWORD_RACHELE=1
ADMIN_PASSWORD_EMANUELE=2
ACCESS_SESSION_SECRET=scrivi-una-frase-lunga-casuale
```

6. Premi `Deploy`.

## 5. Come si usa

- Apri il link Vercel.
- Codice `0831`: entra nel sito.
- Scegli il profilo: Luca, Rachele o Emanuele.
- Ogni profilo vede solo i propri album.
- Per modificare, clicca `Modifica` oppure entra in:

```text
/admin
```

La password di modifica dipende dal profilo:

- Luca: `ADMIN_PASSWORD_LUCA`, di default `14052005`
- Rachele: `ADMIN_PASSWORD_RACHELE`, di default `1`
- Emanuele: `ADMIN_PASSWORD_EMANUELE`, di default `2`

Esempio:

```text
https://eikon-album.vercel.app/admin
```

## Importante

Il sito locale `127.0.0.1` funziona solo sul tuo Mac. Il link Vercel funziona anche da telefono e per altre persone.
