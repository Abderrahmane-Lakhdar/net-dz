#!/bin/bash

echo "Starting Cloudflare Tunnel for CreditPro..."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "Error: cloudflared is not installed"
    echo "Please install cloudflared from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
    exit 1
fi

# Make sure we're in the right directory
cd "$(dirname "$0")/.."

# Start the tunnel
cloudflared tunnel --config cloudflare-tunnel-config.yml run CreditPro-dz