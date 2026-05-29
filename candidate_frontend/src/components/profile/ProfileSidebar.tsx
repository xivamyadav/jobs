import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProfileSection, ProfileSectionId } from "@/lib/types";

interface ProfileSidebarProps {
  sections: ProfileSection[];
  activeSection: ProfileSectionId;
  setActiveSection: (section: ProfileSectionId) => void;
}

export default function ProfileSidebar({ sections, activeSection, setActiveSection }: ProfileSidebarProps) {
  return (
    <aside className="w-full sm:w-64 sticky top-10 h-fit">
      <Card className="shadow-sm">
        <CardContent className="p-3">
          <nav className="flex flex-col gap-1">
            {sections.map(section => (
              <Button
                key={section.id}
                variant="ghost"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "justify-start",
                  activeSection === section.id && "bg-secondary text-primary font-semibold"
                )}
              >
                {section.title}
              </Button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}
