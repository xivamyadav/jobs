"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Award, Plus, Loader2 } from 'lucide-react';
import CertificationSection from '@/components/profile/CertificationSection';
import { certificationApi } from '@/apis/user';
import type { Certification } from '@/lib/types';

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertifications = useCallback(async () => {
    try {
      const res = await certificationApi.getCertifications();
      const data = Array.isArray(res) ? res : res?.results ?? [];
      setCertifications(data);
    } catch {
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCertifications(); }, [fetchCertifications]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              My Certifications
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your professional certifications and courses</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        ) : (
          <CertificationSection certifications={certifications} onUpdate={fetchCertifications} />
        )}
      </div>
    </div>
  );
}
