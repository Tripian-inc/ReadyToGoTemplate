// We need to tell TypeScript that when we write "import styles from './styles.scss' we mean to load a module (to look for a './styles.scss.d.ts').
// declare module '*.css';
declare module "*.scss";
/* declare module "*.scss" {
  interface IClasses {
    [classes: string]: string;
  }
  const classes: IClasses;
  export = classes;
} */

declare module "adyen-cse-js";
