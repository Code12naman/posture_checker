"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Upload, Video, Loader2, Info, Webcam, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AnalysisReport, type AnalysisResult } from "@/components/AnalysisReport";
import { getPostureSummary } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import PoseExtractor from "./PoseExtractor";

export function PostureAnalyzer() {
  const [activeTab, setActiveTab] = useState("upload");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<{ message: string; isWarning: boolean } | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const feedbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setLiveFeedback(null);
    if (feedbackIntervalRef.current) {
      clearInterval(feedbackIntervalRef.current);
      feedbackIntervalRef.current = null;
    }
  }

  const handleStartWebcam = async () => {
    stopWebcam();
    try {
      setLiveFeedback(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setHasCameraPermission(true);
      setIsCapturing(true);

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsCapturing(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this app.',
      });
    }
  };
  
  useEffect(() => {
    return () => {
      stopWebcam();
      if (feedbackIntervalRef.current) {
        clearInterval(feedbackIntervalRef.current);
      }
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a video smaller than 50MB.",
        });
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setAnalysisResult(null);
      setError(null);
      setLiveFeedback(null);
    }
  };

  const handleAnalyze = () => {
    if (activeTab === 'upload' && !videoSrc) {
      toast({ variant: "destructive", title: "No video selected", description: "Please upload a video first." });
      return;
    }
    if (activeTab === 'webcam' && !isCapturing) {
       toast({ variant: "destructive", title: "Webcam not started", description: "Please start your webcam first." });
       return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setLiveFeedback({ message: "Starting analysis...", isWarning: false });

    if (feedbackIntervalRef.current) {
      clearInterval(feedbackIntervalRef.current);
    }
    
    let analysisProgress = 0;
    const analysisDuration = 10;
    const collectedFeedback: { timestamp: number; issue: string }[] = [];
    const isSquatVideo = Math.random() > 0.5;

    feedbackIntervalRef.current = setInterval(async () => {
        analysisProgress++;
        const timestamp = (analysisProgress / analysisDuration) * 20;

        let newFeedback = null;
        const randomChance = Math.random();

        if (isSquatVideo) {
            if (randomChance < 0.2) {
                newFeedback = { timestamp, issue: "Knee over toe" };
            } else if (randomChance < 0.35) {
                newFeedback = { timestamp, issue: "Back angle too low (< 150°)" };
            }
        } else {
            if (randomChance < 0.25) {
                newFeedback = { timestamp, issue: "Neck bend > 30°" };
            } else if (randomChance < 0.45) {
                newFeedback = { timestamp, issue: "Back not straight (< 160°)" };
            }
        }

        if (newFeedback) {
            collectedFeedback.push(newFeedback);
            setLiveFeedback({ message: newFeedback.issue, isWarning: true });
        } else {
            if(Math.random() < 0.2) {
                 const goodMessage = isSquatVideo ? "Good squat form" : "Good sitting posture";
                 collectedFeedback.push({ timestamp, issue: goodMessage });
                 setLiveFeedback({ message: goodMessage, isWarning: false });
            }
        }


        if (analysisProgress >= analysisDuration) {
            if (feedbackIntervalRef.current) {
                clearInterval(feedbackIntervalRef.current);
                feedbackIntervalRef.current = null;
            }

            if (!collectedFeedback.some(f => f.issue.toLowerCase().includes('good'))) {
                const goodMessage = isSquatVideo ? "Good squat form" : "Good sitting posture";
                collectedFeedback.push({ timestamp: Math.random() * 20, issue: goodMessage });
                collectedFeedback.sort((a, b) => a.timestamp - b.timestamp);
            }

            setLiveFeedback({ message: "Generating summary report...", isWarning: false });

            let badPostureEvents = collectedFeedback.filter(f => !f.issue.toLowerCase().includes('good')).length;
            const goodPosturePercentage = ((analysisDuration - badPostureEvents) / analysisDuration) * 100;
            const overallScore = Math.max(0, Math.min(100, Math.round(goodPosturePercentage - (Math.random() * 10))));
            
            const squatKnee = collectedFeedback.filter(f => f.issue.includes('Knee')).length;
            const squatBack = collectedFeedback.filter(f => f.issue.includes('Back angle')).length;
            const sittingNeck = collectedFeedback.filter(f => f.issue.includes('Neck bend')).length;
            const sittingBack = collectedFeedback.filter(f => f.issue.includes('Back not straight')).length;

            const mockReport = {
                duration: 20,
                metrics: {
                    overallScore,
                    squat: {
                        kneeOverToe: { badPosturePercentage: Math.min(100, squatKnee * 15 + Math.floor(Math.random() * 10)) },
                        backAngle: { badPosturePercentage: Math.min(100, squatBack * 15 + Math.floor(Math.random() * 10)) },
                    },
                    sitting: {
                        neckBend: { badPosturePercentage: Math.min(100, sittingNeck * 15 + Math.floor(Math.random() * 10)) },
                        backSlouch: { badPosturePercentage: Math.min(100, sittingBack * 15 + Math.floor(Math.random() * 10)) },
                    },
                },
                feedback: collectedFeedback,
            };

            const response = await getPostureSummary(JSON.stringify(mockReport));

            if (response.success && response.summary) {
                setAnalysisResult({ report: mockReport, summary: response.summary });
            } else {
                setError(response.error || "An unknown error occurred.");
                toast({ variant: "destructive", title: "Analysis Failed", description: response.error || "Could not generate AI summary." });
            }
            
            setIsLoading(false);
            setTimeout(() => setLiveFeedback(null), 3000);
        }
    }, 1200);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setAnalysisResult(null);
    setError(null);
    setLiveFeedback(null);
    setIsLoading(false);
    if (feedbackIntervalRef.current) {
      clearInterval(feedbackIntervalRef.current);
      feedbackIntervalRef.current = null;
    }
    if(value === 'upload') {
      stopWebcam();
    }
  }

  const renderLiveFeedback = () => {
    if (!liveFeedback) return null;
    return (
       <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 w-auto whitespace-nowrap px-4 py-2 rounded-lg text-white font-semibold shadow-lg z-10 transition-all duration-300 ${liveFeedback.isWarning ? 'bg-destructive' : 'bg-primary'}`}>
          {liveFeedback.isWarning && <AlertTriangle className="h-5 w-5" />}
          <span>{liveFeedback.message}</span>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Video className="w-6 h-6 text-primary" />
          Posture Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="upload" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" disabled={isLoading}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </TabsTrigger>
            <TabsTrigger value="webcam" disabled={isLoading}>
              <Webcam className="w-4 h-4 mr-2" />
              Use Webcam
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="pt-4 space-y-4">
            <Input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file:text-primary file:font-semibold"
              disabled={isLoading}
            />
             <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Demo Mode</AlertTitle>
              <AlertDescription>
                This app uses mock data for analysis. Upload any short video or use your webcam to see the AI summary feature.
              </AlertDescription>
            </Alert>
            {videoSrc && (
              <div className="space-y-4">
                <div className="relative bg-muted rounded-md overflow-hidden border">
                  <video ref={videoRef} src={videoSrc} controls className="w-full aspect-video"></video>
                  {renderLiveFeedback()}
                </div>
                <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
                  {isLoading ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing... </> ) : ( "Analyze Posture" )}
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="webcam" className="pt-4 space-y-4">
             <div className="relative bg-muted rounded-md overflow-hidden border">
                <video ref={webcamRef} className="w-full aspect-video" autoPlay muted playsInline />
                {renderLiveFeedback()}
            </div>
             {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser settings to use this feature.
                    </AlertDescription>
                </Alert>
             )}
            <div className="flex gap-2">
                {!isCapturing ? (
                    <Button onClick={handleStartWebcam} className="w-full" disabled={isLoading}>Start Webcam</Button>
                ) : (
                    <Button onClick={stopWebcam} variant="outline" className="w-full" disabled={isLoading}>Stop Webcam</Button>
                )}
            </div>
             {isCapturing && (
                <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
                  {isLoading ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing... </> ) : ( "Analyze Posture" )}
                </Button>
            )}
            <TabsContent value="webcam">
              <div className="flex flex-col items-center">
                <PoseExtractor />
              </div>
            </TabsContent>
          </TabsContent>
        </Tabs>

        {isLoading && !analysisResult && (
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center text-muted-foreground space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="font-semibold">Our AI is analyzing your posture...</span>
                </div>
            </div>
        )}

        {error && <p className="text-destructive text-center">{error}</p>}
        
        {analysisResult && (
          <div className="pt-4">
            <AnalysisReport result={analysisResult} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
