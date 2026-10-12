import { Car } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold font-headline text-foreground">
              Mi Billetera Vehicular
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
