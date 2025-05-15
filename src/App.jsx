import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import './App.css';

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [cardObjects, setCardObjects] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);

  const startGame = () => {
    let emojis = ['🧸', '🌸', '🍓', '🎀', '🦋', '💌'];
  
    if (difficulty === 'easy') emojis = emojis.slice(0, 3);        // 3 pairs
    else if (difficulty === 'hard') emojis = [...emojis, '🐚', '🫧', '🍰']; // 9 pairs
  
    const cards = shuffleArray([...emojis, ...emojis]).map((emoji, index) => ({
      index,
      emoji,
      flipped: false,
      solved: false,
    }));
  
    setCardObjects(cards);
    setSelectedCards([]);
    setMoves(0);
    setTime(0);
  };

  // Init game on mount
  useEffect(() => {
    startGame();
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme toggle
  useEffect(() => {
    document.body.className = darkTheme ? 'dark' : '';
  }, [darkTheme]);

  const playSound = (type) => {
    if (!soundOn) return;
    const sound = document.getElementById(`${type}-sound`);
    sound?.play();
  };

  const [playerName, setPlayerName] = useState('');

  const handleCardClick = (clickedCard) => {
    if (clickedCard.flipped || clickedCard.solved || selectedCards.length === 2) return;

    playSound('flip');

    setCardObjects((prevCards) =>
      prevCards.map((card) =>
        card.index === clickedCard.index ? { ...card, flipped: true } : card
      )
    );

    const newSelected = [...selectedCards, clickedCard];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstCard, secondCard] = newSelected;

      if (firstCard.emoji === secondCard.emoji) {
        playSound('match');
        setCardObjects((prevCards) =>
          prevCards.map((card) =>
            card.emoji === clickedCard.emoji ? { ...card, solved: true } : card
          )
        );
        setSelectedCards([]);
      } else {
        setTimeout(() => {
          setCardObjects((prevCards) =>
            prevCards.map((card) =>
              card.index === firstCard.index || card.index === secondCard.index
                ? { ...card, flipped: false }
                : card
            )
          );
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const hasWon = cardObjects.length && cardObjects.every((card) => card.solved);

  useEffect(() => {
    if (hasWon) {
      const timer = setTimeout(() => {
        startGame();
      }, 6000);
      playSound('win');
      return () => clearTimeout(timer);
    }
  }, [hasWon]);

  // HUD buttons functionality
  useEffect(() => {
    const themeBtn = document.getElementById('toggle-theme');
    const soundBtn = document.getElementById('toggle-sound');
    if (themeBtn) themeBtn.onclick = () => setDarkTheme((prev) => !prev);
    if (soundBtn) soundBtn.onclick = () => setSoundOn((prev) => !prev);
  }, []);

  // Update HUD
  useEffect(() => {
    const timerEl = document.getElementById('timer');
    const movesEl = document.getElementById('moves');
    if (timerEl) timerEl.textContent = `Time: ${time}s`;
    if (movesEl) movesEl.textContent = `Moves: ${moves}`;
  }, [time, moves]);
  if (!gameStarted) {
    return (
      <main style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>🧠 Welcome to Alaa’s Memory Game</h1>
        <p>Enter your name and choose a difficulty to begin.</p>
  
        <input
          type="text"
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{ padding: '10px', margin: '10px', fontSize: '1rem' }}
        />
        <br />
  
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={{ padding: '10px', fontSize: '1rem' }}
        >
          <option value="easy">Easy (3 pairs)</option>
          <option value="medium">Medium (6 pairs)</option>
          <option value="hard">Hard (9 pairs)</option>
        </select>
        <br />
  
        <button
          onClick={() => {
            startGame();
            setGameStarted(true);
          }}
          style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1rem' }}
        >
          Start Game
        </button>
      </main>
    );
  }
  return (
    <main>
      {hasWon && <Confetti />}
      {!hasWon && <h1>{playerName}'s Memory Game 🧠</h1>}
{hasWon && <h2>Well done, {playerName}! You nailed it 🎉</h2>}

      <div className="card-container">
        {cardObjects.map((card) => (
          <div
            className={`card ${card.flipped ? 'active' : ''}`}
            key={card.index}
            onClick={() => handleCardClick(card)}
          >
            <div className="card-inner">
              <div className="card-front"></div>
              <div className="card-back">{card.emoji}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
