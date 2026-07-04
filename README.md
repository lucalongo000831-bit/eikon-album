# EIKON

Sito Next.js in stile desktop minimale: la home e una pagina bianca con cartelle sparse, non una gallery fotografica tradizionale. Ogni cartella apre un album con foto e lightbox.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Auth, Database e Storage
- Deploy su Vercel

## Disponibilita

In locale il sito funziona solo mentre `npm run dev` e attivo. Per averlo sempre online devi pubblicarlo su Vercel. Dopo il deploy, Vercel tiene il sito disponibile 24/7 senza terminale aperto: le persone invitate useranno il link pubblico Vercel o il dominio collegato, non `127.0.0.1`.

Il nome visibile del sito e `EIKON`. Per usare davvero il dominio `eikon.com`, devi possedere o acquistare quel dominio e collegarlo in Vercel da `Settings / Domains`.

## Codici di accesso

Il sito ha due livelli di accesso:

1. Password generale del sito.
2. Password di modifica legata al profilo scelto.

La password generale e:

- `0831`: entra nel sito e porta alla scelta profilo.

Dopo il codice generale si arriva a `/profiles`, dove si sceglie:

- `LUCA`
- `RACHELE`
- `EMANUELE`

Ogni profilo vede solo gli album con il proprio `profile_key`.

Le password di modifica sono separate per profilo:

- `LUCA`: usa la password admin gia esistente, di default `14052005`
- `RACHELE`: `1`
- `EMANUELE`: `2`

Se sei nel profilo Rachele, la password di Luca o Emanuele non abilita le modifiche di Rachele. Lo stesso vale per gli altri profili.

In produzione imposta questi valori come variabili ambiente Vercel:

```bash
SITE_ACCESS_CODE=0831
ADMIN_PASSWORD_LUCA=14052005
ADMIN_PASSWORD_RACHELE=1
ADMIN_PASSWORD_EMANUELE=2
ACCESS_SESSION_SECRET=una-stringa-lunga-random
PHOTO_WATERMARK_TEXT=EIKON private archive
```

`ADMIN_ACCESS_CODE` e ancora letto come fallback per Luca, ma la variabile consigliata ora e `ADMIN_PASSWORD_LUCA`.

Il codice `14052005` puo anche essere inserito nella prima schermata: apre direttamente l'admin del profilo Luca.

Il cookie di accesso e firmato lato server e viene cancellato quando aggiorni, chiudi o riapri la pagina: il codice viene richiesto di nuovo a ogni nuova apertura o refresh.

## Avvio locale

1. Installa le dipendenze:

```bash
npm install
```

2. Copia le variabili ambiente:

```bash
cp .env.example .env.local
```

3. Avvia il sito:

```bash
npm run dev
```

Se vuoi provarlo dal telefono sulla stessa Wi-Fi, usa invece:

```bash
npm run dev:phone
```

Senza Supabase configurato il sito usa dati demo locali, cosi puoi vedere subito home, cartelle, album e lightbox. L'admin puo mostrare una demo locale, ma per salvare davvero modifiche e upload serve Supabase.

## Supabase

1. Crea un nuovo progetto su Supabase.
2. Vai in `SQL Editor`.
3. Incolla ed esegui tutto il contenuto di `supabase/schema.sql`.
4. Il file crea:
   - tabella `albums`
   - tabella `photos`
   - campo `albums.profile_key text not null default 'luca'`
   - bucket privato `memories`
   - policy RLS per album pubblici e admin autenticato
   - album demo con posizioni desktop
5. In `Authentication` crea il tuo utente admin. Per un sito personale, tieni disattivate le registrazioni pubbliche oppure invita solo il tuo account.
6. In `Project Settings / API` copia:
   - `Project URL` in `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` in `SUPABASE_SERVICE_ROLE_KEY`
7. Riavvia `npm run dev`.

Le foto caricate dall'admin finiscono nel bucket cosi: `memories/{album-slug}/{filename}`.

## Admin

- `/access`: schermata codice.
- `/profiles`: scelta profilo.
- `/admin/login`: password di modifica del profilo corrente.
- `/admin`: crea, modifica ed elimina solo gli album del profilo corrente.
- Da `/admin` puoi scegliere titolo, slug, anno, luogo, categoria, descrizione, colore cartella, posizione X/Y e stato pubblico/privato.
- Seleziona un album e usa `Carica foto` per aggiungere immagini.
- Le caption si modificano direttamente nella lista foto.
- Le frecce su/giu riordinano le foto.
- Il cestino elimina la foto.
- Le foto caricate dall'admin vengono convertite in JPEG e ricevono un piccolo marker quasi invisibile piu metadata privati. Non e una garanzia legale assoluta, ma aiuta a riconoscere gli originali dell'archivio.

Quando crei un album dal pannello admin, il sito imposta automaticamente:

```text
profile_key = profilo corrente
```

Esempi:

- Admin Luca crea album con `profile_key = "luca"`.
- Admin Rachele crea album con `profile_key = "rachele"`.
- Admin Emanuele crea album con `profile_key = "emanuele"`.

Le API admin controllano lato server che la sessione admin sia valida per il profilo selezionato. In pratica, entrando nell'admin di Rachele non puoi modificare album con `profile_key = "luca"` o `profile_key = "emanuele"`.

## Deploy su Vercel

1. Crea un repository GitHub e carica il progetto.
2. Su Vercel scegli `Add New Project`.
3. Importa il repository.
4. Aggiungi le variabili:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SITE_ACCESS_CODE`
   - `ADMIN_PASSWORD_LUCA`
   - `ADMIN_PASSWORD_RACHELE`
   - `ADMIN_PASSWORD_EMANUELE`
   - `ACCESS_SESSION_SECRET`
5. Deploy.
6. Per il dominio personalizzato: in Vercel vai in `Settings / Domains`, aggiungi il dominio e segui le istruzioni DNS.

Una volta pubblicato su Vercel, il sito resta online senza dover tenere il terminale aperto.

## Personalizzazione

- Cambia il nome in alto a sinistra in `components/top-bar.tsx`.
- Cambia colori e forma delle cartelle in `app/globals.css` e `components/folder-icon.tsx`.
- Modifica i profili statici in `lib/profiles.ts`.
- Cambia le password admin in `.env.local` o nelle variabili ambiente Vercel.
- Modifica le posizioni demo in `lib/data/demo-data.ts` oppure nel database Supabase.
- Per assegnare manualmente un album a Luca, Rachele o Emanuele, cambia `profile_key` nella tabella `albums` usando uno di questi valori: `luca`, `rachele`, `emanuele`.
