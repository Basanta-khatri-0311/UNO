import React, { useState } from 'react';

// Inline SVG icon components (no external dependencies needed)
const RotateCw = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const Plus = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const Zap = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

// Card component with animations
const Card = ({ card, onClick, isPlayable, style, className = '' }) => {
  const getCardColor = () => {
    const colors = {
      red: 'from-red-500 to-red-600',
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-400 to-yellow-500',
      wild: 'from-purple-600 via-pink-500 to-orange-500'
    };
    return colors[card.color] || colors.wild;
  };

  const getCardIcon = () => {
    switch (card.value) {
      case 'skip':
        return <div className="text-5xl font-black">⊘</div>;
      case 'reverse':
        return <RotateCw className="w-12 h-12" strokeWidth={3} />;
      case 'draw2':
        return <div className="text-4xl font-black">+2</div>;
      case 'wild':
        return <div className="text-3xl font-black">W</div>;
      case 'wild4':
        return <div className="text-3xl font-black">+4</div>;
      default:
        return <div className="text-6xl font-black">{card.value}</div>;
    }
  };

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-24 h-36 rounded-2xl shadow-2xl cursor-pointer
        transition-all duration-300 transform
        ${isPlayable ? 'hover:-translate-y-4 hover:scale-110 hover:shadow-3xl' : 'opacity-60'}
        ${className}
      `}
      style={style}
    >
      <div className={`
        w-full h-full rounded-2xl bg-gradient-to-br ${getCardColor()}
        border-4 border-white flex items-center justify-center
        shadow-inner relative overflow-hidden
      `}>
        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-white opacity-30" />
        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-white opacity-30" />
        <div className="text-white drop-shadow-lg">
          {getCardIcon()}
        </div>
        <div className="absolute top-1 left-2 text-white text-sm font-black opacity-70">
          {card.value === 'wild' || card.value === 'wild4' ? '★' : card.value}
        </div>
        <div className="absolute bottom-1 right-2 text-white text-sm font-black opacity-70 rotate-180">
          {card.value === 'wild' || card.value === 'wild4' ? '★' : card.value}
        </div>
      </div>
    </div>
  );
};

const createDeck = () => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
  const deck = [];
  colors.forEach(color => {
    values.forEach(value => {
      deck.push({ color, value, id: `${color}-${value}-1` });
      if (value !== '0') {
        deck.push({ color, value, id: `${color}-${value}-2` });
      }
    });
  });
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'wild', value: 'wild', id: `wild-${i}` });
    deck.push({ color: 'wild', value: 'wild4', id: `wild4-${i}` });
  }
  return deck.sort(() => Math.random() - 0.5);
};

export default function UnoGame() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [computerHand, setComputerHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [currentColor, setCurrentColor] = useState(null);
  const [direction, setDirection] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState('player');
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);
  const [winner, setWinner] = useState(null);

  const startGame = () => {
    const newDeck = createDeck();
    const playerCards = newDeck.splice(0, 7);
    const computerCards = newDeck.splice(0, 7);
    const firstCard = newDeck.splice(0, 1)[0];
    setDeck(newDeck);
    setPlayerHand(playerCards);
    setComputerHand(computerCards);
    setDiscardPile([firstCard]);
    setCurrentColor(firstCard.color);
    setGameStarted(true);
    setCurrentPlayer('player');
    setMessage('Your turn! Play a card or draw.');
    setWinner(null);
  };

  const isPlayable = (card) => {
    if (card.color === 'wild') return true;
    const topCard = discardPile[discardPile.length - 1];
    return card.color === currentColor || card.value === topCard.value;
  };

  const selectWildColor = (color) => {
    if (pendingWildCard) {
      const { card, fromPlayer } = pendingWildCard;
      setCurrentColor(color);
      setShowColorPicker(false);
      setPendingWildCard(null);
      setDiscardPile([...discardPile, card]);
      if (card.value === 'wild4') {
        if (fromPlayer) {
          const newComputerHand = [...computerHand];
          for (let i = 0; i < 4; i++) {
            if (deck.length > 0) newComputerHand.push(deck.shift());
          }
          setComputerHand(newComputerHand);
          setMessage('Computer draws 4 cards!');
        } else {
          const newPlayerHand = [...playerHand];
          for (let i = 0; i < 4; i++) {
            if (deck.length > 0) newPlayerHand.push(deck.shift());
          }
          setPlayerHand(newPlayerHand);
          setMessage('You draw 4 cards!');
        }
      }
      setTimeout(() => {
        setCurrentPlayer(fromPlayer ? 'computer' : 'player');
        setMessage(fromPlayer ? "Computer's turn..." : 'Your turn!');
        if (!fromPlayer) setTimeout(() => computerPlay(), 1000);
      }, 1000);
    }
  };

  const playCard = (card, handUpdater, isPlayer = true) => {
    if (card.color === 'wild') {
      handUpdater(prev => prev.filter(c => c.id !== card.id));
      setPendingWildCard({ card, fromPlayer: isPlayer });
      setShowColorPicker(true);
      setMessage('Choose a color!');
      return;
    }
    const newDiscardPile = [...discardPile, card];
    setDiscardPile(newDiscardPile);
    setCurrentColor(card.color);
    handUpdater(prev => prev.filter(c => c.id !== card.id));
    let skipNext = false;
    if (card.value === 'skip') {
      skipNext = true;
      setMessage(isPlayer ? 'Computer skipped!' : 'You are skipped!');
    } else if (card.value === 'reverse') {
      setDirection(prev => -prev);
      setMessage('Direction reversed!');
    } else if (card.value === 'draw2') {
      const targetHand = isPlayer ? setComputerHand : setPlayerHand;
      targetHand(prev => {
        const newHand = [...prev];
        for (let i = 0; i < 2; i++) {
          if (deck.length > 0) newHand.push(deck.shift());
        }
        return newHand;
      });
      skipNext = true;
      setMessage(isPlayer ? 'Computer draws 2!' : 'You draw 2!');
    }
    setTimeout(() => {
      if (isPlayer && playerHand.length === 1) {
        setWinner('player');
        setMessage('🎉 You won! UNO!');
        return;
      } else if (!isPlayer && computerHand.length === 1) {
        setWinner('computer');
        setMessage('💻 Computer won!');
        return;
      }
      if (!skipNext) {
        setCurrentPlayer(isPlayer ? 'computer' : 'player');
        setMessage(isPlayer ? "Computer's turn..." : 'Your turn!');
        if (isPlayer) setTimeout(() => computerPlay(), 1000);
      } else {
        setTimeout(() => {
          setCurrentPlayer(isPlayer ? 'player' : 'computer');
          setMessage(isPlayer ? 'Your turn!' : "Computer's turn...");
          if (!isPlayer) setTimeout(() => computerPlay(), 1000);
        }, 1500);
      }
    }, 800);
  };

  const handlePlayerCard = (card) => {
    if (currentPlayer !== 'player' || winner) return;
    if (!isPlayable(card)) {
      setMessage('Cannot play that card!');
      return;
    }
    playCard(card, setPlayerHand, true);
  };

  const drawCard = () => {
    if (currentPlayer !== 'player' || winner || deck.length === 0) return;
    const drawnCard = deck[0];
    setDeck(deck.slice(1));
    setPlayerHand([...playerHand, drawnCard]);
    setMessage('Card drawn! Computer\'s turn...');
    setTimeout(() => {
      setCurrentPlayer('computer');
      setTimeout(() => computerPlay(), 1000);
    }, 500);
  };

  const computerPlay = () => {
    if (winner) return;
    const playableCards = computerHand.filter(isPlayable);
    if (playableCards.length > 0) {
      const actionCards = playableCards.filter(c => 
        c.value === 'skip' || c.value === 'reverse' || c.value === 'draw2' || c.value === 'wild4'
      );
      const cardToPlay = actionCards.length > 0 
        ? actionCards[Math.floor(Math.random() * actionCards.length)]
        : playableCards[Math.floor(Math.random() * playableCards.length)];
      setTimeout(() => {
        if (cardToPlay.color === 'wild') {
          const colors = ['red', 'blue', 'green', 'yellow'];
          const chosenColor = colors[Math.floor(Math.random() * colors.length)];
          setComputerHand(prev => prev.filter(c => c.id !== cardToPlay.id));
          setDiscardPile([...discardPile, cardToPlay]);
          setCurrentColor(chosenColor);
          if (cardToPlay.value === 'wild4') {
            const newPlayerHand = [...playerHand];
            for (let i = 0; i < 4; i++) {
              if (deck.length > 0) newPlayerHand.push(deck.shift());
            }
            setPlayerHand(newPlayerHand);
            setMessage(`Computer played Wild +4! You draw 4 cards!`);
          } else {
            setMessage(`Computer played Wild, chose ${chosenColor}!`);
          }
          setTimeout(() => {
            if (computerHand.length === 1) {
              setWinner('computer');
              setMessage('💻 Computer won!');
            } else {
              setCurrentPlayer('player');
              setMessage('Your turn!');
            }
          }, 1500);
        } else {
          playCard(cardToPlay, setComputerHand, false);
        }
      }, 1000);
    } else {
      if (deck.length > 0) {
        setTimeout(() => {
          const drawnCard = deck[0];
          setDeck(deck.slice(1));
          setComputerHand([...computerHand, drawnCard]);
          setMessage('Computer drew a card. Your turn!');
          setCurrentPlayer('player');
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 mb-4 drop-shadow-2xl tracking-tight">
            UNO
          </h1>
          <p className="text-2xl text-white/80 font-bold tracking-wide">
            The Classic Card Game
          </p>
        </div>
        {!gameStarted ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <button onClick={startGame} className="group relative px-16 py-8 text-4xl font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-4">
                <Zap className="w-12 h-12" />
                Start Game
                <Zap className="w-12 h-12" />
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  💻 Computer
                  <span className="text-lg font-normal bg-white/20 px-4 py-1 rounded-full">
                    {computerHand.length} cards
                  </span>
                </h2>
              </div>
              <div className="flex justify-center gap-2">
                {computerHand.map((_, index) => (
                  <div key={index} className="w-16 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl border-2 border-white shadow-lg transform transition-transform hover:scale-105" style={{ transform: `rotate(${(index - computerHand.length / 2) * 2}deg)` }} />
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-8 border-4 border-yellow-400 shadow-2xl min-h-[300px] relative">
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="relative">
                  <div className="text-white text-center mb-2 font-bold">Deck: {deck.length}</div>
                  <div onClick={drawCard} className="w-24 h-36 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-4 border-white shadow-2xl cursor-pointer hover:scale-110 transition-transform flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Plus className="w-12 h-12 text-white" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`transform transition-transform duration-500 ${direction === -1 ? 'rotate-180' : ''}`}>
                    <RotateCw className="w-12 h-12 text-white" strokeWidth={3} style={{ animation: 'spin 3s linear infinite' }} />
                  </div>
                  <div className="text-white font-bold text-sm">{direction === 1 ? 'Clockwise' : 'Counter'}</div>
                </div>
                <div className="relative">
                  <div className="text-white text-center mb-2 font-bold">Current: {currentColor}</div>
                  {discardPile.length > 0 && <Card card={discardPile[discardPile.length - 1]} isPlayable={false} className="transform hover:scale-100" />}
                </div>
              </div>
              <div className="text-center">
                <div className="inline-block bg-white/90 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg">
                  <p className="text-2xl font-black text-gray-800">{message}</p>
                  {winner && <button onClick={startGame} className="mt-4 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-xl hover:scale-105 transition-transform">Play Again</button>}
                </div>
              </div>
              {showColorPicker && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-3xl flex items-center justify-center z-20">
                  <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-3xl font-black text-gray-800 mb-6 text-center">Choose a Color</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['red', 'blue', 'green', 'yellow'].map(color => (
                        <button key={color} onClick={() => selectWildColor(color)} className={`w-32 h-32 rounded-2xl font-black text-2xl text-white shadow-xl hover:scale-110 transition-transform ${color === 'red' ? 'bg-gradient-to-br from-red-500 to-red-600' : color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-yellow-400 to-yellow-500'}`}>
                          {color.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  🎮 You
                  <span className="text-lg font-normal bg-white/20 px-4 py-1 rounded-full">{playerHand.length} cards</span>
                </h2>
                {playerHand.length === 1 && <div className="text-4xl font-black text-yellow-400 animate-bounce">UNO! 🎯</div>}
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                {playerHand.map((card) => <Card key={card.id} card={card} onClick={() => handlePlayerCard(card)} isPlayable={currentPlayer === 'player' && !winner && isPlayable(card)} />)}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <style>{\`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\`}</style> */}
    </div>
  );
}