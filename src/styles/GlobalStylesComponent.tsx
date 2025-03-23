import React from 'react';
import { createGlobalStyle } from 'styled-components';
import globalStyles from './GlobalStyles';

const GlobalStylesComponent = createGlobalStyle`${globalStyles}`;

export default GlobalStylesComponent; 