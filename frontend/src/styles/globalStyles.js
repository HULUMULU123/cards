import { createGlobalStyle } from "styled-components";
import Montseratt from "../assets/fonts/Montseratt.ttf";

export  const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'Montseratt';
    src: url(${Montseratt}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  body {
    font-family: 'Montseratt', sans-serif;
  }
`;
