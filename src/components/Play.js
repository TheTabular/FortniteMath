import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Play.css';

const characters = [
  '/images/Swamp Stalker.png',
  '/images/Peely.png',
  '/images/Cuddle Team Leader.png',
  '/images/Durr Burger.png',
];

const getRandomCharacters = (count) => {
  const shuffledCharacters = [...characters];
  for (let i = shuffledCharacters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCharacters[i], shuffledCharacters[j]] = [shuffledCharacters[j], shuffledCharacters[i]];
  }
  return shuffledCharacters.slice(0, count);
};

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

const Play = () => {
  const [scenarioData, setScenarioData] = useState(null);
  const [numPlayers, setNumPlayers] = useState(null);
  const [randomCharacters, setRandomCharacters] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const fetchScenarioData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/scenario?num_players=${numPlayers}`);
        const { players, player_items } = response.data;
        setScenarioData({ players, player_items });
        setRandomCharacters(getRandomCharacters(numPlayers));
      } catch (error) {
        console.error('Error fetching scenario data:', error);
      }
    };

    if (numPlayers) {
      fetchScenarioData();
    }
  }, [numPlayers]);

  const handleNumPlayersChange = (num) => {
    setNumPlayers(num);
    setShowOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
  };

  const renderInventorySlots = (items) => {
    const slots = [];
    for (let i = 0; i < 6; i++) {
      if (i === 0) {
        slots.push(<div key={i} className="inventory-slot empty"></div>);
      } else {
        const item = Object.entries(items)[i - 1];
        if (item) {
          const [itemName, details] = item;
          slots.push(
            <div
              key={i}
              className="inventory-slot"
              style={{
                '--rarity-color': `${getRarityColor(details.rarity)}`,
              }}
            >
              <img src={`/images/${itemName}.png`} alt={itemName} className="inventory-item" />
              <span className="quantity">{details.quantity}</span>
            </div>
          );
        } else {
          slots.push(<div key={i} className="inventory-slot empty"></div>);
        }
      }
    }
    return slots;
  };

  return (
    <div className="play-container">
      <div className="button-container">
        <ul className="button-list">
          <li className="button-item">
            <button className="button-link" onClick={() => handleNumPlayersChange(1)}>Solo</button>
          </li>
          <li className="button-item">
            <button className="button-link" onClick={() => handleNumPlayersChange(2)}>Duos</button>
          </li>
          <li className="button-item">
            <button className="button-link" onClick={() => handleNumPlayersChange(3)}>Trios</button>
          </li>
          <li className="button-item">
            <button className="button-link" onClick={() => handleNumPlayersChange(4)}>Squads</button>
          </li>
        </ul>
      </div>
      {showOverlay && (
        <div className="overlay">
          <div className="close-button" onClick={handleCloseOverlay}></div>
          <div className="external-screen">
            {scenarioData && (
              <div className={`scenario-container grid-${numPlayers}`}>
                {scenarioData.players.map((player, index) => (
                  <div key={index} className="player-container">
                    <div className="content">
                      <img src={randomCharacters[index]} alt={`Character ${index + 1}`} className="character-image" />
                      <div className="health-shield-container">
                        <div className="shield-container">
                          <img src="/images/Shield.png" alt="Shield Icon" className="shield-icon" />
                          <div className="bar-container shield-bar-container">
                            <div className="bar-background"></div>
                            <div className="shield-bar" style={{ width: `${player.shield}%` }}></div>
                            <span className="shield-value">{player.shield}</span>
                          </div>
                        </div>
                        <div className="health-container">
                          <img src="/images/Plus.png" alt="Health Icon" className="health-icon" />
                          <div className="bar-container health-bar-container">
                            <div className="bar-background"></div>
                            <div className="health-bar" style={{ width: `${player.health}%` }}></div>
                            <span className="health-value">{player.health}</span>
                          </div>
                        </div>
                      </div>
                      <div className="inventory">
                        {renderInventorySlots(scenarioData.player_items[index])}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Play;