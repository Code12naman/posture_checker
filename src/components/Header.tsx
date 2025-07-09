import { PersonStanding } from 'lucide-react';

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 border-b">
      <div className="container mx-auto flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <PersonStanding className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">PostureWise</h1>
      </div>
    </header>
  );
}
