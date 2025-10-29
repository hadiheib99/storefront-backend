import { closeDatabase } from "./database";

// Increase default timeout to 15s to avoid flakiness on Windows/Docker.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

// Close the pg pool ONCE after all suites finish.
afterAll(async () => {
  try {
    await closeDatabase();
  } catch {
    // ignore if already closed
  }
});
