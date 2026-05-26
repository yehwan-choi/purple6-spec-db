create table distributor_category_links (
  distributor_id text not null references distributors(id) on delete cascade,
  category_id    text not null references material_categories(id) on delete cascade,
  primary key (distributor_id, category_id)
);

alter table distributor_category_links enable row level security;

create policy "anon read"   on distributor_category_links for select using (true);
create policy "anon insert" on distributor_category_links for insert with check (true);
create policy "anon delete" on distributor_category_links for delete using (true);
