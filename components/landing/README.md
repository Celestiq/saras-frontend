# HowItWorksCarousel Component

A responsive, accessible carousel component that displays persona stories from `assets/how_it_works.json`. The carousel allows users to switch between different persona variations (PM, Researcher, DIY, Student) and interact with their learning roadmaps.

## Features

- **Auto-rotation**: Automatically cycles through personas every 8 seconds
- **Interactive Roadmap**: Click to expand/collapse module topics with smooth animations
- **Refine Functionality**: Edit module titles and topics with drag-and-drop reordering
- **Consume Options**: Two consumption formats (newsletter/ebook) with pricing
- **Responsive Design**: Mobile-friendly with dropdown selector and desktop chip selector
- **Accessibility**: Full keyboard navigation, ARIA labels, and focus management
- **Animations**: Micro-animations for roadmap generation and module expansion

## Usage

```tsx
import HowItWorksCarousel from '@/components/landing/HowItWorksCarousel';

export default function MyPage() {
  const handlePersonaChange = (data: { id: string }) => {
    console.log('Persona changed to:', data.id);
  };

  const handleRefine = (data: { id: string; modules: Module[] }) => {
    console.log('Refine roadmap for:', data.id, data.modules);
  };

  const handleConsumeChoice = (data: { id: string; option: 'newsletter' | 'ebook'; price_usd: number }) => {
    console.log('Consume choice:', data);
  };

  return (
    <HowItWorksCarousel
      onPersonaChange={handlePersonaChange}
      onRefine={handleRefine}
      onConsumeChoice={handleConsumeChoice}
      className="my-custom-class"
    />
  );
}
```

## Props

### HowItWorksCarouselProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onPersonaChange` | `(data: { id: string }) => void` | No | Called when user switches personas |
| `onRefine` | `(data: { id: string; modules: Module[] }) => void` | No | Called when user saves refined roadmap |
| `onConsumeChoice` | `(data: { id: string; option: 'newsletter' | 'ebook'; price_usd: number }) => void` | No | Called when user selects consumption option |
| `className` | `string` | No | Additional CSS classes |

## Data Structure

The component expects data from `assets/how_it_works.json` with the following structure:

```typescript
interface PersonaStory {
  id: string;
  persona_title: string;
  target_audience: string;
  hook: string;
  prompt_example: string;
  roadmap: {
    description: string;
    modules: Array<{
      module_title: string;
      topics: string[];
    }>;
  };
  refine_instruction: string;
  consume_options: {
    newsletter: {
      price_usd: number;
      tagline: string;
      benefit: string;
    };
    ebook: {
      price_usd: number;
      tagline: string;
      benefit: string;
    };
  };
  short_lines: {
    situation_line: string;
    roadmap_line: string;
    choose_line: string;
  };
  cta_labels: {
    primary_cta: string;
    refine_cta: string;
    newsletter_cta: string;
    ebook_cta: string;
  };
}
```

## Subcomponents

### PersonaCard
Displays persona illustration, title, and hook with animated avatar.

### RoadmapTimeline
Shows 4 modules as expandable bubbles with topics. Includes refine button and loading animation.

### ConsumeCard
Displays consumption options (newsletter/ebook) with pricing and CTA buttons.

### RefineModal
Modal for editing roadmap modules and topics with drag-and-drop reordering.

## Styling

The component uses Tailwind CSS classes and supports custom styling through:
- Persona-specific color schemes
- CSS custom properties for theming
- Responsive breakpoints (mobile/desktop)

## Accessibility

- Keyboard navigation (arrow keys for carousel, escape for modal)
- ARIA labels for all interactive elements
- Focus management and focus traps
- Screen reader friendly structure

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support required
- Framer Motion for animations

## Dependencies

- React 18+
- Framer Motion
- Lucide React (icons)
- Tailwind CSS
- Custom UI components (Button, Card, etc.)
