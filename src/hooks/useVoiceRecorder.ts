import { useCallback, useRef, useState } from "react";

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  }, []);

  const stop = useCallback(async (): Promise<Blob> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) throw new Error("Not recording");

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setRecording(false);
        resolve(blob);
      };
      recorder.onerror = () => reject(new Error("Recording failed"));
      recorder.stop();
    });
  }, []);

  const cancel = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    recorder.stream.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setRecording(false);
  }, []);

  return { recording, start, stop, cancel };
}
