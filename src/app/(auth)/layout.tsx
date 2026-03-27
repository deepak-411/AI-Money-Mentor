import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loginImage = PlaceHolderImages.find((p) => p.id === "login-bg");

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      {loginImage && (
        <Image
          src={loginImage.imageUrl}
          alt={loginImage.description}
          fill
          className="object-cover -z-10"
          data-ai-hint={loginImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-primary/80 -z-10" />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
