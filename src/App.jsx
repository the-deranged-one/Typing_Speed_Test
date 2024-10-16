import React, { useState, useEffect } from 'react';

const App = () =>{
  const [currentSentence, setCurrentSentence] = useState(''); // Sentence from API
  const [userInput, setUserInput] = useState(''); // Tracks user input
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);


  // Fetch random words from the API
  const fetchRandomWords = async () => {
    try {
      const response = await fetch('https://random-word-api.herokuapp.com/word?number=10');
      const words = await response.json();
      return words.join(' ');
    }

    catch (error) {
      console.error('Failed to fetch random words:', error);
      return 'Error fetching words';
    }
  };

  // Start the game
  const startGame = async () => {
    const sentence = await fetchRandomWords();
    setCurrentSentence(sentence);
    setUserInput('');
    setCorrectCount(0);
    setIncorrectCount(0);
    setWpm(null);
    setAccuracy(null);
    setGameEnded(false);
    setStartTime(new Date().getTime());
    setGameStarted(true);
  };

  // Handle typing input via keydown
  const handleTyping = (event) => {
    const { key } = event;

    if (gameEnded || userInput.length >= currentSentence.length) return; // Stop input after game ends

    // Update user input if a valid key is pressed
    if (key.length === 1 && key !== 'Shift' && key !== 'CapsLock') {
      setUserInput((prevInput) => prevInput + key);

      const currentIndex = userInput.length; // Get the index of the current character

      // Check if the key matches the corresponding character in the sentence
      if (key === currentSentence[currentIndex]) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setIncorrectCount((prev) => prev + 1);
      }

      // End the game when the sentence is fully typed
      if (currentIndex + 1 === currentSentence.length) {
        endGame();
      }
    }
  };

  // End the game and calculate WPM and accuracy
  const endGame = () => {
    const endTime = new Date().getTime();
    const timeTaken = (endTime - startTime) / 1000 / 60; // Time in minutes

    const totalCharsTyped = correctCount + incorrectCount;
    const wordCountEquivalent = totalCharsTyped / 5; // Average word length is considered 5 characters
    const calculatedWpm = (wordCountEquivalent / timeTaken).toFixed(2);

    const calculatedAccuracy = totalCharsTyped > 0
      ? ((correctCount / totalCharsTyped) * 100).toFixed(2)
      : 0;

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
    setGameEnded(true);
  };

  // Restart the game
  const restartGame = () => {
    startGame();
  };

  // Start listening to keydown events
  useEffect(() => {
    window.addEventListener('keydown', handleTyping);
    return () => {
      window.removeEventListener('keydown', handleTyping);
    };
  }, [userInput, currentSentence, gameEnded]); // Dependencies for re-render

  return (
    <div>
      <h1 className='text-4xl'>Typing Speed Test</h1>

      {/* Display sentence with correct and incorrect highlighting */}
      <div id="sentence" style={{ fontSize: '24px', marginBottom: '70px' }}>
        {currentSentence.split('').map((char, index) => {
          let className = '';
          if (index < userInput.length) {
            className = userInput[index] === char ? 'correct' : 'incorrect';
          }
          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>

      {/* Result */}
      {gameEnded && (
        <div id="result">
          <p>Words per minute: {wpm}</p>
          <p>Accuracy: {accuracy}%</p>
        </div>
      )}

      {/* Buttons */}
      <div>
        {!gameStarted && <button onClick={startGame}>Start</button>}
        {gameEnded && <button onClick={restartGame} className='mt-10 text-lg font-bold'>Restart</button>}
      </div>
    </div>
  );
};

export default App;
