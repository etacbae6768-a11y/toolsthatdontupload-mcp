# Tools That Don't Upload — MCP stdio client

A small stdio bridge for MCP clients that cannot connect to a remote MCP server directly. It forwards every request to the hosted MCP server of [Tools That Don't Upload](https://toolsthatdontupload.com) at `https://toolsthatdontupload.com/mcp`.

**This package does not process anything on your computer.** Tool calls, including any file you pass to a tool (as base64), are sent over HTTPS to our server, processed in Cloudflare Workers memory to produce the result, and not stored. If your client supports remote MCP servers, connect to the URL directly and you do not need this package.

Looking for tools that run entirely on your computer? The Claude plugin in [tools-that-dont-upload](https://github.com/etacbae6768-a11y/tools-that-dont-upload/tree/main/plugin) includes a local server (20 tools, no network requests). The browser tools on [toolsthatdontupload.com](https://toolsthatdontupload.com) also keep files on your device.

## Use

### Recommended: connect to the remote server directly

```
https://toolsthatdontupload.com/mcp
```

Claude Code:

```
claude mcp add --transport http tools-that-dont-upload https://toolsthatdontupload.com/mcp
```

Setup for other clients: https://toolsthatdontupload.com/docs/mcp/

### This stdio bridge

This package is **not published on npm**. Clone the repository and point your client at the script (Node.js 18 or later):

```json
{
  "mcpServers": {
    "toolsthatdontupload": {
      "command": "node",
      "args": ["/path/to/toolsthatdontupload-mcp/src/index.mjs"]
    }
  }
}
```

The bridge does not send an API key, so anonymous limits apply (see below).

## How it works

`tools/list` returns three tools; every `tools/call` is forwarded unchanged to the remote server.

| Tool | Description |
|---|---|
| `search_tools` | Search the tool catalog by keyword. Returns names, descriptions, parameters and an example argument object. |
| `run_tool` | Run a catalog tool by name with arguments. |
| `list_categories` | List tool categories with counts. |

The catalog covers text and Markdown, JSON/CSV/XML/YAML, dates, math, hashing and encoding, PDF merge/split/rotate, network lookups, Korean text tools and a few AI tools. The remote server also has tools that this bridge does not list (for example HWP/HWPX conversion and saved file flows); connect to the remote URL to use them.

## Where your data goes

- **All tools**: the request (and any file in it) goes to `toolsthatdontupload.com` and is processed in Cloudflare Workers memory. We do not store request content.
- **Network tools** (fetch a URL, DNS, WHOIS, SSL): our server contacts the host you name.
- **AI tools**: text is sent to Cloudflare Workers AI.
- Each result lists the external hosts contacted in `_meta["com.toolsthatdontupload/egress"]`.
- Full policy: https://toolsthatdontupload.com/privacy/

## Limits

The same limits as the hosted API ([pricing](https://toolsthatdontupload.com/pricing/)):

- Without a key: compute tools under fair use (rate limited); file tools 20 calls/day and AI tools 10 calls/day per IP address, reset at 00:00 UTC; network tools need a key.
- Free API key: 1,000 credits/month, plus a daily allowance of 20 file and 10 AI calls per key; unlocks network tools. Get one at https://toolsthatdontupload.com/api-keys/ (this bridge does not send keys; connect to the remote URL with an `X-API-Key` header to use one).
- Files through MCP: up to 10 MB. Tool results: up to 2 MiB.
- Paid plans are listed on the pricing page; checkout is not open yet.

## License

MIT

---

Listed on: [![Toolsthatdontupload Mcp on AI Agents Listing](https://aiagentslisting.com/toolsthatdontupload-mcp/badge.svg?claim=d5fa0a6f188181d9315d7b5b85957b50)](https://aiagentslisting.com/mcp/toolsthatdontupload-mcp)