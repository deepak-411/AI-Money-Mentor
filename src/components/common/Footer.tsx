"use client";

import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-4 px-4 md:px-6 border-t">
      <div className="text-center text-sm text-muted-foreground">
        {currentYear && `All rights reserved © ${currentYear} ERROR404.`}
      </div>
    </footer>
  );
}
