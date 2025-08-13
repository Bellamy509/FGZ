#!/bin/bash

# Deploy Stripe Environment Variables to Vercel
# This script reads your local .env file and deploys the Stripe variables to Vercel

echo "🚀 Deploying Stripe Configuration to Vercel"
echo "============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please make sure you have a .env file with your Stripe configuration."
    exit 1
fi

# Load environment variables
source .env

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Function to add environment variable to Vercel
add_env_var() {
    local var_name=$1
    local var_value=$2
    
    if [ -z "$var_value" ]; then
        echo "⚠️  $var_name is empty, skipping..."
        return
    fi
    
    echo "📝 Adding $var_name to Vercel..."
    echo "$var_value" | vercel env add "$var_name" production
    
    if [ $? -eq 0 ]; then
        echo "✅ $var_name added successfully"
    else
        echo "❌ Failed to add $var_name"
    fi
}

echo "🔍 Checking Stripe variables in .env..."

# Check and deploy each Stripe variable
if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo "✅ STRIPE_SECRET_KEY found"
    add_env_var "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
else
    echo "❌ STRIPE_SECRET_KEY not found in .env"
fi

if [ -n "$STRIPE_PUBLISHABLE_KEY" ]; then
    echo "✅ STRIPE_PUBLISHABLE_KEY found"
    add_env_var "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY"
else
    echo "❌ STRIPE_PUBLISHABLE_KEY not found in .env"
fi

if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "✅ STRIPE_WEBHOOK_SECRET found"
    add_env_var "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"
else
    echo "❌ STRIPE_WEBHOOK_SECRET not found in .env"
fi

if [ -n "$STRIPE_PRICE_ID" ]; then
    echo "✅ STRIPE_PRICE_ID found"
    add_env_var "STRIPE_PRICE_ID" "$STRIPE_PRICE_ID"
else
    echo "❌ STRIPE_PRICE_ID not found in .env"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Redeploy your application with: vercel --prod"
echo "2. Test the debug endpoint: https://your-site.vercel.app/api/debug/stripe"
echo "3. Verify payments work on your live site"
echo ""
echo "💡 To redeploy now, run: vercel --prod" 