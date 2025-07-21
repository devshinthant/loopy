import * as mediasoup from "mediasoup";

async function createWorker() {
  const config = {
    rtcMinPort: 40000,
    rtcMaxPort: 40100,
  };

  const worker = await mediasoup.createWorker(config);

  console.log("Worker Process Id", worker.pid);

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
