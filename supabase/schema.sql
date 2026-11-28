-- جداول وسياسات «صور المجتمع» (تُنفَّذ مرة واحدة في SQL Editor)
create or replace function public.is_admin() returns boolean
language sql stable as $$ select lower(coalesce(auth.jwt()->>'email','')) = 'osidy2010@gmail.com' $$;

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_name text not null, place text not null, caption text,
  category text not null default 'nature', path text not null,
  hidden boolean not null default false, created_at timestamptz not null default now()
);
create table public.likes (photo_id uuid references public.photos(id) on delete cascade, user_id uuid default auth.uid() references auth.users(id) on delete cascade, primary key (photo_id, user_id));
create table public.reports (photo_id uuid references public.photos(id) on delete cascade, user_id uuid default auth.uid() references auth.users(id) on delete cascade, created_at timestamptz default now(), primary key (photo_id, user_id));
alter table public.photos enable row level security; alter table public.likes enable row level security; alter table public.reports enable row level security;
create policy "photos read" on public.photos for select using (hidden = false or public.is_admin() or user_id = auth.uid());
create policy "photos insert" on public.photos for insert to authenticated with check (user_id = auth.uid());
create policy "photos delete" on public.photos for delete to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "photos admin update" on public.photos for update to authenticated using (public.is_admin());
create policy "likes read" on public.likes for select using (true);
create policy "likes insert" on public.likes for insert to authenticated with check (user_id = auth.uid());
create policy "likes delete" on public.likes for delete to authenticated using (user_id = auth.uid());
create policy "reports insert" on public.reports for insert to authenticated with check (user_id = auth.uid());
create policy "reports admin read" on public.reports for select to authenticated using (public.is_admin());
create or replace function public.auto_hide() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.reports where photo_id = new.photo_id) >= 3 then
    update public.photos set hidden = true where id = new.photo_id;
  end if;
  return new;
end $$;
create trigger reports_auto_hide after insert on public.reports for each row execute function public.auto_hide();
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict do nothing;
create policy "storage read" on storage.objects for select using (bucket_id = 'photos');
create policy "storage upload" on storage.objects for insert to authenticated with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "storage delete" on storage.objects for delete to authenticated using (bucket_id = 'photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
