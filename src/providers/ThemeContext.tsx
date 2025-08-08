import React, { createContext, useEffect, useState, useContext } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeContextType = {
  theme: ColorSchemeName;
  toggleTheme: (theme: ColorSchemeName) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ColorSchemeName>('dark');

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });

    return () => listener.remove();
  }, []);

  const toggleTheme = (theme: ColorSchemeName) => {
    
    setTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
