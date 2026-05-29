'use client';

import React from 'react';
import { Sidebar } from '@/components/employer/Sidebar';
import { TopBar } from '@/components/employer/TopBar';

export default function EmployerClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <TopBar title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
