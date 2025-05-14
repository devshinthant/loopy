const mediasoup = require("mediasoup");

async function createWorker() {
  const worker = await mediasoup.createWorker({
    logLevel: "info",
    logTags: ["info"],
  });

  worker.on("died", () => {
    console.error(
      "mediasoup worker died, exiting in 2 seconds... [pid:%d]",
      worker.pid
    );
    setTimeout(() => process.exit(1), 2000);
  });
  return worker;
}

export default createWorker;
