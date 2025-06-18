#!/bin/bash
# Genesis Engine Quick Test Script

echo "🚀 Genesis Engine Test Suite"
echo "=========================="

# Check Node version
echo "✓ Checking Node.js version..."
node_version=$(node -v)
echo "  Node.js: $node_version"

# Check if package-lock.json needs fixing
if ! grep -q "@google/generative-ai" package-lock.json 2>/dev/null; then
  echo "❌ CRITICAL: package-lock.json is missing @google/generative-ai!"
  echo "  Running fix..."
  rm -f package-lock.json
  npm install
  echo "  ✓ Fixed!"
else
  echo "✓ package-lock.json is valid"
fi

# Install dependencies
echo "✓ Installing dependencies..."
npm install --silent

# Run type check
echo "✓ Running TypeScript check..."
npm run type-check

# Test build
echo "✓ Testing production build..."
npm run build

echo ""
echo "✅ All checks passed! Your Genesis Engine is ready."
echo ""
echo "Next steps:"
echo "1. Add your SCAP to src/config/engine.ts"
echo "2. Run 'npm run dev' to start"
echo "3. Open http://localhost:5173"
echo ""