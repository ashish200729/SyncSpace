import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../dist/app.js";

const startTestServer = async () => {
  const app = createApp();

  return await new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Unable to determine test server address.");
      }

      resolve({
        url: `http://127.0.0.1:${address.port}`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) {
                closeReject(error);
                return;
              }

              closeResolve();
            });
          }),
      });
    });
  });
};

test("GET / returns the backend health payload", async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.url}/`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(payload, { message: "Backend is running" });
  } finally {
    await server.close();
  }
});

test("unknown routes return the JSON 404 payload", async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.url}/missing`);
    const payload = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(payload, {
      error: {
        code: "NOT_FOUND",
        message: "Route not found.",
      },
    });
  } finally {
    await server.close();
  }
});

test("disallowed origins receive the JSON CORS response", async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.url}/`, {
      headers: {
        Origin: "https://blocked.example.com",
      },
    });
    const payload = await response.json();

    assert.equal(response.status, 403);
    assert.deepEqual(payload, {
      error: {
        code: "CORS_ORIGIN_DENIED",
        message: "Request origin is not allowed.",
      },
    });
  } finally {
    await server.close();
  }
});
