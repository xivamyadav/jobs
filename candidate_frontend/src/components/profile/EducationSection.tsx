"use client";

import React, { useState } from 'react';
import type { Education } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { candidateApi } from '@/apis/user/route';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

// Django Model Choices match karne ke liye constant
const EDUCATION_LEVELS = [
  { value: 'SECONDARY', label: 'Secondary' },
  { value: 'SENIOR_SECONDARY', label: 'Senior Secondary' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'BACHELORS', label: 'Bachelors' },
  { value: 'MASTERS', label: 'Masters' },
  { value: 'PHD', label: 'PhD' },
  { value: 'CERTIFICATION', label: 'Certification' },
];

interface EducationSectionProps {
  data: Education[];
  onSave: (data: Education[]) => void;
}

const educationSchema = z.object({
  level: z.string().min(1, 'Level is required'),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().optional(),
  field_of_study: z.string().optional(),
  start_year: z.coerce.number().optional().nullable(),
  end_year: z.coerce.number().optional().nullable(),
  grade: z.string().optional().nullable(),
});

type EducationFormData = z.infer<typeof educationSchema>;

const EducationForm = ({ education, onSave, closeDialog }: { education?: Education, onSave: (data: any) => void, closeDialog: () => void }) => {
  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: education || { level: '', institution: '' },
  });

  const handleSubmit = (values: EducationFormData) => {
    // 1. Clean payload for backend
    const payload: any = {
      level: values.level, // Now sends valid choices like 'BACHELORS'
      institution: values.institution,
      degree: values.degree?.trim() || null,
      field_of_study: values.field_of_study?.trim() || null,
      grade: values.grade?.trim() || null,
      start_year: values.start_year || null,
      end_year: values.end_year || null,
    };

    // 2. Only add ID if updating
    if (education?.id) {
      payload.id = education.id;
    }

    onSave(payload);
    closeDialog();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="level" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Education Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EDUCATION_LEVELS.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="institution" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Institution</FormLabel>
              <FormControl><Input placeholder="e.g., Jaypee University" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="degree" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Degree</FormLabel>
              <FormControl><Input placeholder="e.g., B.Tech" {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="field_of_study" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Field of Study</FormLabel>
              <FormControl><Input placeholder="e.g., Computer Science" {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="start_year" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Start Year</FormLabel>
              <FormControl><Input type="number" placeholder="2022" {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="end_year" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>End Year</FormLabel>
              <FormControl><Input type="number" placeholder="2026" {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="md:col-span-2">
            <FormField name="grade" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Grade / CGPA</FormLabel>
                <FormControl><Input placeholder="e.g., 8.5" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save Education</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function EducationSection({ data, onSave }: EducationSectionProps) {
  const [open, setOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | undefined>();
  const { toast } = useToast();

  const handleSave = async (payloadData: any) => {
    try {
      let saved: Education;
      if (payloadData.id) {
        saved = await candidateApi.updateEducation(payloadData.id, payloadData);
        onSave(data.map(e => e.id === payloadData.id ? saved : e));
      } else {
        saved = await candidateApi.createEducation(payloadData);
        onSave([...data, saved]);
      }
      toast({ title: "Education Saved Successfully!" });
    } catch (error) {
      toast({ title: "Failed to save education", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await candidateApi.deleteEducation(id);
      onSave(data.filter(e => e.id !== id));
      toast({ title: "Education Deleted", variant: "destructive" });
    } catch (error) {
      toast({ title: "Failed to delete education", variant: "destructive" });
    }
  };

  const openDialog = (edu?: Education) => {
    setEditingEducation(edu);
    setOpen(true);
  }

  return (
    <SectionCard
      title="Education"
      description="List your academic qualifications."
      actions={
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Education
        </Button>
      }
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingEducation ? 'Edit' : 'Add'} Education</DialogTitle>
          </DialogHeader>
          <EducationForm
            education={editingEducation}
            onSave={handleSave}
            closeDialog={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <div className="space-y-4">
        {data.length > 0 ? data.sort((a, b) => (b.end_year || 0) - (a.end_year || 0)).map(edu => (
          <Card key={edu.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{edu.institution}</CardTitle>
                  <CardDescription>
                    {EDUCATION_LEVELS.find(l => l.value === edu.level)?.label} &middot; {edu.degree}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(edu)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>Permanent action. This delete cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(edu.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {edu.start_year} - {edu.end_year || 'Present'}
                <span className="mx-2">&middot;</span>
                Grade: {edu.grade}
              </p>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No education added</h3>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
