import { DefaultTheme } from 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }
}

export const theme: DefaultTheme = {
  colors: {
    primary: '#1e3c72',
    secondary: '#2a5298',
    accent: '#e74c3c',
  },
}; 