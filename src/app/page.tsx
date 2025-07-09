import { Header } from '@/components/Header';
import { PostureAnalyzer } from '@/components/PostureAnalyzer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Improve Your Form, Prevent Injury
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Upload a video of your workout or desk setup. Our AI will provide personalized feedback to help you maintain a healthy posture and optimize your movements.
            </p>
          </div>
          <PostureAnalyzer />
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        <p>PostureWise - Move smart, live well.</p>
      </footer>
    </div>
  );
}
