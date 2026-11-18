-- Run with psql -v ON_ERROR_STOP=1 -f supabase/tests/admin_authorization.sql
-- against a disposable database with schema.sql installed, as postgres.
-- All fixtures and changes are rolled back. No pgTAP extension is required.
begin;
set local request.jwt.claims = '{}';

create function pg_temp.assert_true(ok boolean, message text) returns void
language plpgsql as $$
begin
  if ok is distinct from true then raise exception '%', message; end if;
end;
$$;

insert into auth.users(id, email) values
 ('11111111-1111-4111-8111-111111111111', 'security-student@example.invalid'),
 ('22222222-2222-4222-8222-222222222222', 'security-admin@example.invalid');
-- SQL Editor administration must still work without JWT claims.
update public.profiles set role = 'admin' where id = '22222222-2222-4222-8222-222222222222';
select pg_temp.assert_true((select role = 'admin' from public.profiles where id = '22222222-2222-4222-8222-222222222222'), 'SQL administration failed');
insert into public.courses(id, slug, title) values ('security-test', 'security-test', 'Security test');
insert into public.modules(id, course_id, title, order_index) values ('security-test', 'security-test', 'Security test', 1);
insert into public.lessons(id, module_id, title, video_url, order_index) values ('security-test', 'security-test', 'Security test', 'https://example.invalid', 1);
insert into public.user_progress(user_id, lesson_id) values ('22222222-2222-4222-8222-222222222222', 'security-test');
insert into public.enrollments(user_id, course_id) values ('22222222-2222-4222-8222-222222222222', 'security-test');
insert into public.deletion_requests(user_id, email) values ('22222222-2222-4222-8222-222222222222', 'security-admin@example.invalid');
insert into public.support_messages(email, subject, message) values ('security-admin@example.invalid', 'Security test', 'Private');
insert into public.newsletter_subscribers(email) values ('security-admin@example.invalid');
insert into public.feedback(user_id, track_slug, track_title, rating) values ('22222222-2222-4222-8222-222222222222', 'security-test', 'Security test', 5);

-- Exercise every table whose policies call is_admin as anon and as a student.
create function pg_temp.check_unprivileged() returns void language plpgsql as $$
declare
  table_name text;
  visible integer;
  affected integer;
begin
  perform pg_temp.assert_true(not public.is_admin(), 'Unprivileged request is admin');
  foreach table_name in array array['profiles', 'user_progress', 'enrollments', 'deletion_requests', 'support_messages', 'newsletter_subscribers', 'feedback'] loop
    execute format('select count(*) from public.%I', table_name) into visible;
    perform pg_temp.assert_true(visible = case when table_name = 'profiles' and auth.uid() is not null then 1 else 0 end, table_name || ': private rows exposed');
  end loop;
  foreach table_name in array array['courses', 'modules', 'lessons'] loop
    execute format('select count(*) from public.%I where id = %L', table_name, 'security-test') into visible;
    perform pg_temp.assert_true(visible = 1, table_name || ': public read broken');
    execute format('update public.%I set title = %L where id = %L', table_name, 'Unauthorized', 'security-test');
    get diagnostics affected = row_count;
    perform pg_temp.assert_true(affected = 0, table_name || ': unauthorized update');
    execute format('delete from public.%I where id = %L', table_name, 'security-test');
    get diagnostics affected = row_count;
    perform pg_temp.assert_true(affected = 0, table_name || ': unauthorized delete');
  end loop;
  begin
    insert into public.courses(id, slug, title) values ('unauthorized', 'unauthorized', 'Unauthorized');
    raise exception 'Unauthorized course insert succeeded';
  exception when insufficient_privilege then null;
  end;
  delete from public.newsletter_subscribers where email = 'security-admin@example.invalid';
  get diagnostics affected = row_count;
  perform pg_temp.assert_true(affected = 0, 'Unauthorized newsletter delete');
  update public.user_progress set is_completed = true where lesson_id = 'security-test';
  get diagnostics affected = row_count;
  perform pg_temp.assert_true(affected = 0, 'Unauthorized progress update');
  delete from public.user_progress where lesson_id = 'security-test';
  get diagnostics affected = row_count;
  perform pg_temp.assert_true(affected = 0, 'Unauthorized progress delete');
end;
$$;

set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select pg_temp.check_unprivileged();
reset role;
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"11111111-1111-4111-8111-111111111111","user_metadata":{"role":"admin"}}';
select pg_temp.check_unprivileged();
update public.profiles set role = 'admin', name = 'Allowed edit' where id = auth.uid();
select pg_temp.assert_true((select role = 'student' and name = 'Allowed edit' from public.profiles where id = auth.uid()), 'Student promoted self or own edit failed');
-- Recreate the student's own profile to verify INSERT role protection.
reset role;
delete from public.profiles where id = '11111111-1111-4111-8111-111111111111';
set local role authenticated;
insert into public.profiles(id, email, role) values (auth.uid(), 'security-student@example.invalid', 'admin');
select pg_temp.assert_true((select role = 'student' from public.profiles where id = auth.uid()), 'Student inserted admin role');

-- Real admins retain management access, with a definer lookup that avoids RLS recursion.
set local request.jwt.claims = '{"role":"authenticated","sub":"22222222-2222-4222-8222-222222222222"}';
select pg_temp.assert_true(public.is_admin(), 'Admin rejected');
select pg_temp.assert_true((select count(*) = 2 from public.profiles), 'Admin cannot see profiles');
update public.profiles set role = 'instructor' where id = '11111111-1111-4111-8111-111111111111';
select pg_temp.assert_true((select role = 'instructor' from public.profiles where id = '11111111-1111-4111-8111-111111111111'), 'Admin role management failed');
update public.courses set title = 'Admin edit' where id = 'security-test';
select pg_temp.assert_true((select title = 'Admin edit' from public.courses where id = 'security-test'), 'Admin course management failed');
reset role;
set local role service_role;
set local request.jwt.claims = '{"role":"service_role"}';
select pg_temp.assert_true(public.is_admin(), 'Service role rejected');
update public.profiles set role = 'student' where id = '11111111-1111-4111-8111-111111111111';
select pg_temp.assert_true((select role = 'student' from public.profiles where id = '11111111-1111-4111-8111-111111111111'), 'Service role management failed');
reset role;
rollback;
