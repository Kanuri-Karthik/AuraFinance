import { useEffect } from 'react';

/**
 * ThemeMorpher: Automatically switches between dawn, light, dark, and midnight 
 * themes based on the local time of day.
 */
const ThemeMorpher = () => {
  useEffect(() => {
    const updateTheme = () => {
      // Force light theme for testing the new layout
      const root = window.document.documentElement;
      root.classList.remove('dawn', 'dark', 'midnight');
      root.classList.add('light'); // Optionally set it to light explicitly
      console.log(`[ThemeMorpher] Fixed active theme to: light`);
    };

    // Run on mount
    updateTheme();

    // No interval needed since it's hardcoded to light mode for now
  }, []);

  return null; // Side-effect only component
};

export default ThemeMorpher;
