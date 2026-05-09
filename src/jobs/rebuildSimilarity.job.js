const cron = require("node-cron");

const SimilarityBuilderService = require("../services/SimilarityBuilderService");

let isRunning = false;

// ------------------------------------------------
// RUN EVERY DAY AT 3:00 AM
// ------------------------------------------------

cron.schedule("0 3 * * *", async () => {

  if (isRunning) {
    console.log("[CRON] Similarity rebuild already running.");
    return;
  }

  try {

    isRunning = true;

    console.log("[CRON] Rebuilding similarity model...");

    await SimilarityBuilderService.buildSimilarityModel();

    console.log("[CRON] Similarity model rebuilt successfully.");

  } catch (error) {
    console.error("[CRON] Rebuild similarity failed:", error);

  } finally {
    isRunning = false;

  }
});