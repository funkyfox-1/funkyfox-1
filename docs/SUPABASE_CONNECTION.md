# Funky Fox — Supabase Session Pooler Connection Guide

This document describes the permanent, secure database connection setup for the Funky Fox project (`gcvtitcegolmkhjqqpit`) on this machine.

---

## 1. Architecture & Security Model

- **Connection Protocol:** Shared Session Pooler (port `5432`) over IPv4, bypassing local IPv6 network limitations.
- **Client Tools:** Local PostgreSQL 17.2 binaries (`tools/pg17/bin/psql.exe`, `tools/pg17/bin/pg_dump.exe`).
- **Security:**
  - Database password is encrypted on disk using **Windows DPAPI (CurrentUser scope)** at `tools/.supabase_credential.dpapi`.
  - Non-secret configuration (Host, Port, User, DB, SSL) is stored at `tools/supabase-pooler.json`.
  - Passwords are never saved in `.env`, Git commits, terminal logs, or shell history.
  - No dependence on the Windows clipboard or browser processes.

---

## 2. One-Time Setup (or Updating Host/Password)

Run the credential setup script in PowerShell:

```powershell
.\tools\save-supabase-credential.ps1
```

1. Enter your verified **Session Pooler Host** when prompted (e.g. from Supabase Dashboard -> Connect -> Session pooler).
2. Enter your **Database Password** in the masked input prompt.

The script automatically verifies DPAPI encryption and creates:
- `tools/supabase-pooler.json` (Host & User)
- `tools/.supabase_credential.dpapi` (Encrypted Secret)

Both files are Git-ignored.

---

## 3. Reusable Connection Commands

### A. Verify Connection & Database Identity
Runs end-to-end checks (DNS resolution, TCP port 5432 connectivity, and authenticated read-only SQL):
```powershell
.\tools\verify-supabase-connection.ps1
```

### B. Quick Test (Non-Interactive)
```powershell
.\tools\connect-supabase.ps1 -TestOnly
```

### C. Create Timestamped Backup (pg_dump custom format)
Dumps the complete application `public` schema (tables, data, triggers, functions, indexes) to `backups/`:
```powershell
.\tools\connect-supabase.ps1 -Dump
```

### D. Verify Backup Archive (pg_restore)
```powershell
.\tools\pg17\bin\pg_restore.exe --list "backups\funkyfox_public_<TIMESTAMP>.dump"
```

### E. Interactive psql Terminal
Opens an interactive SQL console using PostgreSQL 17 psql:
```powershell
.\tools\connect-supabase.ps1
```

### F. Execute Specific SQL Query
```powershell
.\tools\connect-supabase.ps1 -Command "SELECT count(*) FROM public.products;"
```

---

## 4. Backup Scope & Limitations

| Data Layer | Covered by `connect-supabase.ps1 -Dump` | Notes |
| :--- | :---: | :--- |
| **Public Schema Tables & Data** | **YES** | Products, variants, orders, items, customers, logs, settings |
| **Database Functions & Triggers** | **YES** | `create_customer_order`, `validate_order_status_transition`, etc. |
| **Indexes & Foreign Keys** | **YES** | Full DDL restored |
| **Supabase Auth Users** | **NO** | Reside in private `auth` schema; export via Dashboard -> Authentication |
| **Storage Binary Images** | **NO** | Binary objects in `product-images` bucket reside in S3 object storage |
