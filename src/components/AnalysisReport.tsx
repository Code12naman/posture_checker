"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, FileText, BrainCircuit, BarChart2 } from "lucide-react";
import { Separator } from "./ui/separator";

interface Report {
  duration: number;
  metrics: {
    overallScore: number;
    squat: {
      kneeOverToe: { badPosturePercentage: number };
      backAngle: { badPosturePercentage: number };
    };
    sitting: {
      neckBend: { badPosturePercentage: number };
      backSlouch: { badPosturePercentage: number };
    };
  };
  feedback: {
    timestamp: number;
    issue: string;
  }[];
}

export interface AnalysisResult {
  report: Report;
  summary: string;
}

interface AnalysisReportProps {
  result: AnalysisResult;
}

const MetricItem = ({ label, percentage }: { label: string; percentage: number }) => {
  const getProgressColor = (value: number) => {
    if (value <= 15) return "bg-chart-2"; // Green
    if (value <= 40) return "bg-chart-4"; // Yellow
    return "bg-chart-5"; // Red
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{percentage}%</span>
      </div>
      <Progress value={percentage} indicatorClassName={getProgressColor(percentage)} />
    </div>
  );
};

export function AnalysisReport({ result }: AnalysisReportProps) {
  const { report, summary } = result;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            AI Summary
          </CardTitle>
          <CardDescription>
            Here is a personalized summary of your posture analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
          <p>{summary}</p>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-primary" />
              Key Metrics
            </CardTitle>
            <CardDescription>Breakdown of posture deviations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-center p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-primary font-medium">Overall Good Posture</p>
                <p className="text-4xl font-bold text-primary">{report.metrics.overallScore}%</p>
             </div>
             <Separator/>
             <MetricItem label="Knee Deviation (Squat)" percentage={report.metrics.squat.kneeOverToe.badPosturePercentage} />
             <MetricItem label="Back Angle (Squat)" percentage={report.metrics.squat.backAngle.badPosturePercentage} />
             <MetricItem label="Forward Neck Tilt (Sitting)" percentage={report.metrics.sitting.neckBend.badPosturePercentage} />
             <MetricItem label="Back Slouch (Sitting)" percentage={report.metrics.sitting.backSlouch.badPosturePercentage} />
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Detailed Feedback
            </CardTitle>
            <CardDescription>Specific events identified in the video.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden">
                <Image src="https://placehold.co/640x360.png" alt="Posture analysis visual" layout="fill" objectFit="cover" data-ai-hint="fitness posture"/>
            </div>
            <ul className="space-y-3">
              {report.feedback.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                    {item.issue.toLowerCase().includes("good") ? <CheckCircle2 className="w-5 h-5 text-chart-2 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-chart-5 shrink-0 mt-0.5" />}
                  <span>
                     <span className="font-semibold">{(item.timestamp).toFixed(1)}s:</span>
                     <span className="text-muted-foreground ml-1">{item.issue}</span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
