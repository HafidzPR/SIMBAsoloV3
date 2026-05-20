import { useRef, useState, useCallback } from "react";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await new Promise<void>((resolve) => {
        videoRef.current!.onloadedmetadata = () => resolve();
      });
      await videoRef.current.play();
      setActive(true);
    } catch (e: any) {
      setError(`Camera error: ${e.name}. Grant camera permissions and retry.`);
    }
  }, []);

  const stop = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return null;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d")!;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(v, -c.width, 0);
    ctx.restore();
    return c.toDataURL("image/jpeg", 0.8);
  }, []);

  return { videoRef, canvasRef, active, error, start, stop, captureFrame };
}
