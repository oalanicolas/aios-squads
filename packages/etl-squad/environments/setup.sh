#!/bin/bash
# ETL Data Collector - Setup Script

set -e

echo "🚀 Setting up ETL Data Collector..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Install from https://python.org"
    exit 1
fi

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip3 install -r config/python-requirements.txt

# Check API keys
echo "🔑 Checking API keys..."
if [ -z "$ASSEMBLYAI_API_KEY" ]; then
    echo "⚠️  ASSEMBLYAI_API_KEY not set"
    echo "   Get your key at: https://www.assemblyai.com"
    echo "   Then: export ASSEMBLYAI_API_KEY='your-key'"
fi

if [ -z "$ZLIB_EMAIL" ] || [ -z "$ZLIB_PASSWORD" ]; then
    echo "⚠️  ZLIB_EMAIL and/or ZLIB_PASSWORD not set"
    echo "   Set both environment variables before running book collection."
    echo "   Example: export ZLIB_EMAIL='your@email.com'"
    echo "            export ZLIB_PASSWORD='your-password'"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set API keys (export ASSEMBLYAI_API_KEY='...')"
echo "   Set Z-Library credentials (export ZLIB_EMAIL='...' && export ZLIB_PASSWORD='...')"
echo "2. Create sources.yaml"
echo "3. Run: node scripts/orchestrator/parallel-collector.js"
