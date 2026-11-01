import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import App from './App.jsx'
import './index.css'
import i18n from './i18n/i18n'
import { I18nextProvider } from 'react-i18next'
import { CompareProvider } from './context/CompareContext'

if (Capacitor.isNativePlatform()) {
  SplashScreen.hide().catch(() => {});
}

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <CompareProvider>
        <App />
      </CompareProvider>
    </I18nextProvider>
  </StrictMode>,
);
