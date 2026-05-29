"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { candidateApi } from '@/apis/user';
import { basicInfoSchema } from '@/lib/schemas';
import type { Candidate } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, X, Camera } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
  data: Candidate;
  onSave: (data: Candidate) => void;
}

interface CityLocation {
  id: number;
  city: string;
  state: string;
  country: string;
  label: string;
}

const getCleanData = (data: any, total_experience_months: number) => {
  const payload: any = {
    full_name: data.full_name,
    primary_email: data.primary_email,
    primary_phone: data.primary_phone,
    about: data.about || '',
    current_designation: data.current_designation,
    total_experience_months,
    is_fresher: data.is_fresher ?? false,
    current_salary_lpa: data.current_salary_amount || null,
    expected_salary_lpa: data.expected_salary_amount || null,
    notice_period_days: data.notice_period_days,
  };
  if (data.location_id) {
    payload.location_id = data.location_id;
  }
  return payload;
};

export default function BasicInfoForm({ data, onSave }: BasicInfoFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [locations, setLocations] = useState<CityLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationSearch, setLocationSearch] = useState(data.city ? [data.city, data.state, data.country].filter(Boolean).join(', ') : '');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>((data as any).location ?? data.location_id ?? undefined);
  const [locationSelected, setLocationSelected] = useState(!!((data as any).location ?? data.location_id));

  // Profile Picture State
  let initialProfilePic = data.profile_picture || null;
  if (initialProfilePic && initialProfilePic.startsWith('/')) {
    initialProfilePic = `http://localhost:8000${initialProfilePic}`;
  }
  const [profilePic, setProfilePic] = useState<string | null>(initialProfilePic);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSaveRef = useRef(onSave);
  const dataRef = useRef(data);
  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setIsCropperOpen(false);
    setIsUploadingPic(true);
    try {
      const res = await candidateApi.uploadProfilePicture(croppedFile);
      let newPic = res.data?.profile_picture || URL.createObjectURL(croppedFile);
      if (newPic && newPic.startsWith('/')) {
        newPic = `http://localhost:8000${newPic}`;
      }
      setProfilePic(newPic);
      toast({ title: "Profile Picture Updated", description: "Your profile picture has been successfully updated." });
    } catch (err) {
      toast({ title: "Upload Failed", description: "Could not upload profile picture.", variant: "destructive" });
    } finally {
      setIsUploadingPic(false);
    }
  };

  useEffect(() => {
    onSaveRef.current = onSave;
    dataRef.current = data;
  }, [onSave, data]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLocations([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search locations with debounce
  useEffect(() => {
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);

    // Don't search if user just selected a location
    if (locationSelected) return;

    locationDebounceRef.current = setTimeout(() => {
      if (!locationSearch.trim()) {
        setLocations([]);
        return;
      }
      setLoadingLocations(true);
      candidateApi.getCities(locationSearch)
        .then(res => setLocations(res?.results ?? res ?? []))
        .catch(() => toast({ title: "Error", description: "Failed to load locations.", variant: "destructive" }))
        .finally(() => setLoadingLocations(false));
    }, 300);

    return () => { if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current); };
  }, [locationSearch, locationSelected, toast]);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      ...data,
      primary_email: data.email || data.primary_email || '',
      primary_phone: data.phone_number || data.primary_phone || '',
      about: data.about || '',
      current_salary_amount: data.current_salary_lpa || data.current_salary_amount || undefined,
      expected_salary_amount: data.expected_salary_lpa || data.expected_salary_amount || undefined,
      location_text: data.city ? [data.city, data.state, data.country].filter(Boolean).join(', ') : '',
      experience_years: data.total_experience_years || (data.total_experience_months ? Math.floor(data.total_experience_months / 12) : 0),
      experience_months: data.total_experience_months ? data.total_experience_months % 12 : 0,
      salary_period: data.salary_period || 'YEAR',
      is_fresher: data.is_fresher ?? false,
    },
  });

  const onSubmit = async (values: BasicInfoFormData) => {
    const { experience_years, experience_months, is_fresher, ...rest } = values;
    const total_experience_months = is_fresher ? 0 : (Number(experience_years) || 0) * 12 + (Number(experience_months) || 0);
    const submitData: Candidate = {
      ...dataRef.current,
      ...rest,
      is_fresher,
      total_experience_months,
      location_id: selectedLocationId ?? null,
      total_experience_years: Math.floor(total_experience_months / 12),
    };
    const cleanData: Record<string, unknown> = getCleanData(submitData, total_experience_months);

    const getChangedFields = (
      cleaned: Record<string, unknown>,
      original: Candidate
    ): Record<string, unknown> => {
      const changes: Record<string, unknown> = {};
      const normalize = (val: unknown): unknown => {
        if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) {
          return null;
        }
        return val;
      };

      const compare = (a: unknown, b: unknown) => normalize(a) !== normalize(b);

      if (compare(cleaned.full_name, original.full_name)) {
        changes.full_name = cleaned.full_name;
      }
      
      const origEmail = original.email || original.primary_email || '';
      if (compare(cleaned.primary_email, origEmail)) {
        changes.primary_email = cleaned.primary_email;
      }
      
      const origPhone = original.phone_number || original.primary_phone || '';
      if (compare(cleaned.primary_phone, origPhone)) {
        changes.phone_number = cleaned.primary_phone;
      }
      
      if (compare(cleaned.about, original.about)) {
        changes.about = cleaned.about;
      }
      
      if (compare(cleaned.current_designation, original.current_designation)) {
        changes.current_designation = cleaned.current_designation;
      }
      
      if (compare(cleaned.total_experience_months, original.total_experience_months)) {
        changes.total_experience_months = cleaned.total_experience_months;
      }

      if (compare(cleaned.is_fresher, original.is_fresher)) {
        changes.is_fresher = cleaned.is_fresher;
      }
      
      const origCurrentSalary = (original as any).current_salary_lpa || (original as any).current_salary_amount || null;
      if (compare(cleaned.current_salary_lpa, origCurrentSalary)) {
        changes.current_salary_lpa = cleaned.current_salary_lpa || null;
      }
      
      const origExpectedSalary = (original as any).expected_salary_lpa || (original as any).expected_salary_amount || null;
      if (compare(cleaned.expected_salary_lpa, origExpectedSalary)) {
        changes.expected_salary_lpa = cleaned.expected_salary_lpa || null;
      }
      
      if (compare(cleaned.notice_period_days, original.notice_period_days)) {
        changes.notice_period_days = cleaned.notice_period_days;
      }
      
      if (compare(cleaned.location_id, original.location_id)) {
        changes.location_id = cleaned.location_id || null;
      }
      
      return changes;
    };

    const changedFields = getChangedFields(cleanData, dataRef.current);

    try {
      setIsSaving(true);
      onSaveRef.current(submitData);
      
      if (Object.keys(changedFields).length > 0) {
        await candidateApi.updateProfile(changedFields);
      } else {
      }
      
      toast({ title: "Saved!", description: "Your basic information has been updated.", variant: "default" });
    } catch {
      toast({ title: "Save Failed", description: "Could not update profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title="Basic Information"
      description="Tell us who you are. This information will be visible to recruiters."
    >
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageSrc={imageSrc}
        onCropComplete={handleCropComplete}
      />
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            {isSaving && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/70 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Saving your information…</p>
              </div>
            )}

            <fieldset disabled={isSaving} className="border-none p-0 m-0">
              
              {/* Avatar Upload Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                <div 
                  className="relative group cursor-pointer shrink-0" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-slate-400">
                        {data.full_name ? data.full_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                    {isUploadingPic && (
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                         <Loader2 className="w-6 h-6 animate-spin text-white" />
                       </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-background shadow-sm transition-transform group-hover:scale-110">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-center sm:text-left mt-2 sm:mt-0">
                  <h3 className="font-semibold text-foreground">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    A professional photo helps recruiters recognize you. Upload a clear, square image.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="primary_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="e.g., jane@email.com" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="primary_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 9876543210"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative" ref={dropdownRef}>
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            placeholder="Type to search city..."
                            {...field}
                            value={locationSearch}
                            className="pl-9 pr-8"
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocationSearch(val);
                              setLocationSelected(false);
                              field.onChange(val);
                              if (!val) setSelectedLocationId(undefined);
                            }}
                            disabled={loadingLocations}
                          />
                          {/* Clear button */}
                          {locationSearch && (
                            <button
                              type="button"
                              onClick={() => {
                                setLocationSearch('');
                                setSelectedLocationId(undefined);
                                setLocationSelected(false);
                                setLocations([]);
                                field.onChange('');
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {loadingLocations && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {/* Dropdown */}
                          {locations.length > 0 && !locationSelected && (
                            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
                              {locations.map((loc) => (
                                <div
                                  key={loc.id}
                                  className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                  onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                                  onClick={() => {
                                    setSelectedLocationId(loc.id);
                                    setLocationSearch(loc.label);
                                    setLocationSelected(true);
                                    field.onChange(loc.label);
                                    setLocations([]);
                                  }}
                                >
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  {loc.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Profile Summary */}
                <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a brief summary about yourself, your skills, and career goals. This will be visible to recruiters."
                          rows={4}
                          className="resize-none"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                {/* Work Status — Fresher / Experienced */}
                <div className="md:col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <FormField
                    control={form.control}
                    name="is_fresher"
                    render={({ field }) => {
                      const isFresher = field.value;
                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">Work Status</FormLabel>
                          <p className="text-xs text-slate-500 mt-0.5 mb-3">We will personalise your experience based on this</p>
                          <div className="flex gap-6">
                            <label className={`flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-lg border-2 transition-colors ${
                              isFresher ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'
                            }`}>
                              <input
                                type="radio"
                                checked={isFresher}
                                onChange={() => field.onChange(true)}
                                className="accent-indigo-600 w-4 h-4"
                              />
                              <span className="text-sm font-semibold">Fresher</span>
                            </label>
                            <label className={`flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-lg border-2 transition-colors ${
                              !isFresher ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'
                            }`}>
                              <input
                                type="radio"
                                checked={!isFresher}
                                onChange={() => field.onChange(false)}
                                className="accent-indigo-600 w-4 h-4"
                              />
                              <span className="text-sm font-semibold">Experienced</span>
                            </label>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* Experience-only fields — hidden when Fresher */}
                {!form.watch('is_fresher') && (
                  <>
                    {/* Current Designation */}
                    <FormField
                      control={form.control}
                      name="current_designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Designation</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Lead Developer" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Total Experience */}
                    <FormItem>
                      <FormLabel>Total Experience</FormLabel>
                      <div className="flex gap-3">
                        <FormField
                          control={form.control}
                          name="experience_years"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">yrs</span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="experience_months"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={11}
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">mo</span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </FormItem>

                    {/* Salary */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="current_salary_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Salary <span className="text-muted-foreground font-normal text-xs">(LPA)</span></FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="e.g., 4.5"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expected_salary_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Salary <span className="text-muted-foreground font-normal text-xs">(LPA)</span></FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="e.g., 8.0"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Notice Period — salary_period hidden, always YEAR */}
                <FormField
                  control={form.control}
                  name="salary_period"
                  render={({ field }) => (
                    <input type="hidden" {...field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="notice_period_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Period</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={String(field.value ?? '')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select notice period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[0, 15, 30, 60, 90].map(days => (
                            <SelectItem key={days} value={String(days)}>
                              {days === 0 ? "Immediate Joiner" : `${days} days`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </fieldset>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving} className="min-w-[120px]">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </SectionCard>
  );
}