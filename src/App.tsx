/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './Store';
import { Layout } from './components/Layout';
import { LandingScreen } from './screens/LandingScreen';
import { CategoryScreen } from './screens/CategoryScreen';
import { DeviceTypeScreen } from './screens/DeviceTypeScreen';
import { BrandScreen } from './screens/BrandScreen';
import { ModelScreen } from './screens/ModelScreen';
import { VariantScreen } from './screens/VariantScreen';
import { QueueScreen } from './screens/QueueScreen';
import { ExportScreen } from './screens/ExportScreen';
import { AdminScreen } from './screens/AdminScreen';
import { loadLiveCatalog, modelFamilies, variants } from './data';
import { AppUpdater } from './AppUpdater';

// How often an open page re-checks the database for newly added products.
const CATALOG_REFRESH_MS = 30000;

// Cheap fingerprint of what vendors can see, so the page only re-renders
// when a product, colour, storage option, photo or New Launch flag changed.
const catalogSignature = (): string =>
  JSON.stringify([
    modelFamilies.map(f => [f.id, f.isNew]),
    variants.map(v => [v.id, v.thumbnailUrl, v.storageOptions]),
  ]);

// `catalogVersion` is not read here: it only forces this tree to re-render
// after the catalog arrays are refreshed in place.
const Router = ({ catalogVersion: _catalogVersion }: { catalogVersion: number }) => {
  const { currentView } = useStore();

  const renderView = () => {
    switch (currentView) {
      case 'landing': return <LandingScreen />;
      case 'category': return <CategoryScreen />;
      case 'device-type': return <DeviceTypeScreen />;
      case 'brand': return <BrandScreen />;
      case 'model': return <ModelScreen />;
      case 'variant': return <VariantScreen />;
      case 'queue': return <QueueScreen />;
      case 'export': return <ExportScreen />;
      case 'admin': return <AdminScreen />;
      default: return <LandingScreen />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
};

export default function App() {
  // Load the live sandbox catalog once before rendering, so every screen
  // downstream sees real (sandbox) data instead of the static sample set.
  const [catalogReady, setCatalogReady] = useState(false);

  const [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    loadLiveCatalog().finally(() => setCatalogReady(true));
  }, []);

  // Keep the catalog fresh without vendors having to reload: re-fetch while
  // the tab is visible, when it regains focus, and on a timer. A failed fetch
  // leaves the current data untouched.
  useEffect(() => {
    if (!catalogReady) return;
    let busy = false;
    let lastSignature = catalogSignature();

    const refresh = async () => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      try {
        if (await loadLiveCatalog()) {
          const next = catalogSignature();
          if (next !== lastSignature) {
            lastSignature = next;
            setCatalogVersion(v => v + 1);
          }
        }
      } finally {
        busy = false;
      }
    };

    const timer = window.setInterval(refresh, CATALOG_REFRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [catalogReady]);

  if (!catalogReady) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        color: '#9ca3af',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.02em'
      }}>
        Loading sandbox catalog…
      </div>
    );
  }

  return (
    <StoreProvider>
      <AppUpdater />
      <Router catalogVersion={catalogVersion} />
    </StoreProvider>
  );
}
