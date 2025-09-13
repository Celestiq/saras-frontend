// components/landing/Pricing.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

// Icon components (placeholder icons using simple shapes)
const EnvelopeIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
);

const CoinsIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export default function Pricing() {
  const router = useRouter();

  const handleJourneyClick = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/create');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto text-center max-w-6xl">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
          Simple, Flexible Pricing
        </h2>
        <p className="text-lg text-foreground/80 mb-12 max-w-2xl mx-auto">
          Choose how you want to learn — daily, instantly, or with credits for even more savings.
        </p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* Daily Newsletter Card */}
          <Card className="relative border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <EnvelopeIcon />
              </div>
              <CardTitle className="text-2xl font-display font-bold text-foreground">
                $2 — 28 daily chapters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-foreground/80">One chapter/day for 28 days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-foreground/80">Builds consistent learning habit</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-foreground/80">Best for steady learners</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Full Instant eBook Card */}
          <Card className="relative border-2 border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary group-hover:bg-secondary/20 transition-colors">
                <BookIcon />
              </div>
              <CardTitle className="text-2xl font-display font-bold text-foreground">
                $3 — Full eBook now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span className="text-foreground/80">Get entire book instantly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span className="text-foreground/80">Learn at your own pace</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">•</span>
                  <span className="text-foreground/80">Best for quick learners or urgent needs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Credits Card - Most Value */}
          <Card className="relative border-2 border-primary hover:border-primary transition-all duration-300 hover:shadow-xl group bg-gradient-to-br from-primary/5 to-secondary/5">
            {/* Most Value Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full shadow-md">
                Most Value
              </span>
            </div>

            <CardHeader className="text-center pb-4 pt-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/30 transition-colors">
                <CoinsIcon />
              </div>
              <CardTitle className="text-2xl font-display font-bold text-foreground">
                Credits — Best Value
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing Options */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                  <span className="text-foreground/80">10 credits</span>
                  <span className="font-bold text-primary">$9 ($0.90/ebook)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                  <span className="text-foreground/80">20 credits</span>
                  <span className="font-bold text-primary">$15 ($0.75/ebook)</span>
                </div>
              </div>

              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-foreground/80">1 credit = 1 eBook (instant access)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-foreground/80">Save more with bulk packs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-foreground/80">Best for frequent learners</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="max-w-2xl mx-auto mb-8">
          <p className="text-foreground/70 text-sm leading-relaxed">
            Credits let you buy multiple eBooks at a reduced price. Perfect if you want to explore many topics.
          </p>
        </div>

        {/* Start Your Journey Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleJourneyClick}
            size="lg"
            className="bg-primary hover:bg-accent-hover text-white px-10 py-7 text-xl rounded-full font-bold
                       
                       transform hover:-translate-y-1
                       transition-all duration-300 ease-out" // Simplified glow and transitions
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </section>
  );
}