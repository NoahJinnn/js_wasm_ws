import init, { ws_ping } from "./pkg/wasm_ws.js";

// Expose the functions to the global scope
(window as any).init = init;
(window as any).ws_ping = ws_ping;

window.addEventListener("load", async () => {
  await init("./pkg/wasm_ws_bg.wasm");
  const endpoint = "ws://localhost:8080";
  const message = "Hello, WebSocket!";
  ws_ping(endpoint, message)
    .then((response) => console.log("Received: " + response))
    .catch((error) => console.error("Error: " + error));
});
