import { CanvasDb } from "./canvasDb";

export const FIELD_SIZE = 32;

const previewClients: Bun.ServerWebSocket<unknown>[] = [];

const canvas = new CanvasDb(FIELD_SIZE);

Bun.serve({
  routes: {
    "/update": async (req) => {
      const { location, color } = (await req.body!.json()) as {
        location: [number, number][];
        color: string;
      };
      canvas.setBatchPixels(location, color);
      previewClients.forEach((client) => {
        client.send(JSON.stringify(canvas.getCanvasData()));
      });
      return new Response("OK");
    },
    "/clear": () => {
      canvas.clear();
      previewClients.forEach((client) => {
        client.send(JSON.stringify(canvas.getCanvasData()));
      });
      return new Response("OK");
    },
    "/field-size": () => {
      return new Response(FIELD_SIZE.toString())
    },
    "/": () => {
      return new Response(canvas.generateImage());
    },
    "/ws": (req, server) => {
      if (server.upgrade(req)) {
        return;
      }
      return new Response("Upgrade failed", { status: 500 });
    },
  },
  websocket: {
    message: () => {},
    open: (ws) => {
      previewClients.push(ws);
      ws.send(JSON.stringify(canvas.getCanvasData()));
    },
    close: (ws) => {
      previewClients.splice(previewClients.indexOf(ws), 1);
    },
  },
});

console.log("Server started on http://localhost:3000");