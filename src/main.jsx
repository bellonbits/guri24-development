import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import i18n from './i18n/i18n'
import { I18nextProvider } from 'react-i18next'
import { CompareProvider } from './context/CompareContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <CompareProvider>
        <App />
      </CompareProvider>
    </I18nextProvider>
  </StrictMode>,
)
