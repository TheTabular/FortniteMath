import React, { useEffect, useState } from 'react';
import '../styles/Play.css';

const Play = () => {
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/scenario?num_players=4');
        if (!response.ok) {
          throw new Error('Failed to fetch game data');
        }
        const data = await response.json();
        setGameData(data);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchGameData();
  }, []);

  const renderPlayer = (player, index) => {
    const playerImages = [
      '/images/Swamp Stalker.png',
      '/images/Peely.png',
      '/images/Cuddle Team Leader.png',
      '/images/Durr Burger.png',
    ];
    const playerImage = playerImages[index];
    const playerItems = gameData.player_items[index];
    const inventorySlots = Array(4).fill(null);

    Object.entries(playerItems).forEach(([itemName, itemData], itemIndex) => {
      inventorySlots[itemIndex] = { itemName, itemData };
    });

    return (
      <div className="player" key={index}>
        <img src={playerImage} alt={`Player ${index + 1}`} className="player-image" />
        <div className="inventory">
          {inventorySlots.map((slot, slotIndex) => (
            <div
              key={slotIndex}
              className={`inventory-slot ${slot ? `rarity-${slot.itemData.rarity.toLowerCase()}` : 'empty'}`}
            >
              {slot && (
                <>
                  <img src={slot.itemData.image} alt={slot.itemName} className="inventory-item" />
                  <span className="quantity">{slot.itemData.quantity}</span>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="health-bar">
          <div className="health-bar-fill" style={{ width: `${player.health}%` }}></div>
          <span className="health-value">{player.health}</span>
          <img src="/images/health-icon.png" alt="Health" className="health-icon" />
        </div>
        <div className="shield-bar">
          <div className="shield-bar-fill" style={{ width: `${player.shield}%` }}></div>
          <span className="shield-value">{player.shield}</span>
          <img src="/images/shield-icon.png" alt="Shield" className="shield-icon" />
        </div>
      </div>
    );
  };

  return (
    <div className="play-container">
      {gameData ? (
        <div className="player-grid">
          {gameData.players.map((player, index) => renderPlayer(player, index))}
        </div>
      ) : (
        <div>Loading game data...</div>
      )}
    </div>
  );
};

export default Play;