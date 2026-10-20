#!/usr/bin/env node

/**
 * MCP server for Tools That Don't Upload.
 *
 * This is a thin client that forwards MCP JSON-RPC requests to the public
 * endpoint at https://toolsthatdontupload.com/mcp. The actual tool
 * implementations run on the remote server. File-processing tools run in
 * your browser or on edge workers and never store your files.
 *
 * Transport: stdio (reads JSON-RPC from stdin, writes to stdout).
 *
 * Usage:
 *   npx toolsthatdontupload-mcp
 *   node src/index.mjs
 */

const MCP_ENDPOINT = "https://toolsthatdontupload.com/mcp";

const MANIFEST = {
  name: "toolsthatdontupload",
  version: "1.0.0",
  description: "500+ free tools that process files locally. PDF, CSV, JSON, hashing, encoding, and more.",
  homepage: "https://toolsthatdontupload.com",
};

// --- MCP meta-tools exposed via tools/list ---

const META_TOOLS = [
  {
    name: "search_tools",
    description:
      "Search the tool catalog by keyword. Returns matching tool names, descriptions, parameters and a tested example argument object for each.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: 'Search keywords (e.g. "pdf merge", "sha256", "translate")' },
        category: { type: "string", description: "Optional category filter" },
        limit: { type: "integer", description: "Max results (default 20)" },
      },
      required: ["query"],
    },
  },
  {
    name: "run_tool",
    description:
      "Run a catalog tool by name with an arguments object. Returns the tool result. Errors: 400 invalid input, 413 over size limit (files over 10 MB via MCP, JSON over 2 MiB), 422 unprocessable file, 429 quota used up.",
    inputSchema: {
      type: "object",
      properties: {
        tool: { type: "string", description: 'Catalog tool name (e.g. "hash_text", "pdf_merge")' },
        arguments: { type: "object", description: "Tool arguments as key-value pairs" },
      },
      required: ["tool", "arguments"],
    },
  },
  {
    name: "list_categories",
    description: "List tool categories with counts and example tool names.",
    inputSchema: { type: "object", properties: {} },
  },
];

// --- JSON-RPC helpers ---

function ok(id, result) {
  return JSON.stringify({ jsonrpc: "2.0", id, result });
}

function err(id, code, message) {
  return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
}

// --- Remote call ---

async function callRemote(method, params) {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  const resp = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!resp.ok) {
    throw Object.assign(new Error(`HTTP ${resp.status}`), { code: resp.status });
  }
  const data = await resp.json();
  if (data.error) throw Object.assign(new Error(data.error.message), { code: data.error.code });
  return data.result;
}

// --- Request handler ---

async function handle(req) {
  const { id, method, params } = req;

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: MANIFEST.name, version: MANIFEST.version },
      });

    case "notifications/initialized":
      return null; // no response for notifications

    case "tools/list":
      return ok(id, { tools: META_TOOLS });

    case "tools/call": {
      const name = params?.name;
      const args = params?.arguments ?? {};
      try {
        const result = await callRemote("tools/call", { name, arguments: args });
        return ok(id, result);
      } catch (e) {
        return ok(id, {
          content: [{ type: "text", text: JSON.stringify({ error: e.message }) }],
          isError: true,
        });
      }
    }

    case "ping":
      return ok(id, {});

    default:
      return err(id, -32601, `Method not found: ${method}`);
  }
}

// --- stdio transport ---

async function main() {
  process.stderr.write(`[toolsthatdontupload-mcp] Connected to ${MCP_ENDPOINT}\n`);

  let buffer = "";

  process.stdin.setEncoding("utf8");
  process.stdin.on("data", async (chunk) => {
    buffer += chunk;

    // Process all complete JSON-RPC messages in the buffer
    let boundary;
    while ((boundary = findMessageBoundary(buffer)) !== -1) {
      const raw = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary);

      try {
        const req = JSON.parse(raw);
        const resp = await handle(req);
        if (resp !== null) {
          process.stdout.write(resp + "\n");
        }
      } catch (e) {
        process.stderr.write(`[toolsthatdontupload-mcp] Parse error: ${e.message}\n`);
      }
    }
  });

  process.stdin.on("end", () => process.exit(0));
}

/** Find the end of a complete JSON object in the buffer. */
function findMessageBoundary(buf) {
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < buf.length; i++) {
    const ch = buf[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") { depth--; if (depth === 0) return i + 1; }
  }
  return -1;
}

main().catch((e) => {
  process.stderr.write(`[toolsthatdontupload-mcp] Fatal: ${e.message}\n`);
  process.exit(1);
});
