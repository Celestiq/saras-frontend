// components/create/PlanPreview.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

// Mock plan type
type Plan = {
  title: string;
  modules: { title: string; topics: string[] }[];
};

export default function PlanPreview({ plan }: { plan: Plan }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-2xl font-display font-bold mb-4">{plan.title}</h2>
      <div className="flex-grow overflow-y-auto pr-2">
        <Accordion type="single" collapsible className="w-full">
          {plan.modules.map((module, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{module.title}</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1 text-primary-text/80">
                  {module.topics.map((topic, i) => (
                    <li key={i}>{`Chapter ${index * 7 + i + 1}: ${topic}`}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Button size="lg" className="mt-6 w-full bg-accent hover:bg-accent-hover text-white">Add to Cart</Button>
    </div>
  );
}