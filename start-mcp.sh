#!/bin/bash

echo "Lancement des MCP définis dans .mcp-config.railway.json..."

# Lancer chaque MCP en arrière-plan
node /application/custom-mcp-server/simple-thinking.js &
node /application/custom-mcp-server/thinking-server.js &
npx -y @modelcontextprotocol/server-time &
npx -y @pinkpixel/web-scout-mcp &
npx -y @openbnb/mcp-server-airbnb --ignore-robots-txt &
# Serveurs Pipedream désactivés pour Railway
# npx -y supergateway --sse https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/gmail &
# npx -y supergateway --sse https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/google_calendar &
# npx -y supergateway --sse https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/google_tasks &
# npx -y supergateway --sse https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/hubspot &
# npx -y supergateway --sse https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/microsoft_outlook &
# npx -y supergateway --sse https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/microsoft_outlook_calendar &

wait 