"use client";

import React, { useState, useRef } from 'react';
import { Award, Plus, Pencil, Trash2, ExternalLink, Loader2, Calendar, X } from 'lucide-react';
import { certificationApi } from '@/apis/user';
import type { Certification } from '@/lib/types';
import { SectionCard } from './SectionCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

const MONTHS = [
  { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

interface CertificationFormData {
  name: string;
  issuing_organization: string;
  completion_id: string;
  url: string;
  valid_from_month: number | null;
  valid_from_year: number | null;
  valid_to_month: number | null;
  valid_to_year: number | null;
  does_not_expire: boolean;
}

const emptyForm: CertificationFormData = {
  name: '', issuing_organization: '', completion_id: '', url: '',
  valid_from_month: null, valid_from_year: null,
  valid_to_month: null, valid_to_year: null,
  does_not_expire: false,
};

interface Props {
  certifications: Certification[];
  onUpdate: () => void;
}

export default function CertificationSection({ certifications, onUpdate }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CertificationFormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (cert: Certification) => {
    setForm({
      name: cert.name,
      issuing_organization: cert.issuing_organization,
      completion_id: cert.completion_id || '',
      url: cert.url || '',
      valid_from_month: cert.valid_from_month ?? null,
      valid_from_year: cert.valid_from_year ?? null,
      valid_to_month: cert.valid_to_month ?? null,
      valid_to_year: cert.valid_to_year ?? null,
      does_not_expire: cert.does_not_expire || false,
    });
    setEditingId(cert.id);
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Certification name is required');
      return;
    }
    if (!form.issuing_organization.trim()) {
      setError('Issuing organization is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        name: form.name.trim(),
        issuing_organization: form.issuing_organization.trim(),
      };
      if (form.completion_id) payload.completion_id = form.completion_id;
      if (form.url) payload.url = form.url;
      if (form.valid_from_month) payload.valid_from_month = form.valid_from_month;
      if (form.valid_from_year) payload.valid_from_year = form.valid_from_year;
      payload.does_not_expire = form.does_not_expire;
      if (!form.does_not_expire) {
        if (form.valid_to_month) payload.valid_to_month = form.valid_to_month;
        if (form.valid_to_year) payload.valid_to_year = form.valid_to_year;
      }

      if (editingId) {
        await certificationApi.updateCertification(editingId, payload);
      } else {
        await certificationApi.createCertification(payload);
      }
      setShowModal(false);
      onUpdate();
    } catch (err: any) {
      const msg = err?.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    setDeletingId(id);
    try {
      await certificationApi.deleteCertification(id);
      onUpdate();
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  const formatMonth = (m?: number | null) => m ? MONTHS.find(x => x.value === m)?.label || '' : '';

  return (
    <SectionCard
      title="Certifications"
      description="Add details of Certifications you have achieved/completed."
      badge={certifications.length.toString()}
      actions={
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Certification
        </Button>
      }
    >
      <div className="space-y-4">

      {/* Certification Cards */}
      {certifications.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <Award className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-sm font-semibold text-gray-900">No certifications added yet</h3>
          <p className="text-xs text-muted-foreground mt-1">Add your certifications to stand out</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map(cert => (
            <Card key={cert.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                    <CardDescription>
                      Issued by: {cert.issuing_organization}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cert)}>
                      <Pencil className="h-4 w-4" />
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
                          <AlertDialogAction onClick={() => {
                            setDeletingId(cert.id);
                            certificationApi.deleteCertification(cert.id).then(onUpdate).catch(()=>{}).finally(()=>setDeletingId(null));
                          }}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {cert.completion_id && <span>ID: {cert.completion_id}</span>}
                  {cert.completion_id && cert.valid_from_year && <span className="mx-1">&middot;</span>}
                  {cert.valid_from_year && (
                    <span>
                      {formatMonth(cert.valid_from_month)} {cert.valid_from_year}
                      {cert.does_not_expire
                        ? ' — No Expiry'
                        : cert.valid_to_year
                          ? ` — ${formatMonth(cert.valid_to_month)} ${cert.valid_to_year}`
                          : ''}
                    </span>
                  )}
                  {cert.url && (
                    <>
                      <span className="mx-1">&middot;</span>
                      <a href={cert.url} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                         View Certificate <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                <p className="text-xs text-gray-400 mt-0.5">Add details of Certifications you have achieved/completed</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
              )}

              {/* Certification Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">Certification name <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Please enter your certification name"
                  className="mt-1.5 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                />
              </div>

              {/* Issuing Organization */}
              <div>
                <label className="text-sm font-medium text-gray-700">Issued by <span className="text-red-500">*</span></label>
                <input
                  value={form.issuing_organization}
                  onChange={e => setForm(f => ({ ...f, issuing_organization: e.target.value }))}
                  placeholder="e.g., Coursera, AWS, Microsoft"
                  className="mt-1.5 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                />
              </div>

              {/* Completion ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">Certification completion ID</label>
                <input
                  value={form.completion_id}
                  onChange={e => setForm(f => ({ ...f, completion_id: e.target.value }))}
                  placeholder="Please mention your course completion ID"
                  className="mt-1.5 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                />
              </div>

              {/* URL */}
              <div>
                <label className="text-sm font-medium text-gray-700">Certification URL</label>
                <input
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="Please mention your completion URL"
                  className="mt-1.5 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                />
              </div>

              {/* Validity Dates */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Certification validity</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <select value={form.valid_from_month ?? ''} onChange={e => setForm(f => ({ ...f, valid_from_month: e.target.value ? Number(e.target.value) : null }))}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none min-w-[90px]">
                    <option value="">MM</option>
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select value={form.valid_from_year ?? ''} onChange={e => setForm(f => ({ ...f, valid_from_year: e.target.value ? Number(e.target.value) : null }))}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none min-w-[100px]">
                    <option value="">YYYY</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span className="text-sm text-gray-400 font-medium">To</span>
                  <select value={form.valid_to_month ?? ''} onChange={e => setForm(f => ({ ...f, valid_to_month: e.target.value ? Number(e.target.value) : null }))}
                    disabled={form.does_not_expire}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none min-w-[90px] disabled:opacity-50 disabled:bg-gray-50">
                    <option value="">MM</option>
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select value={form.valid_to_year ?? ''} onChange={e => setForm(f => ({ ...f, valid_to_year: e.target.value ? Number(e.target.value) : null }))}
                    disabled={form.does_not_expire}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none min-w-[100px] disabled:opacity-50 disabled:bg-gray-50">
                    <option value="">YYYY</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Does not expire */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.does_not_expire}
                  onChange={e => setForm(f => ({ ...f, does_not_expire: e.target.checked, valid_to_month: null, valid_to_year: null }))}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">This certification does not expire</span>
              </label>
            </div>



            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </SectionCard>
  );
}
