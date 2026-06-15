import { useCallback, useEffect, useRef, useState } from "react";

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now();
    setDurationSec(0);
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (startedAtRef.current) {
        setDurationSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 250);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startedAtRef.current = null;
    setDurationSec(0);
  }, []);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : undefined;
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start(250);
    mediaRecorderRef.current = recorder;
    setRecording(true);
    startTimer();
  }, [startTimer]);

  const stop = useCallback(async (): Promise<{ blob: Blob; filename: string }> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) throw new Error("Not recording");

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        stopTimer();
        const mimeType = recorder.mimeType || "audio/webm";
        recorder.stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes("mp4")
          ? "m4a"
          : mimeType.includes("ogg")
            ? "ogg"
            : mimeType.includes("wav")
              ? "wav"
              : "webm";
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setRecording(false);
        resolve({ blob, filename: `recording.${ext}` });
      };
      recorder.onerror = () => {
        stopTimer();
        reject(new Error("Recording failed"));
      };
      recorder.stop();
    });
  }, [stopTimer]);

  const cancel = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    stopTimer();
    recorder.stream.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setRecording(false);
  }, [stopTimer]);

  return { recording, durationSec, start, stop, cancel };
}
