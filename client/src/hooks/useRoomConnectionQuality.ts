import type { Transport } from "mediasoup-client/types";
import { useEffect, useState } from "react";

type Quality = "good" | "fair" | "poor";

interface Stats {
  avgRtt: number;
  avgJitter: number;
  totalLoss: number;
}

function evaluateRoomQuality(stats: Stats): Quality {
  const { avgRtt, avgJitter, totalLoss } = stats;

  if (avgRtt > 0.6 || avgJitter > 0.1 || totalLoss > 50) {
    return "poor";
  } else if (avgRtt > 0.3 || avgJitter > 0.05 || totalLoss > 10) {
    return "fair";
  } else {
    return "good";
  }
}

export function useRoomConnectionQuality(
  transports: Transport[],
  intervalMs: number = 5000
): Quality {
  const [quality, setQuality] = useState<Quality>("good");

  useEffect(() => {
    if (!transports.length) return;

    const interval = setInterval(async () => {
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
            if (report.packetsLost !== undefined)
              totalLoss += report.packetsLost;
          }
        });
      }

      const avgStats: Stats = {
        avgRtt: totalRtt / (count || 1),
        avgJitter: totalJitter / (count || 1),
        totalLoss,
      };

      setQuality(evaluateRoomQuality(avgStats));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [transports, intervalMs]);

  return quality;
}
