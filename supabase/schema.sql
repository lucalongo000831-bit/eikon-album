create extension if not exists pgcrypto;

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  profile_key text not null default 'luca'
    check (profile_key in ('luca', 'rachele', 'emanuele')),
  description text,
  year integer,
  location text,
  category text,
  folder_color text not null default 'black'
    check (folder_color in ('black', 'blue', 'pink', 'red', 'beige', 'gray', 'green')),
  position_x integer check (position_x is null or (position_x >= 0 and position_x <= 100)),
  position_y integer check (position_y is null or (position_y >= 0 and position_y <= 100)),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.albums
add column if not exists profile_key text not null default 'luca';

alter table public.albums
alter column profile_key set default 'luca';

update public.albums
set profile_key = 'luca'
where profile_key is null;

alter table public.albums
alter column profile_key set not null;

alter table public.albums
drop constraint if exists albums_profile_key_check;

alter table public.albums
add constraint albums_profile_key_check
check (profile_key in ('luca', 'rachele', 'emanuele'));

alter table public.albums
drop constraint if exists albums_folder_color_check;

alter table public.albums
add constraint albums_folder_color_check
check (folder_color in ('black', 'blue', 'pink', 'red', 'beige', 'gray', 'green'));

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists albums_slug_idx on public.albums(slug);
create index if not exists albums_profile_idx on public.albums(profile_key);
create index if not exists albums_public_idx on public.albums(is_public);
create index if not exists photos_album_sort_idx on public.photos(album_id, sort_order);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_albums_updated_at on public.albums;
create trigger set_albums_updated_at
before update on public.albums
for each row execute function public.set_updated_at();

alter table public.albums enable row level security;
alter table public.photos enable row level security;

