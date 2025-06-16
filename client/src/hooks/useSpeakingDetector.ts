import { useEffect, useState, useRef } from "react";

export function useSpeakingDetector(
  stream: MediaStream | null,
  threshold = 0.05
) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext>(null);
  const analyserRef = useRef<AnalyserNode>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode>(null);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const average = sum / dataArray.length;

      setIsSpeaking(average > threshold * 256);

      requestAnimationFrame(checkVolume);
    };

    checkVolume();

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    return () => {
      analyser.disconnect();
      source.disconnect();
      audioContext.close();
    };
  }, [stream]);

  return isSpeaking;
}
