import { cn } from "@/lib/utils";

interface StepsProps {
  currentStep: number;
  totalSteps: number;
}

export function Steps({ currentStep, totalSteps }: StepsProps) {
  const steps = [
    { id: 1, name: 'Producto' },
    { id: 2, name: 'Diseño' },
    { id: 3, name: 'Contacto' },
    { id: 4, name: 'Precio' },
  ];

  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto mb-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center relative">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                currentStep >= step.id
                  ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  : "bg-card border-muted text-muted-foreground"
              )}
            >
              {step.id}
            </div>
            <span className={cn(
              "absolute top-12 text-xs font-medium whitespace-nowrap",
              currentStep === step.id ? "text-primary" : "text-muted-foreground"
            )}>
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-4 bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out" 
                style={{ width: currentStep > step.id ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
