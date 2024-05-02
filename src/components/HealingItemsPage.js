import React from 'react';
import HealingConsumablesTable from './HealingConsumablesTable';
import healingConsumablesData from '../healing_consumables.json';

const HealingItemsPage = () => {
  return (
    <div className="healing-items-page">
      <main className="app-content">
        <h2 className="page-title">Healing Items</h2>
        <HealingConsumablesTable data={healingConsumablesData} />
      </main>
    </div>
  );
};

export default HealingItemsPage;