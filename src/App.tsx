/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './Store';
import { Layout } from './components/Layout';
import { LandingScreen } from './screens/LandingScreen';
import { CategoryScreen } from './screens/CategoryScreen';
import { ConditionScreen } from './screens/ConditionScreen';
import { DeviceTypeScreen } from './screens/DeviceTypeScreen';
import { BrandScreen } from './screens/BrandScreen';
import { ModelScreen } from './screens/ModelScreen';
import { VariantScreen } from './screens/VariantScreen';
import { QueueScreen } from './screens/QueueScreen';
import { ExportScreen } from './screens/ExportScreen';
import { AdminScreen } from './screens/AdminScreen';
import { loadLiveCatalog } from './data';

const Router = () => {
  const { currentView } = useStore();

  const renderView = () => {
    switch (currentView) {
      case 'landing': return <LandingScreen />;
      case 'category': return <CategoryScreen />;
      case 'condition': return <ConditionScreen />;
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

  useEffect(() => {
    loadLiveCatalog().finally(() => setCatalogReady(true));
  }, []);

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
      <Router />
    </StoreProvider>
  );
}
