import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
    sidebarCollapsed: boolean;
    notificationCount: number;
    toggleSidebar: () => void;
    setNotificationCount: (count: number) => void;
}

export const useUIStore = create<UIStore>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            notificationCount: 0,
            toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
            setNotificationCount: (count) => set({ notificationCount: count }),
        }),
        { name: 'employer-ui' }
    )
);
