#!/usr/bin/env node

const https = require("https");
const http = require("http");

// Configuration
const RAILWAY_URLS = [
  "https://david-new-production.up.railway.app",
  "https://your-app-name.up.railway.app",
  "https://david-ai.up.railway.app",
];

const updateData = {
  oldName: "DeepResearchMCP",
  newName: "Deep Research",
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${url}/api/mcp/update-server-name`;
    console.log(`🔍 Trying: ${fullUrl}`);

    const postData = JSON.stringify(updateData);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": postData.length,
        "User-Agent": "MCP-Update-Script/1.0",
      },
    };

    const req = (url.startsWith("https") ? https : http).request(
      fullUrl,
      options,
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            url: fullUrl,
          });
        });
      },
    );

    req.on("error", (error) => {
      reject({ error, url: fullUrl });
    });

    req.write(postData);
    req.end();
  });
}

async function updateMcpServerName() {
  console.log("🚀 Updating MCP server name on Railway deployment...");
  console.log(`📝 Changing "${updateData.oldName}" to "${updateData.newName}"`);

  for (const url of RAILWAY_URLS) {
    try {
      const result = await makeRequest(url);

      console.log(`\n📊 Response from ${result.url}:`);
      console.log(`   Status: ${result.statusCode}`);

      if (result.statusCode === 200) {
        console.log(`   ✅ Success!`);
        console.log(`   📋 Response: ${result.body}`);

        try {
          const parsed = JSON.parse(result.body);
          if (parsed.success) {
            console.log(`\n🎉 Successfully updated MCP server name!`);
            console.log(
              `🔄 The change should be visible in 1-2 minutes after the system refreshes.`,
            );
            return;
          }
        } catch (e) {
          console.log(`   📋 Raw response: ${result.body}`);
        }
      } else if (result.statusCode === 404) {
        console.log(`   ⚠️ API endpoint not found`);
      } else if (result.statusCode === 302 || result.statusCode === 301) {
        console.log(`   🔄 Redirect to: ${result.headers.location}`);
      } else {
        console.log(`   ❌ Error response`);
        console.log(`   📋 Body: ${result.body}`);
      }
    } catch (error) {
      console.log(`\n❌ Failed to connect to ${error.url}:`);
      console.log(`   ${error.error.message}`);
    }
  }

  console.log(
    `\n💡 If none of the URLs worked, please provide the correct Railway URL for your application.`,
  );
  console.log(
    `💡 Alternative: Access your Railway admin panel and restart the application to force refresh.`,
  );
}

updateMcpServerName();
