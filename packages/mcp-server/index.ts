import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";

const dbServer = "http://localhost:3000";
const FIELD_SIZE = (await (
  await fetch(`${dbServer}/field-size`)
).json()) as number;

const mcpServer = new McpServer({
  name: `Pixel Art Playground`,
  version: "1.0.0",
});

mcpServer.registerTool(
  "get-canvas-size",
  {
    title: "Get Canvas Size",
    description: "Get the current canvas size",
    inputSchema: {},
  },
  () => {
    return {
      content: [
        {
          type: "text",
          text: `Canvas size is ${FIELD_SIZE}x${FIELD_SIZE}`,
        },
      ],
    };
  }
);

mcpServer.registerTool(
  "set-single-pixel",
  {
    title: "Set Single Pixel",
    inputSchema: {
      location: z
        .tuple([
          z
            .number()
            .min(0)
            .max(FIELD_SIZE - 1),
          z
            .number()
            .min(0)
            .max(FIELD_SIZE - 1),
        ])
        .describe("The location of the pixel to set (row, column)"),
      color: z
        .string()
        .refine((x) => {
          if (/^#[0-9A-F]{6}$/i.test(x)) return true;
          throw new Error("color field must be hex color starting with #");
        })
        .describe(
          "The color to set the pixel to, in hex format (e.g. #FF0000 for red)"
        ),
    },
  },
  ({ location, color }) => {
    fetch(`${dbServer}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: [location],
        color,
      }),
    });
    return {
      content: [
        {
          type: "text",
          text: `Set pixel at (${location[0]}, ${location[1]}) to ${color}`,
        },
      ],
    };
  }
);

mcpServer.registerTool(
  "set-batch-pixel",
  {
    title: "Set Batch Pixel",
    inputSchema: {
      pixels: z
        .array(
          z.tuple([
            z
              .number()
              .min(0)
              .max(FIELD_SIZE - 1),
            z
              .number()
              .min(0)
              .max(FIELD_SIZE - 1),
          ])
        )
        .describe("An array of locations of the pixels to set (row, column)"),
      color: z
        .string()
        .refine((x) => {
          if (/^#[0-9A-F]{6}$/i.test(x)) return true;
          throw new Error("color field must be hex color starting with #");
        })
        .describe(
          "The color to set the pixels to, in hex format (e.g. #FF0000 for red)"
        ),
    },
  },
  ({ pixels, color }) => {
    fetch(`${dbServer}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: pixels,
        color,
      }),
    });
    return {
      content: [
        {
          type: "text",
          text: `Set ${pixels.length} pixels to ${color}`,
        },
      ],
    };
  }
);

mcpServer.registerTool(
  "get-image",
  {
    title: "Get Image",
    description: "Generate current image, pixels have been scaled up by 4x",
  },
  async () => {
    return {
      content: [
        {
          type: "image",
          data: Buffer.from(
            await (await fetch(dbServer)).arrayBuffer()
          ).toBase64(),
          mimeType: "image/png",
        },
      ],
    };
  }
);

mcpServer.registerTool(
  "clear-canvas",
  {
    title: "Clear Canvas",
    description: "Clear the entire canvas",
  },
  () => {
    fetch(`${dbServer}/clear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      content: [
        {
          type: "text",
          text: `Cleared the canvas`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
mcpServer.connect(transport);

process.on("SIGINT", async () => {
  await mcpServer.close();
});
