"use client";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="py-4 px-4 md:px-6 border-t">
      <div className="text-center text-sm text-muted-foreground">
        {`All rights reserved © ${currentYear} Deepak Kumar.`}
      </div>
    </footer>
  );
}
