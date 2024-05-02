// src/components/HealingConsumablesTable.jsx
import React, { useEffect, useState } from 'react';
import '../styles/HealingConsumablesTable.css';

const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'COMMON':
      return '#9da3a7';
    case 'UNCOMMON':
      return '#61bf00';
    case 'RARE':
      return '#00afff';
    case 'EPIC':
      return '#ce59ff';
    case 'LEGENDARY':
      return '#de6e0e';
    case 'MYTHIC':
      return '#fff0a6';
    default:
      return '#ffffff';
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'Health Only Healing':
      return '#61c33d';
    case 'Shield Only Healing':
      return '#4593f0';
    case 'Effective Health Healing':
      return '#9da3a7';
    default:
      return '#ffffff';
  }
};

const HealingConsumablesTable = ({ data }) => {
  const [isRowMode, setIsRowMode] = useState(window.innerWidth > 1050);

  useEffect(() => {
    const handleResize = () => {
      setIsRowMode(window.innerWidth > 1050);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="healing-consumables-table">
      <div className="healing-consumables-header">
        <div className="header-cell">Item</div>
        <div className="header-cell">Type</div>
        <div className="header-cell">Rarity</div>
        <div className="header-cell">Max Stack</div>
        <div className="header-cell">Max Health</div>
        <div className="header-cell">Max Shield</div>
        <div className="header-cell">Health Per</div>
        <div className="header-cell">Shield Per</div>
        <div className="header-cell">Time Per</div>
      </div>
      {Object.entries(data).map(([itemName, itemData]) => (
        <div key={itemName} className="healing-consumable-row">
          {isRowMode ? (
            <>
              <div className="consumable-cell item-cell">
                <img src={itemData.icon} alt={itemName} className="consumable-image" />
                <span className="consumable-name">{itemName}</span>
              </div>
              <div className="consumable-cell">
                <span style={{ color: getTypeColor(itemData.type) }}>
                  {itemData.type.replace('Health Only Healing', 'Health Only')
                    .replace('Shield Only Healing', 'Shield Only')
                    .replace('Effective Health Healing', 'Both')}
                </span>
              </div>
              <div className="consumable-cell">
                <span className="consumable-rarity" style={{ backgroundColor: getRarityColor(itemData.rarity) }}>
                  {itemData.rarity}
                </span>
              </div>
              <div className="consumable-cell centered">{itemData.max_stack !== "0" ? itemData.max_stack : "-"}</div>
              <div className="consumable-cell centered">{itemData.max_health !== "0" ? itemData.max_health : "-"}</div>
              <div className="consumable-cell centered">{itemData.max_shield !== "0" ? itemData.max_shield : "-"}</div>
              <div className="consumable-cell centered">{itemData.health_per !== "0" ? itemData.health_per : "-"}</div>
              <div className="consumable-cell centered">{itemData.shield_per !== "0" ? itemData.shield_per : "-"}</div>
              <div className="consumable-cell centered">{itemData.time_per !== "0" ? itemData.time_per : "-"}</div>
            </>
          ) : (
            <>
              <div className="consumable-header">
                <img src={itemData.icon} alt={itemName} className="consumable-image" />
                <div className="consumable-name">{itemName}</div>
              </div>
              <div className="consumable-stats">
                <div className="consumable-stat">
                  <div className="consumable-stat-label">Type</div>
                  <div className="consumable-stat-value" style={{ color: getTypeColor(itemData.type) }}>
                    {itemData.type.replace('Health Only Healing', 'Health Only')
                      .replace('Shield Only Healing', 'Shield Only')
                      .replace('Effective Health Healing', 'Both')}
                  </div>
                </div>
                <div className="consumable-stat">
                  <div className="consumable-stat-label">Rarity</div>
                  <div className="consumable-stat-value">
                    <span className="consumable-rarity" style={{ backgroundColor: getRarityColor(itemData.rarity) }}>
                      {itemData.rarity}
                    </span>
                  </div>
                </div>
                <div className="consumable-stat">
                  <div className="consumable-stat-label">Max Stack</div>
                  <div className="consumable-stat-value">{itemData.max_stack !== "0" ? itemData.max_stack : "-"}</div>
                </div>
                <div className="consumable-stat">
                  <div className="consumable-stat-label">Max Health</div>
                  <div className="consumable-stat-value">{itemData.max_health !== "0" ? itemData.max_health : "-"}</div>
                </div>
                <div className="consumable-stat">
                  <div className="consumable-stat-label">Max Shield</div>
                  <div className="consumable-stat-value">{itemData.max_shield !== "0" ? itemData.max_shield : "-"}</div>
                </div>
                <div className="consumable-stat">
                  <div className="consumable-stat-label">Health Per</div>
                  <div className="consumable-stat-value">{itemData.health_per !== "0" ? itemData.health_per : "-"}</div>
                </div>
                <div className="consumable-stat">
                  <div className="consumable-stat-label">Shield Per</div>
                  <div className="consumable-stat-value">{itemData.shield_per !== "0" ? itemData.shield_per : "-"}</div>
                </div>
                <div className="consumable-stat">
                  <div className="consumable-stat-label">Time Per</div>
                  <div className="consumable-stat-value">{itemData.time_per !== "0" ? itemData.time_per : "-"}</div>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default HealingConsumablesTable;