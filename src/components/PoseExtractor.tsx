"use client"

import React, { useRef, useEffect } from "react";
// Pose import removed; will load via script and use window.Pose
// Camera import removed; will use getUserMedia directly

const PoseExtractor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;
    let pose: any = null;
    let script: HTMLScriptElement | null = null;
    if (!videoRef.current || !canvasRef.current) return;

    const loadPose = async () => {
      if (!(window as any).Pose) {
        script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script!.onload = resolve;
        });
      }
      pose = new (window as any).Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults((results: any) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (results.image) {
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        }
        if (results.poseLandmarks) {
          for (const landmark of results.poseLandmarks) {
            ctx.beginPath();
            ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "#00FF00";
            ctx.fill();
          }
        }
      });

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const processFrame = async () => {
          if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
            await pose.send({ image: videoRef.current });
          }
          animationId = requestAnimationFrame(processFrame);
        };
        processFrame();
      } catch (err) {
        // Handle error (e.g., user denied camera)
      }
    };
    loadPose();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} style={{ display: "none" }} width={640} height={480} />
      <canvas ref={canvasRef} width={640} height={480} style={{ border: "1px solid #ccc" }} />
      <p className="mt-2 text-sm text-gray-500">Pose/keypoint extraction using MediaPipe</p>
    </div>
  );
};

export default PoseExtractor;
