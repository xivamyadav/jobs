"use client";

import React, { useState, useEffect } from 'react';
import type { Experience, Location } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, Briefcase, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { SectionCard } from './SectionCard';
import { candidateApi } from '@/apis/user/route';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/api-error';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface ExperienceSectionProps {
  data: Experience[];
  onSave: (data: Experience[]) => void;
}

const experienceSchema = z.object({
  company_name_text: z.string().min(1, 'Company name is required'),
  designation: z.string().min(1, 'Designation is required'),
  employment_type: z.string().min(1, 'Employment type is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  location: z.number().nullable().optional(),
  location_label: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
}).refine(data => !data.is_current ? !!data.end_date : true, {
  message: "End date is required if this is not your current job.",
  path: ["end_date"],
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

const ExperienceForm = ({ experience, onSave, closeDialog }: { experience?: Experience, onSave: (data: any) => void, closeDialog: () => void }) => {
  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: experience ? {
      company_name_text: experience.company_name_text || '',
      designation: experience.designation,
      employment_type: experience.employment_type || '',
      start_date: experience.start_date ? experience.start_date.split('T')[0] : '',
      end_date: experience.end_date ? experience.end_date.split('T')[0] : '',
      is_current: experience.is_current,
      location: typeof experience.location === 'number' ? experience.location : null,
      location_label: experience.location_detail?.label || '',
      description: experience.description || '',
    } : {
      company_name_text: "",
      designation: "",
      employment_type: "",
      start_date: "",
      end_date: "",
      is_current: false,
      location: null,
      location_label: "",
      description: "",
    },
  });

  const isCurrent = form.watch('is_current');

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    if (!locationQuery) {
      setLocations([]);
      return;
    }
    const fetchLocs = async () => {
      setLoadingLocations(true);
      try {
        const res = await candidateApi.searchLocations(locationQuery);
        setLocations(res);
      } catch (e) {
        const msg = getApiErrorMessage(e, 'Unable to load locations. Please try again.');
        toast({ title: 'Location search failed', description: msg, variant: 'destructive' });
      } finally {
        setLoadingLocations(false);
      }
    };
    const timer = setTimeout(fetchLocs, 300);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  const handleSubmit = (values: ExperienceFormData) => {
    const payload: any = {
      company_name_text: values.company_name_text,
      designation: values.designation,
      start_date: values.start_date.split('T')[0], 
      is_current: values.is_current,
    };

    payload.end_date = values.is_current ? null : (values.end_date ? values.end_date.split('T')[0] : null);

    payload.location = values.location ? values.location : null;
    payload.description = values.description?.trim() ? values.description : null;

    if (values.employment_type?.trim()) {
      payload.employment_type = values.employment_type
        .trim()
        .toUpperCase()
        .replace(/-/g, '_')
        .replace(/ /g, '_');
    } else {
      payload.employment_type = null;
    }

    if (experience?.id) {
      payload.id = experience.id;
    }

    onSave(payload);
    closeDialog();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="company_name_text" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl><Input placeholder="e.g., Google" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="designation" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl><Input placeholder="e.g., Software Engineer" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="start_date" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="end_date" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl><Input type="date" disabled={isCurrent} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="employment_type" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <FormControl><Input placeholder="e.g., Full Time" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="location" control={form.control} render={({ field }) => (
            <FormItem className="flex flex-col mt-2 pt-0.5">
              <FormLabel>Location</FormLabel>
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? form.getValues("location_label") || "Selected Location"
                        : "Select location"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search city..." 
                      value={locationQuery} 
                      onValueChange={setLocationQuery} 
                    />
                    <CommandList>
                      {loadingLocations && <div className="p-4 text-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Loading...</div>}
                      {!loadingLocations && locations.length === 0 && <CommandEmpty>No location found.</CommandEmpty>}
                      <CommandGroup>
                        {locations.map((loc) => (
                          <CommandItem
                            key={loc.id}
                            value={loc.label}
                            onSelect={() => {
                              form.setValue("location", loc.id);
                              form.setValue("location_label", loc.label || "");
                              setLocationOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                loc.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {loc.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField name="is_current" control={form.control} render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>I am currently working here</FormLabel>
            </div>
          </FormItem>
        )} />
        <FormField name="description" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Describe your role and accomplishments" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="submit">Save Experience</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function ExperienceSection({ data, onSave }: ExperienceSectionProps) {
  const [open, setOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | undefined>();
  const { toast } = useToast();

  const handleSave = async (payloadData: any) => {
    try {
      let saved: Experience;
      if (payloadData.id) {
        const response = await candidateApi.updateExperience(payloadData.id, payloadData);
        saved = response?.data ?? response;
        onSave(data.map(e => e.id === payloadData.id ? saved : e));
      } else {
        const response = await candidateApi.createExperience(payloadData);
        saved = response?.data ?? response;
        onSave([...data, saved]);
      }
      toast({ title: "Experience Saved Successfully!" });
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to save experience. Please try again.');
      toast({ title: "Failed to save experience", description: msg, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await candidateApi.deleteExperience(id);
      onSave(data.filter(e => e.id !== id));
      toast({ title: "Experience Deleted", variant: "destructive" });
    } catch (error) {
      toast({ title: "Failed to delete experience", variant: "destructive" });
    }
  };

  const openDialog = (exp?: Experience) => {
    setEditingExperience(exp);
    setOpen(true);
  }

  return (
    <SectionCard
      title="Work Experience"
      description="Showcase your professional journey."
      actions={
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Experience
        </Button>
      }
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingExperience ? 'Edit' : 'Add'} Experience</DialogTitle>
          </DialogHeader>
          <ExperienceForm
            experience={editingExperience}
            onSave={handleSave}
            closeDialog={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <div className="space-y-4">
        {data.length > 0 ? data.sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
          return dateB - dateA;
        }).map(exp => (
          <Card key={exp.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{exp.designation}</CardTitle>
                  <CardDescription>{exp.company_name_text} &middot; {exp.employment_type?.replace(/_/g, ' ')}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(exp)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this experience entry.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(exp.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {exp.start_date ? format(new Date(exp.start_date), 'MMM yyyy') : 'Date not set'} - {exp.is_current ? 'Present' : exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'N/A'}
                <span className="mx-2">&middot;</span>
                {exp.location_detail?.label || exp.location || 'Location not set'}
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{exp.description}</p>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No experience added</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your work experience.</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
