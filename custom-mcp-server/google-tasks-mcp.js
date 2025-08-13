const { spawn } = require("child_process");

const PIPEDREAM_ENDPOINT =
  "https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/tasks";

function handlePipedreamResponse(data) {
  try {
    const response = JSON.parse(data.toString());
    if (response.error) {
      console.error("Tasks API Error:", response.error);
      return;
    }
    process.stdout.write(data);
  } catch (err) {
    console.error("Error parsing response:", err);
  }
}

function main() {
  const curl = spawn("curl", [
    "-N",
    PIPEDREAM_ENDPOINT,
    ...process.argv.slice(2),
  ]);

  curl.stdout.on("data", handlePipedreamResponse);

  curl.stderr.on("data", (data) => {
    console.error(`curl error: ${data}`);
  });

  curl.on("close", (code) => {
    if (code !== 0) {
      console.error(`curl process exited with code ${code}`);
    }
  });

  process.on("SIGINT", () => {
    curl.kill();
    process.exit();
  });
}

if (require.main === module) {
  main();
}
