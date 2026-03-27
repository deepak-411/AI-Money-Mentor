import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const welcomeImage = PlaceHolderImages.find(p => p.id === 'welcome-bg');
  
  return (
    <main className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {welcomeImage && (
        <Image
          src={welcomeImage.imageUrl}
          alt={welcomeImage.description}
          fill
          className="object-cover -z-10 scale-105"
          quality={100}
          data-ai-hint={welcomeImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/70 -z-10" />
      <div className="text-center p-4">
        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000">
          ET Gen AI Hackathon 2026
        </h1>
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <p className="max-w-3xl mx-auto text-2xl md:text-3xl text-slate-200 font-headline">
              Team: ERROR404
            </p>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300">
              Team Leader: Deepak Kumar
            </p>
        </div>
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg group">
            <Link href="/login">
              Enter Project
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-slate-400 animate-in fade-in duration-1000 delay-700">
          <p>Presenting AI Money Mentor</p>
        </div>
      </div>
    </main>
  );
}
