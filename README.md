# Tools That Don't Upload — MCP Server

MCP (Model Context Protocol) server for [Tools That Don't Upload](https://toolsthatdontupload.com). Gives your AI assistant access to **500+ free tools** that process data without uploading files to a server.

PDF operations, hashing, encoding, CSV/JSON/XML manipulation, text processing, color conversion, date calculations, network lookups, and more.

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "toolsthatdontupload": {
      "command": "npx",
      "args": ["-y", "toolsthatdontupload-mcp"]
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP settings:

```json
{
  "mcpServers": {
    "toolsthatdontupload": {
      "command": "npx",
      "args": ["-y", "toolsthatdontupload-mcp"]
    }
  }
}
```

### Remote URL (no install)

If your MCP client supports remote servers:

```
https://toolsthatdontupload.com/mcp
```

## How It Works

This package is a thin MCP client that forwards requests to the public API at `https://toolsthatdontupload.com/mcp`. The actual tools run on Cloudflare Workers.

Three meta-tools are exposed:

| Tool | Description |
|---|---|
| `search_tools` | Search 500+ tools by keyword. Returns names, descriptions, parameters, and example arguments. |
| `run_tool` | Run any tool by name with arguments. |
| `list_categories` | Browse tool categories with counts. |

Your AI assistant calls `search_tools` to find the right tool, then `run_tool` to execute it.

## Categories

| Category | Tools | Examples |
|---|---|---|
| Text & Markdown | 90 | diff, html_clean, markdown_toc, regex_match |
| Data (JSON, CSV, XML) | 81 | csv_filter, json_flatten, xml_to_json, yaml_parse |
| Date & time | 45 | business_days, cron_parse, timezone_convert |
| Math & finance | 44 | compound_interest, percentage, unit_price |
| Miscellaneous | 44 | api_mock, qr_code, uuid, word_count |
| Arrays & objects | 33 | array_chunk, array_sort, object_diff, object_merge |
| Web & HTTP | 25 | accept_header, cookie_parse, cors_headers, url_parse |
| Crypto & hashing | 24 | aes_encrypt, hash, hmac, sha256, jwt_decode |
| Encoding | 22 | base64, hex, html_entities, url_encode |
| Network | 20 | dns_lookup, domain_age, favicon, ssl_check, whois |
| Generators | 17 | barcode, fake_data, lorem_ipsum, password, uuid |
| Color | 14 | color_blend, color_contrast, color_convert, color_gradient |
| Unit conversion | 13 | length, temperature, weight, data_size |
| AI | 3 | ai_ocr, ai_summarize, ai_translate |
| Image | 2 | avatar_svg, placeholder |
| Validation | 2 | is_json, json_schema_validate |

## Privacy

- **File-processing tools** (PDF, images, etc.) run in your browser or on edge workers. Files are processed in memory and never stored.
- **Network tools** (dns_lookup, whois, etc.) send only the queried hostname to public DNS/WHOIS services.
- **No tracking.** No analytics cookies. Minimal server logs (timestamp, tool name, status code). No file content is logged.
- See the full [privacy policy](https://toolsthatdontupload.com/privacy/).

## Limits

- Free tier: 50 requests/day, 10 MB max file size via MCP, 2 MiB max JSON body.
- API key (free): 1,000 requests/day. Get one at [toolsthatdontupload.com/keys](https://toolsthatdontupload.com/keys/).
- Paid plans available for higher limits.

## License

MIT
