import { css } from 'styled-components';

const globalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: 'Press Start 2P', monospace;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #1e3c72;
  }

  #root {
    width: 100%;
    height: 100%;
  }
`;

export default globalStyles; 