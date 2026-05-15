/**
 * i18n Configuration for vSphere Capacity Manager Console Plugin
 *
 * This file sets up internationalization using react-i18next.
 * The OpenShift Console provides i18n context, but we configure
 * our plugin namespace here.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from '../locales/en/plugin__vsphere-capacity-manager.json';

export const NAMESPACE = 'plugin__vsphere-capacity-manager';

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        [NAMESPACE]: enTranslations,
      },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    defaultNS: NAMESPACE,
    ns: [NAMESPACE],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
