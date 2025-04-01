
import { english } from './english';
import swedish from './swedish';
import chinese from './chinese';
import spanish from './spanish';
import german from './german';
import russian from './russian';

export type TranslationKey = keyof typeof english;

const translations = {
  english,
  swedish,
  chinese,
  spanish,
  german,
  russian
};

export default translations;
