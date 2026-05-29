import { cn } from "@/lib/utils";
import type { ProfileSection, ProfileSectionId } from "@/lib/types";
import { Separator } from "../ui/separator";

interface ProfileStepperProps {
  sections: ProfileSection[];
  activeSection: ProfileSectionId;
  setActiveSection: (section: ProfileSectionId) => void;
}

export default function ProfileStepper({ sections, activeSection, setActiveSection }: ProfileStepperProps) {
  const activeIndex = sections.findIndex(s => s.id === activeSection);

  return (
    <div className="mb-8">
      <div className="relative overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex items-center justify-between">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-center z-10">
                <button
                onClick={() => setActiveSection(section.id)}
                className="flex flex-col items-center space-y-2 flex-shrink-0 w-20"
                >
                <div
                    className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors border-2",
                    index <= activeIndex ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-secondary-foreground"
                    )}
                >
                    {index + 1}
                </div>
                <span className={cn("text-xs text-center", index <= activeIndex ? 'font-semibold text-primary' : 'text-muted-foreground')}>{section.title}</span>
                </button>
            </div>
          ))}
        </div>
        <Separator className="absolute top-[16px] w-full -z-1" />
      </div>
    </div>
  );
}
