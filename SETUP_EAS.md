## EAS Setup

1. Login:
   - `npx eas login`
2. Initialize project (once):
   - `npx eas init`
3. Push all variables from `.env`:
   - `npm run eas:secrets:push`

If step 3 fails with "EAS project not configured", run step 2 first.
