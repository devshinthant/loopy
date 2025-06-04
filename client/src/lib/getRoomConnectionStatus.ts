import type { Transport } from "mediasoup-client/types";

export async function getRoomConnectionStats(transports: Transport[]) {
  let totalRtt = 0,
    totalJitter = 0,
    totalLoss = 0,
    count = 0;

  for (const transport of transports) {
    const stats = await transport.getStats();

    stats.forEach((report) => {
      if (
        report.type === "candidate-pair" &&
        report.currentRoundTripTime !== undefined
      ) {
        totalRtt += report.currentRoundTripTime;
        count++;
      }
      if (report.type === "inbound-rtp" && !report.isRemote) {
        if (report.jitter !== undefined) totalJitter += report.jitter;
        if (report.packetsLost !== undefined) totalLoss += report.packetsLost;
      }
    });
  }

  return {
    avgRtt: totalRtt / (count || 1),
    avgJitter: totalJitter / (count || 1),
    totalLoss,
  };
}

export function evaluateRoomQuality({
  avgRtt,
  avgJitter,
  totalLoss,
}: {
  avgRtt: number;
  avgJitter: number;
  totalLoss: number;
}) {
  if (avgRtt > 0.6 || avgJitter > 0.1 || totalLoss > 50) {
    return "poor";
  } else if (avgRtt > 0.3 || avgJitter > 0.05 || totalLoss > 10) {
    return "fair";
  } else {
    return "good";
  }
}
