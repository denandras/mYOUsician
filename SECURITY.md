# Security Checklist for mYOUsician

## Environment Variables & Secrets

- [ ] ✅ All sensitive credentials are stored in `.env.local` (not committed)
- [ ] ✅ `.env.example` contains template without actual values
- [ ] ✅ Supabase anon key is public-safe (read-only access with RLS)
- [ ] ✅ Service role key is kept secure and never exposed to client-side
- [ ] ✅ All environment files are in `.gitignore`

## Database Security

- [ ] Row Level Security (RLS) is enabled on all Supabase tables
- [ ] Database policies restrict access appropriately
- [ ] No sensitive user data is exposed through public APIs
- [ ] Input sanitization is implemented for all user inputs

## Authentication

- [ ] Supabase Auth is properly configured
- [ ] Session management is handled securely
- [ ] Password policies are enforced
- [ ] OAuth providers are configured securely

## API Security

- [ ] Rate limiting is implemented on search endpoints
- [ ] Input validation on all API routes
- [ ] CORS is properly configured
- [ ] No API keys or secrets in client-side code

## Common Pitfalls to Avoid

❌ **Never commit these files:**
- `.env.local`
- Any file containing actual API keys
- Database credentials
- Test files with real data

❌ **Never expose in client-side code:**
- Service role keys
- Private API keys
- Database connection strings
- Admin credentials

✅ **Safe to expose (public keys only):**
- Supabase URL (public)
- Supabase anon key (designed to be public with RLS)
- Public configuration like app name, theme settings

## Incident Response

If you accidentally commit sensitive data:

1. **Immediately** rotate all exposed credentials
2. Remove the file from git history: `git filter-branch` or `git rebase`
3. Update Supabase keys in the dashboard
4. Check deployment platforms for cached credentials
5. Review access logs for any unauthorized usage

## Verification Commands

```bash
# Check for accidentally committed env files
git ls-files | grep -E "\.(env|test)"

# Check git history for sensitive patterns
git log --oneline -p | grep -E "(password|key|secret|token)"

# Verify .gitignore is working
git status --ignored
```
