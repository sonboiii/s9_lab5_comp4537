\set ON_ERROR_STOP on

SELECT 'CREATE ROLE lab5_writer LOGIN PASSWORD ''lab5_writer'''
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'lab5_writer')
\gexec
SELECT 'CREATE ROLE lab5_reader LOGIN PASSWORD ''lab5_reader'''
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'lab5_reader')
\gexec
SELECT 'CREATE DATABASE comp4537_lab5'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'comp4537_lab5')
\gexec

\connect comp4537_lab5

REVOKE ALL ON DATABASE comp4537_lab5 FROM PUBLIC;
GRANT CONNECT ON DATABASE comp4537_lab5 TO lab5_writer, lab5_reader;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO lab5_writer;
GRANT USAGE ON SCHEMA public TO lab5_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lab5_reader;

ALTER DEFAULT PRIVILEGES FOR ROLE lab5_writer IN SCHEMA public
  GRANT SELECT ON TABLES TO lab5_reader;
ALTER ROLE lab5_reader IN DATABASE comp4537_lab5
  SET default_transaction_read_only = on;
