#!/bin/bash
# ============================================================
# NPL Hub — Bootstrap Script
# Run this ONCE in an empty directory on your machine:
#   chmod +x bootstrap.sh && ./bootstrap.sh
# ============================================================

set -e

echo "🏏 Scaffolding NPL Hub..."

# 1. Create Next.js app
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

# 2. Install core dependencies
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  recharts \
  framer-motion \
  lucide-react \
  clsx \
  tailwind-merge \
  date-fns \
  next-intl \
  @vercel/analytics \
  @sentry/nextjs \
  zod

# 3. Install shadcn/ui
npx shadcn@latest init --defaults

# 4. Add shadcn components we'll use
npx shadcn@latest add button badge card separator skeleton tabs
npx shadcn@latest add avatar progress tooltip sheet dialog

# 5. Install dev dependencies
npm install -D \
  vitest \
  @vitest/ui \
  @testing-library/react \
  @testing-library/jest-dom \
  @playwright/test \
  prettier \
  prettier-plugin-tailwindcss \
  @types/node

# 6. Install Playwright browsers
npx playwright install --with-deps chromium

echo ""
echo "✅ NPL Hub scaffolded successfully!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.local.example to .env.local and fill in your keys"
echo "  2. Run: npx supabase init  (if using Supabase CLI)"
echo "  3. Run: npm run dev"
echo ""
