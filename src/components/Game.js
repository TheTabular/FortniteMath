import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/Game.css';
import healingConsumables from '../healing_consumables.json';

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

const characters = [
 'Swamp Stalker',
 'Peely',
 'Cuddle Team Leader',
 'Durr Burger',
];

const getRandomCharacters = (count) => {
 const shuffledCharacters = [...characters];
 for (let i = shuffledCharacters.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [shuffledCharacters[i], shuffledCharacters[j]] = [shuffledCharacters[j], shuffledCharacters[i]];
 }
 return shuffledCharacters.slice(0, count);
};

const Game = () => {
 const [gameData, setGameData] = useState(null);
 const [randomCharacters, setRandomCharacters] = useState([]);
 const [selectedItem, setSelectedItem] = useState(null);
 const [characterInventories, setCharacterInventories] = useState({});
 const countdownRefs = useRef({});
 const [time, setTime] = useState(0);
 const [isRunning, setIsRunning] = useState(false);
 const [initialCharacterData, setInitialCharacterData] = useState([]);
 const [initialInventorySaved, setInitialInventorySaved] = useState(null);

 useEffect(() => {
    let interval = null;
  
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }
  
    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor((time % 60000) / 1000)
      .toString()
      .padStart(2, '0');
    const milliseconds = Math.floor((time % 1000) / 10)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  const startGame = (numPlayers) => {
    axios
      .get(`https://api.fortnitemath.com/game?num_players=${numPlayers}`)
      .then((response) => {
        const initialInventory = { ...response.data.inventory };
        const initialInventoryCopy = JSON.parse(JSON.stringify(initialInventory));
        setGameData(response.data);
        setInitialCharacterData(response.data.players.map(player => ({
          health: player.health,
          shield: player.shield,
        })));
        setInitialInventorySaved(initialInventoryCopy);
        setRandomCharacters(getRandomCharacters(response.data.players.length));
        setCharacterInventories(
          response.data.players.reduce((acc, _, index) => {
            acc[index] = {};
            return acc;
          }, {})
        );
        setIsRunning(true);
        setTime(0);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

 const handleItemClick = (itemName) => {
   setSelectedItem(itemName === selectedItem ? null : itemName);
 };

 const handleCharacterClick = (characterIndex) => {
    if (selectedItem && gameData.inventory[selectedItem].quantity > 0) {
      const item = healingConsumables[selectedItem] || gameData.inventory[selectedItem];
      const newItemQuantity = gameData.inventory[selectedItem].quantity - 1;
      const updatedPlayers = [...gameData.players];
      const player = updatedPlayers[characterIndex];
      const existingCountdown = Object.values(characterInventories[characterIndex] || {}).some(
        (item) => item && item.countdown
      );
  
      if (existingCountdown) {
        return;
      }
  
      let healthIncrease = 0;
      let shieldIncrease = 0;
      let canBeUsed = false;
  
      if (item.type === 'Health Only Healing') {
        const maxHealth = parseInt(item.max_health);
        if (player.health < maxHealth) {
          healthIncrease = Math.min(parseInt(item.health_per), maxHealth - player.health);
          canBeUsed = healthIncrease > 0;
        }
      } else if (item.type === 'Shield Only Healing') {
        const maxShield = parseInt(item.max_shield);
        if (player.shield < maxShield) {
          shieldIncrease = Math.min(parseInt(item.shield_per), maxShield - player.shield);
          canBeUsed = shieldIncrease > 0;
        }
      } else if (item.type === 'Effective Health Healing') {
        const maxHealth = parseInt(item.max_health);
        const maxShield = parseInt(item.max_shield);
        const totalHealing = parseInt(item.health_per);
  
        let appliedHealing = Math.min(totalHealing, maxHealth - player.health);
        let remainingHealing = totalHealing - appliedHealing;
        healthIncrease = appliedHealing;
  
        if (remainingHealing > 0) {
          shieldIncrease = Math.min(remainingHealing, maxShield - player.shield);
        }
  
        canBeUsed = healthIncrease > 0 || shieldIncrease > 0;
      }
  
      if (!canBeUsed) {
        return;
      }
  
      let countdownDuration = item.time_per;
  
      if (selectedItem === 'Medkit') {
        const maxHealth = parseInt(item.max_health);
        const percentage = healthIncrease / maxHealth;
        countdownDuration = Math.ceil(item.time_per * percentage);
      } else if (selectedItem === 'FlowBerry Fizz') {
        const maxShield = parseInt(item.max_shield);
        const percentage = shieldIncrease / maxShield;
        countdownDuration = Math.ceil(item.time_per * percentage);
      } else if (selectedItem === 'Banana of the Gods') {
        const initialHeal = 25;
        const healPerSecond = 3;
        const remainingHeal = healthIncrease - initialHeal;
  
        if (remainingHeal > 0) {
          countdownDuration = Math.ceil(remainingHeal / healPerSecond);
        }
      }
  
      player.health += healthIncrease;
      player.shield += shieldIncrease;
  
      const updatedCharacterInventories = { ...characterInventories };
      const existingItemDetails = updatedCharacterInventories[characterIndex]
        ? updatedCharacterInventories[characterIndex][selectedItem]
        : undefined;
  
      if (existingItemDetails) {
        existingItemDetails.quantity += 1;
        existingItemDetails.healthChanges.push(healthIncrease);
        existingItemDetails.shieldChanges.push(shieldIncrease);
  
        if (existingItemDetails.countdown) {
          countdownRefs.current[`${characterIndex}-${selectedItem}`] += countdownDuration;
        } else {
          countdownRefs.current[`${characterIndex}-${selectedItem}`] = countdownDuration;
          existingItemDetails.countdown = countdownDuration;
  
          const countdownInterval = setInterval(() => {
            const currentCountdown = countdownRefs.current[`${characterIndex}-${selectedItem}`];
            if (currentCountdown > 1) {
              countdownRefs.current[`${characterIndex}-${selectedItem}`] = currentCountdown - 1;
              setCharacterInventories((prevInventories) => {
                const updatedInventories = { ...prevInventories };
                if (updatedInventories[characterIndex] && updatedInventories[characterIndex][selectedItem]) {
                  updatedInventories[characterIndex][selectedItem].countdown = currentCountdown - 1;
                }
                return updatedInventories;
              });
            } else {
              delete countdownRefs.current[`${characterIndex}-${selectedItem}`];
              setCharacterInventories((prevInventories) => {
                const updatedInventories = { ...prevInventories };
                if (updatedInventories[characterIndex] && updatedInventories[characterIndex][selectedItem]) {
                  delete updatedInventories[characterIndex][selectedItem].countdown;
                }
                return updatedInventories;
              });
              clearInterval(countdownInterval);
            }
          }, 1000);
        }
      } else {
        updatedCharacterInventories[characterIndex] = {
          ...(updatedCharacterInventories[characterIndex] || {}),
          [selectedItem]: {
            ...item,
            quantity: 1,
            healthChanges: [healthIncrease],
            shieldChanges: [shieldIncrease],
            countdown: countdownDuration,
          },
        };
  
        countdownRefs.current[`${characterIndex}-${selectedItem}`] = countdownDuration;
  
        const countdownInterval = setInterval(() => {
          const currentCountdown = countdownRefs.current[`${characterIndex}-${selectedItem}`];
          if (currentCountdown > 1) {
            countdownRefs.current[`${characterIndex}-${selectedItem}`] = currentCountdown - 1;
            setCharacterInventories((prevInventories) => {
              const updatedInventories = { ...prevInventories };
              if (updatedInventories[characterIndex] && updatedInventories[characterIndex][selectedItem]) {
                updatedInventories[characterIndex][selectedItem].countdown = currentCountdown - 1;
              }
              return updatedInventories;
            });
          } else {
            delete countdownRefs.current[`${characterIndex}-${selectedItem}`];
            setCharacterInventories((prevInventories) => {
              const updatedInventories = { ...prevInventories };
              if (updatedInventories[characterIndex] && updatedInventories[characterIndex][selectedItem]) {
                delete updatedInventories[characterIndex][selectedItem].countdown;
              }
              return updatedInventories;
            });
            clearInterval(countdownInterval);
          }
        }, 1000);
      }
  
      const updatedGameData = { ...gameData, players: updatedPlayers };
      updatedGameData.inventory[selectedItem].quantity = newItemQuantity;
  
      setCharacterInventories(updatedCharacterInventories);
      setGameData(updatedGameData);
  
      if (newItemQuantity === 0) {
        setSelectedItem(null);
      }
    }
  };

  const handleCharacterInventoryClick = (characterIndex, itemName) => {
    if (characterInventories[characterIndex][itemName].quantity > 0) {
      const currentDetails = characterInventories[characterIndex][itemName];
      const newItemQuantity = currentDetails.quantity - 1;
      const updatedPlayers = [...gameData.players];
      const player = updatedPlayers[characterIndex];

      const lastHealthChange = currentDetails.healthChanges[newItemQuantity];
      const lastShieldChange = currentDetails.shieldChanges[newItemQuantity];

      player.health -= lastHealthChange;
      player.shield -= lastShieldChange;

      const updatedCharacterInventories = { ...characterInventories };
      if (newItemQuantity > 0) {
        updatedCharacterInventories[characterIndex][itemName] = {
          ...currentDetails,
          quantity: newItemQuantity,
          healthChanges: currentDetails.healthChanges.slice(0, newItemQuantity),
          shieldChanges: currentDetails.shieldChanges.slice(0, newItemQuantity),
        };
      } else {
        delete updatedCharacterInventories[characterIndex][itemName];
      }

      if (updatedCharacterInventories[characterIndex][itemName]) {
        delete updatedCharacterInventories[characterIndex][itemName].countdown;
      }

      const updatedGameData = { ...gameData, players: updatedPlayers };
      updatedGameData.inventory[itemName].quantity += 1;

      setCharacterInventories(updatedCharacterInventories);
      setGameData(updatedGameData);
    }
  };

  const handleCheckButtonClick = (isRedoClicked) => {
    setSelectedItem(null);
  
    const characterData = gameData.players.map((player, index) => {
      const initialData = initialCharacterData[index];
      const inventory = characterInventories[index];
      const items = Object.entries(inventory).map(([itemName, details]) => ({
        item: itemName,
        quantity: details.quantity,
      }));
  
      return {
        character: index + 1,
        startingHealth: initialData.health,
        startingShield: initialData.shield,
        submittedHealth: player.health,
        submittedShield: player.shield,
        items,
      };
    });
  
    const jsonData = JSON.stringify(
      {
        time: formatTime(time),
        initialInventory: initialInventorySaved,
        characterData,
      },
      null,
      2
    );
    console.log(jsonData);
  
    if (isRedoClicked) {
      startGame(gameData.players.length);
      // Remove the 'disabled' class from the inventory slots
      const inventorySlots = document.querySelectorAll('.inventory-slot:not(.first)');
      inventorySlots.forEach((slot) => slot.classList.remove('disabled'));
    } else {
      setIsRunning(false);
    }
  };
  
  const renderInventorySlots = () => {
    const inventorySlots = [];
    for (let i = 0; i < 6; i++) {
      if (i === 0) {
        const isCountdownActive = Object.values(characterInventories).some((inventory) =>
          Object.values(inventory).some((item) => item && item.countdown)
        );
  
        const countdownValue = isCountdownActive
          ? Math.max(
              ...Object.values(characterInventories).map((inventory) =>
                Math.max(...Object.values(inventory).map((item) => item?.countdown || 0))
              )
            )
          : 0;
  
        inventorySlots.push(
          <div
            key={i}
            className={`inventory-slot first ${isCountdownActive ? 'disabled' : ''} ${!isRunning ? 'redo' : ''}`}
            onClick={!isRunning ? () => handleCheckButtonClick(true) : isCountdownActive ? undefined : () => handleCheckButtonClick(false)}
          >
            <div className="check-button">
              {isRunning ? (
                <img src="/images/Check.png" alt="Check" className="inventory-item" />
              ) : (
                <img src="/images/Redo.png" alt="Redo" className="inventory-item" />
              )}
              {isCountdownActive && (
                <div className="countdown-overlay">
                  <span className="countdown-value">{countdownValue}</span>
                </div>
              )}
            </div>
          </div>
        );
      } else {
        const item = Object.entries(gameData.inventory)[i - 1];
        if (item) {
          const [itemName, details] = item;
          inventorySlots.push(
            <div
              key={i}
              className={`inventory-slot ${selectedItem === itemName ? 'selected' : ''} ${
                details.quantity === 0 ? 'empty' : ''
              } ${!isRunning ? 'disabled' : ''}`}
              style={{ '--rarity-color': `${getRarityColor(details.rarity)}` }}
              onClick={!isRunning ? undefined : () => handleItemClick(itemName)}
            >
              <img src={`/images/${itemName}.png`} alt={itemName} className="inventory-item" />
              <span className="quantity">{details.quantity}</span>
            </div>
          );
        } else {
          inventorySlots.push(<div key={i} className="inventory-slot empty"></div>);
        }
      }
    }
    return inventorySlots;
  };

 const renderCharacterInventory = (characterIndex) => {
    const inventory = characterInventories[characterIndex];
    return Object.entries(inventory).map(([itemName, details]) => (
      <div
        key={itemName}
        className="character-inventory-slot"
        style={{ '--rarity-color': `${getRarityColor(details.rarity)}` }}
        onClick={() => handleCharacterInventoryClick(characterIndex, itemName)}
      >
        <img src={`/images/${itemName}.png`} alt={itemName} className="character-inventory-item" />
        <span className="character-inventory-quantity">{details.quantity}</span>
        {details.countdown && (
          <div className="character-inventory-countdown-overlay">
            <span className="character-inventory-countdown">{details.countdown}</span>
          </div>
        )}
      </div>
    ));
  };

  const renderPlayerContainers = () => {
    if (!gameData || !gameData.players) return null;
  
    return gameData.players.map((player, index) => (
      <div
        key={index}
        className={`player-container ${!isRunning ? 'disabled' : ''}`}
      >
        <div className="content" onClick={() => handleCharacterClick(index)}>
          <img
            src={`/images/${randomCharacters[index]}.png`}
            alt={randomCharacters[index]}
            className="character-image"
          />
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
       </div>
       <div className="character-inventory">{renderCharacterInventory(index)}</div>
     </div>
   ));
 };

 return (
    <div className="game-container">
      <div className="content-wrapper">
        {gameData && (
          <div className="timer">
            {formatTime(time)}
          </div>
        )}
        {!gameData && (
          <div className="button-container">
            <button className="game-button" onClick={() => startGame(1)}>
              Solo
            </button>
            <button className="game-button" onClick={() => startGame(2)}>
              Duo
            </button>
            <button className="game-button" onClick={() => startGame(3)}>
              Trio
            </button>
            <button className="game-button" onClick={() => startGame(4)}>
              Squad
            </button>
          </div>
        )}
        {gameData && (
          <>
            <div className="inventory">{renderInventorySlots()}</div>
            <div className="scenario-container">{renderPlayerContainers()}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default Game;