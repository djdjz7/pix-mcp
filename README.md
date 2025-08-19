# Pix MCP

A MCP Server that provides a pixel canvas.

## Features

- A canvas server
- WebSocket support for real-time updates

## Prerequisites

- Bun.js

## Installation

1. Clone the repository
2. Run `bun install` to install dependencies
3. Run `bun dev` to start both the canvas server and the preview client
   - or run `bun dev:db` and `bun dev:preview` to start them separately
4. Add `packages/mcp-server/index.ts` to MCP configuration
   - for example, for Cline:
   ```json
   {
     "mcpServers": {
       "pixel-art-canvas": {
         "command": "bun",
         "args": ["YOUR/PATH/TO/REPOSITORY/packages/mcp-server/index.ts"]
       }
     }
   }
   ```
5. Live preview will be on http://localhost:5173 by default, have fun!

## Q&A

### Q: How do I change the canvas size?

A: You can change the canvas size by modifying the `FIELD_SIZE` variable in `packages/db-server/index.ts`. The server should restart as we enabled `watch` mode.

## Known issues

- MCP Server will not hot reload FIELD_SIZE when the canvas is resized.
  - You need to manually reload it in your chat client.
