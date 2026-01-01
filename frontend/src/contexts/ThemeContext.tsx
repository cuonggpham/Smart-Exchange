import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sử dụng AuthContext làm nguồn dữ liệu chính cho theme
  // AuthContext đã tự động set data-theme attribute trong applyVisualSettings
  const { settings, updateSettings } = useAuth();
  const theme = settings.theme;

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    try {
      await updateSettings({ theme: newTheme });
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await updateSettings({ theme: newTheme });
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook để dùng trong các component khác
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};