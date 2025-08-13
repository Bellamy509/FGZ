#!/bin/bash

# Deploy Stripe Environment Variables to Railway
# This script helps you configure Stripe variables on Railway

echo "🚂 Deploying Stripe Configuration to Railway"
echo "=============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please make sure you have a .env file with your Stripe configuration."
    exit 1
fi

# Load environment variables
source .env

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "Install it with: npm i -g @railway/cli"
    echo "Then login with: railway login"
    exit 1
fi

echo "🔍 Checking Stripe variables in .env..."

# Function to add environment variable to Railway
add_railway_var() {
    local var_name=$1
    local var_value=$2
    
    if [ -z "$var_value" ]; then
        echo "⚠️  $var_name is empty, skipping..."
        return
    fi
    
    echo "📝 Adding $var_name to Railway..."
    railway variables set "$var_name=$var_value"
    
    if [ $? -eq 0 ]; then
        echo "✅ $var_name added successfully"
    else
        echo "❌ Failed to add $var_name"
    fi
}

# Check and deploy each Stripe variable
if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo "✅ STRIPE_SECRET_KEY found (${STRIPE_SECRET_KEY:0:7}...)"
    add_railway_var "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
else
    echo "❌ STRIPE_SECRET_KEY not found in .env"
fi

if [ -n "$STRIPE_PUBLISHABLE_KEY" ]; then
    echo "✅ STRIPE_PUBLISHABLE_KEY found (${STRIPE_PUBLISHABLE_KEY:0:7}...)"
    add_railway_var "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY"
else
    echo "❌ STRIPE_PUBLISHABLE_KEY not found in .env"
fi

if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "✅ STRIPE_WEBHOOK_SECRET found (${STRIPE_WEBHOOK_SECRET:0:7}...)"
    add_railway_var "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"
else
    echo "❌ STRIPE_WEBHOOK_SECRET not found in .env"
fi

if [ -n "$STRIPE_PRICE_ID" ]; then
    echo "✅ STRIPE_PRICE_ID found (${STRIPE_PRICE_ID:0:8}...)"
    add_railway_var "STRIPE_PRICE_ID" "$STRIPE_PRICE_ID"
else
    echo "❌ STRIPE_PRICE_ID not found in .env"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Railway will automatically redeploy with the new variables"
echo "2. Wait for deployment to complete (~2-3 minutes)"
echo "3. Test the debug endpoint: https://your-app.railway.app/api/debug/stripe"
echo "4. Verify payments work on your live site"
echo ""
echo "💡 You can also check variables with: railway variables" 