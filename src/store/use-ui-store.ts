import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  notifications: { id: string; title: string; message: string; type: 'success' | 'error' | 'info' }[];
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Global UI Store
 * 
 * Handles layout states (sidebar toggles), toast notifications, and themes.
 * Zustand is preferred over React Context here for preventing unnecessary re-renders.
 */
export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  notifications: [],
  addNotification: (message, type = 'info') => set((state) => {
    const id = Math.random().toString(36).substring(2, 9);
    // Auto-remove notification after practical delay
    setTimeout(() => state.removeNotification(id), 4000);
    return { notifications: [...state.notifications, { id, title: type.toUpperCase(), message, type }] };
  }),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),

  isDarkMode: false,
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.isDarkMode;
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: newDarkMode };
  })
}));
