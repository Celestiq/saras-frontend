// components/create/Header.tsx
import { ShoppingCart, Feather } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const cartCount = 1; // This will come from state
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="flex items-center gap-2">
        <Feather className="w-6 h-6 text-accent" />
        <span className="font-display text-2xl font-bold">Saras</span>
      </Link>
      <Link href="/cart" className="relative">
        <ShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-accent text-white w-5 h-5 flex items-center justify-center p-0">
            {cartCount}
          </Badge>
        )}
      </Link>
    </header>
  );
}