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
      <div className="absolute inset-0 bg-black/60 -z-10" />
      <div className="text-center p-4">
        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000">
          ET Gen AI HACKATHON 2026
        </h1>
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <p className="text-2xl md:text-3xl text-slate-200">Team Name : ERROR404</p>
            <p className="text-xl md:text-2xl text-slate-300">Team Leader : Deepak Kumar</p>
        </div>
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg group">
            <Link href="/login">
              Enter
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
