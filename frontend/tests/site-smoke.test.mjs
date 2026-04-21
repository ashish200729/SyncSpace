import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const frontendRoot = process.cwd();

const read = async (...segments) =>
  readFile(path.join(frontendRoot, ...segments), "utf8");

test("home page exposes valid features and workflow sections", async () => {
  const source = await read("src", "app", "(site)", "page.tsx");

  assert.match(source, /id="features"/);
  assert.match(source, /id="workflow"/);
});

test("header and footer only link to shipped anchors", async () => {
  const headerSource = await read("src", "components", "layout", "Header.tsx");
  const footerSource = await read("src", "components", "layout", "Footer.tsx");

  assert.match(headerSource, /href="\/#features"/);
  assert.match(headerSource, /href="\/#workflow"/);
  assert.match(footerSource, /href="\/#features"/);
  assert.match(footerSource, /href="\/#workflow"/);
  assert.doesNotMatch(headerSource, /hidden rounded-full border/);
});

test("site copy stays user-facing and avoids internal implementation jargon", async () => {
  const homeSource = await read("src", "app", "(site)", "page.tsx");
  const dashboardSource = await read("src", "app", "(site)", "dashboard", "page.tsx");
  const signInSource = await read("src", "components", "auth", "SignInForm.tsx");
  const signUpSource = await read("src", "components", "auth", "SignUpForm.tsx");

  for (const source of [homeSource, dashboardSource, signInSource, signUpSource]) {
    assert.doesNotMatch(source, /WebSockets/i);
    assert.doesNotMatch(source, /Prisma/i);
    assert.doesNotMatch(source, /backend/i);
    assert.doesNotMatch(source, /protected app shell/i);
    assert.doesNotMatch(source, /session-aware/i);
  }
});

test("server session config documents a dedicated server API URL", async () => {
  const envSource = await read(".env.example");
  const sessionSource = await read("src", "lib", "server-session.ts");

  assert.match(envSource, /NEXT_SERVER_API_URL=/);
  assert.match(sessionSource, /NEXT_SERVER_API_URL/);
});
