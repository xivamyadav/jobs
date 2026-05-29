"use client";

import React, { useState } from 'react';
import type { Skill } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, Lightbulb, X } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { candidateApi } from '@/apis/user/route';
import { useToast } from '@/hooks/use-toast';

interface SkillsSectionProps {
  data: Skill[];
  onSave: (data: Skill[]) => void;
}

const SUGGESTED_SKILLS = [
  "React", "Node.js", "Python", "Java", "JavaScript", "TypeScript",
  "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "PostgreSQL",
  "Machine Learning", "Data Analysis", "Figma", "UI/UX Design",
  "C++", "C#", "Go", "Ruby on Rails"
];

export default function SkillsSection({ data, onSave }: SkillsSectionProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const getSkillName = (s: any) => s.skill_detail?.skill_name || s.name || s.skill_name || 'Unknown Skill';

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await candidateApi.searchSkills(query);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    }
  };

  const handleAddSkill = async (skillName: string, skillId?: number) => {
    setPopoverOpen(false);
    setSearch('');
    setSearchResults([]);
    setIsAdding(true);

    try {
      const payload = {
        skill_id: skillId || null,
        name: skillId ? undefined : skillName,
        proficiency: 'INTERMEDIATE',
        years_experience: 0,
        is_primary: false,
      };
      const result: any = await candidateApi.addSkill(payload);
      const savedSkill = result.data ? result.data : result;
      onSave([...data, savedSkill]);
      toast({ title: "Skill added" });
    } catch {
      toast({ title: "Failed to add skill", variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await candidateApi.deleteSkill(skillId);
      onSave(data.filter(s => s.id !== skillId));
      toast({ title: "Skill removed" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  const existingNames = data.map(getSkillName).map(n => n.toLowerCase());

  const displayedSuggestions = search.length > 0
    ? searchResults.filter(s => !existingNames.includes((s.skill_name || s.name || '').toLowerCase()))
    : SUGGESTED_SKILLS.filter(s => !existingNames.includes(s.toLowerCase()));

  return (
    <SectionCard
      title="Skills"
      description="Add skills that best define your expertise."
      actions={
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button disabled={isAdding}>
              <Plus className="mr-2 h-4 w-4" />
              {isAdding ? 'Adding...' : 'Add Skill'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <Command>
              <CommandInput
                placeholder="Search skills..."
                value={search}
                onValueChange={handleSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {search && (
                    <button
                      type="button"
                      onClick={() => handleAddSkill(search)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm mt-2 mb-2 w-full mx-2 max-w-[268px]"
                    >
                      <span className="text-base leading-none">+</span>
                      <span>Add &quot;{search}&quot;</span>
                    </button>
                  )}
                </CommandEmpty>

                {displayedSuggestions.length > 0 && (
                  <CommandGroup heading={search.length > 0 ? "Results" : "Suggested Skills"}>
                    {displayedSuggestions.map((skill: any, idx: number) => {
                      const name = typeof skill === 'string' ? skill : (skill.skill_name || skill.name);
                      const id = typeof skill === 'string' ? undefined : (skill.skill_id || skill.id);
                      return (
                        <CommandItem
                          key={id || `sugg-${idx}`}
                          onSelect={() => handleAddSkill(name, id)}
                        >
                          {name}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      }
    >
      <div className="flex flex-wrap gap-3 mt-4">
        {data.length > 0 ? data.map((skill, idx) => (
          <div
            key={skill.id || `added-${idx}`}
            className="group flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium transition-all hover:border-blue-400 hover:shadow-sm"
          >
            <span>{getSkillName(skill)}</span>
            <button
              onClick={() => handleRemoveSkill(skill.id)}
              className="text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
              title="Remove skill"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )) : (
          <div className="w-full text-center py-12 border-2 border-dashed rounded-xl border-slate-200 bg-slate-50/50">
            <Lightbulb className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500 font-medium">No skills added yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add skills like &quot;Python&quot;, &quot;React&quot; to stand out.</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}