drop policy if exists "Public can read public albums" on public.albums;
create policy "Public can read public albums"
on public.albums
for select
using (is_public = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated users manage albums" on public.albums;
create policy "Authenticated users manage albums"
on public.albums
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read photos from public albums" on public.photos;
create policy "Public can read photos from public albums"
on public.photos
for select
using (
  exists (
    select 1
    from public.albums
    where albums.id = photos.album_id
      and (albums.is_public = true or auth.role() = 'authenticated')
  )
);

drop policy if exists "Authenticated users manage photos" on public.photos;
create policy "Authenticated users manage photos"
on public.photos
for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memories',
  'memories',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read files from public memories" on storage.objects;
create policy "Public can read files from public memories"
on storage.objects
for select
using (
  bucket_id = 'memories'
  and (
    auth.role() = 'authenticated'
    or exists (
      select 1
      from public.albums
      where albums.slug = (storage.foldername(name))[1]
        and albums.is_public = true
    )
  )
);

drop policy if exists "Authenticated users manage memory files" on storage.objects;
create policy "Authenticated users manage memory files"
on storage.objects
for all
to authenticated
using (bucket_id = 'memories')
with check (bucket_id = 'memories');

insert into public.albums (
  id, title, slug, profile_key, description, year, location, category,
  folder_color, position_x, position_y, is_public
)
values
  ('88888888-8888-4888-8888-888888888888', 'Jule26', 'jule26', 'luca', 'Una sera d''estate tra interni caldi, giardino e dettagli salvati.', 2026, null, 'viaggi', 'blue', 58, 30, true),
  ('11111111-1111-4111-8111-111111111111', 'ESTATE 2024', 'estate-2024', 'luca', 'Giornate lunghe, mare, cene tardi e fotografie salvate senza ordine.', 2024, 'Italia', 'anni', 'black', 7, 9, true),
  ('22222222-2222-4222-8222-222222222222', 'SICILIA', 'sicilia', 'luca', 'Strade calde, acqua trasparente e tavoli pieni.', 2024, 'Sicilia', 'viaggi', 'blue', 54, 38, true),
  ('33333333-3333-4333-8333-333333333333', 'ROMA', 'roma', 'luca', 'Weekend camminando, palazzi color miele e foto scattate al volo.', 2023, 'Roma', 'viaggi', 'red', 47, 55, true),
  ('44444444-4444-4444-8444-444444444444', 'AMICI', 'amici', 'rachele', 'Compleanni, stanze disordinate, treni persi e foto mosse.', null, null, 'persone', 'green', 78, 17, true),
  ('55555555-5555-4555-8555-555555555555', 'FAMIGLIA', 'famiglia', 'rachele', 'Tavole lunghe, case conosciute e ricordi che tornano spesso.', null, null, 'persone', 'beige', 22, 70, true),
  ('66666666-6666-4666-8666-666666666666', 'UNIVERSITA', 'universita', 'emanuele', 'Appunti, scale, bar vicini e giorni pieni.', 2025, null, 'anni', 'gray', 70, 72, true),
  ('77777777-7777-4777-8777-777777777777', 'VIAGGI', 'viaggi', 'emanuele', 'Una cartella madre per partire da qualche parte.', null, null, 'viaggi', 'blue', 32, 25, true)
on conflict (slug) do update
set
  title = excluded.title,
  profile_key = excluded.profile_key,
  description = excluded.description,
  year = excluded.year,
  location = excluded.location,
  category = excluded.category,
  folder_color = excluded.folder_color,
  position_x = excluded.position_x,
  position_y = excluded.position_y,
  is_public = excluded.is_public;

insert into public.photos (album_id, image_url, storage_path, caption, sort_order)
select album_id, image_url, storage_path, caption, sort_order
from (
  values
    ('88888888-8888-4888-8888-888888888888'::uuid, '/uploads/jule26/jule26-01.jpg', 'demo/jule26/01.jpg', 'Jule26', 0),
    ('88888888-8888-4888-8888-888888888888'::uuid, '/uploads/jule26/jule26-02.jpg', 'demo/jule26/02.jpg', null, 1),
    ('88888888-8888-4888-8888-888888888888'::uuid, '/uploads/jule26/jule26-03.jpg', 'demo/jule26/03.jpg', null, 2),
    ('88888888-8888-4888-8888-888888888888'::uuid, '/uploads/jule26/jule26-04.jpg', 'demo/jule26/04.jpg', null, 3),
    ('88888888-8888-4888-8888-888888888888'::uuid, '/uploads/jule26/jule26-05.jpg', 'demo/jule26/05.jpg', null, 4),
    ('88888888-8888-4888-8888-888888888888'::uuid, '/uploads/jule26/jule26-06.jpg', 'demo/jule26/06.jpg', null, 5),
    ('11111111-1111-4111-8111-111111111111'::uuid, 'https://picsum.photos/seed/estate-2024-sunny-road/1200/1500', 'demo/estate-2024/1.jpg', 'Giornate lunghe, mare, cene tardi e fotografie salvate senza ordine.', 0),
    ('11111111-1111-4111-8111-111111111111'::uuid, 'https://picsum.photos/seed/estate-2024-blue-water/1200/1500', 'demo/estate-2024/2.jpg', null, 1),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'https://picsum.photos/seed/sicilia-blue-water/1200/1500', 'demo/sicilia/1.jpg', 'Strade calde, acqua trasparente e tavoli pieni.', 0),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'https://picsum.photos/seed/sicilia-late-dinner/1200/1500', 'demo/sicilia/2.jpg', null, 1),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'https://picsum.photos/seed/roma-old-city/1200/1500', 'demo/roma/1.jpg', 'Weekend camminando, palazzi color miele e foto scattate al volo.', 0),
    ('44444444-4444-4444-8444-444444444444'::uuid, 'https://picsum.photos/seed/amici-late-dinner/1200/1500', 'demo/amici/1.jpg', 'Compleanni, stanze disordinate, treni persi e foto mosse.', 0),
    ('55555555-5555-4555-8555-555555555555'::uuid, 'https://picsum.photos/seed/famiglia-dinner/1200/1500', 'demo/famiglia/1.jpg', 'Tavole lunghe, case conosciute e ricordi che tornano spesso.', 0),
    ('66666666-6666-4666-8666-666666666666'::uuid, 'https://picsum.photos/seed/universita-window/1200/1500', 'demo/universita/1.jpg', 'Appunti, scale, bar vicini e giorni pieni.', 0),
    ('77777777-7777-4777-8777-777777777777'::uuid, 'https://picsum.photos/seed/viaggi-train-window/1200/1500', 'demo/viaggi/1.jpg', 'Una cartella madre per partire da qualche parte.', 0)
) as seed(album_id, image_url, storage_path, caption, sort_order)
where not exists (
  select 1
  from public.photos
  where photos.album_id = seed.album_id
    and photos.storage_path = seed.storage_path
);
