"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import type { Candidate, Certification, Education, Experience, ProfileSection, ProfileSectionId, Resume, Skill } from '@/lib/types';
import ProfileSidebar from './ProfileSidebar';
import ProfileStepper from './ProfileStepper';
import BasicInfoForm from './BasicInfoForm';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import CertificationSection from './CertificationSection';
import ResumeSection from './ResumeSection';
import { Skeleton } from '@/components/ui/skeleton';
import { certificationApi } from '@/apis/user';

interface ProfileEditorProps {
  initialData: {
    basicInfo: Candidate;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    certifications: Certification[];
    resume?: Resume | null;
  }
}

const sections: ProfileSection[] = [
  { id: 'basic', title: 'Basic Info' },
  { id: 'experience', title: 'Experience' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills' },
  { id: 'certifications', title: 'Certifications' },
  { id: 'resume', title: 'Resume' },
];

export default function ProfileEditor({ initialData }: ProfileEditorProps) {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('basic');
  const isMobile = useIsMobile();

  const [basicInfo, setBasicInfo] = useState<Candidate>(initialData.basicInfo);
  const [experience, setExperience] = useState<Experience[]>(initialData.experience);
  const [education, setEducation] = useState<Education[]>(initialData.education);
  const [skills, setSkills] = useState<Skill[]>(initialData.skills);
  const [certifications, setCertifications] = useState<Certification[]>(initialData.certifications || []);
  const [resume, setResume] = useState<Resume | null>(initialData.resume || null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const refreshCertifications = useCallback(async () => {
    try {
      const res = await certificationApi.getCertifications();
      const data = res?.data ?? res;
      let certs: Certification[] = [];
      if (Array.isArray(data)) certs = data;
      else if (data?.items && Array.isArray(data.items)) certs = data.items;
      else if (data?.results && Array.isArray(data.results)) certs = data.results;
      setCertifications(certs);
    } catch {
      // silent
    }
  }, []);

  const scrollToSection = (id: ProfileSectionId) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header if any
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (isMobile === undefined) {
    return <div className="h-screen w-full bg-background" />;
  }

  if (loading) {
    return <div className="p-0 sm:p-8"><Skeleton className="h-[800px] w-full rounded-lg" /></div>;
  }

  return (
    <div className="container mx-auto max-w-7xl py-4 sm:py-10">
      <div className="flex flex-col sm:flex-row gap-8 lg:gap-12 relative items-start">
        {/* Left Sidebar Navigation */}
        {!isMobile ? (
          <div className="sticky top-24 w-64 flex-shrink-0">
            <ProfileSidebar sections={sections} activeSection={activeSection} setActiveSection={scrollToSection} />
          </div>
        ) : null}

        {/* Main Content Area - All sections stacked */}
        <div className="flex-1 min-w-0 space-y-8 pb-32">
          <div id="basic" className="scroll-mt-24">
            <BasicInfoForm data={basicInfo} onSave={setBasicInfo} />
          </div>
          
          <div id="resume" className="scroll-mt-24">
            <ResumeSection data={resume} onSave={setResume} />
          </div>
          
          <div id="skills" className="scroll-mt-24">
            <SkillsSection data={skills} onSave={setSkills} />
          </div>

          <div id="experience" className="scroll-mt-24">
            <ExperienceSection data={experience} onSave={setExperience} />
          </div>

          <div id="education" className="scroll-mt-24">
            <EducationSection data={education} onSave={setEducation} />
          </div>

          <div id="certifications" className="scroll-mt-24">
            <CertificationSection certifications={certifications} onUpdate={refreshCertifications} />
          </div>
        </div>
      </div>
    </div>
  );
}