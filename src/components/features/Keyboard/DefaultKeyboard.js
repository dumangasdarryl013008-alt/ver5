import React from "react";
import { useRef, useEffect, useState } from "react";
import { Box } from "@mui/system";
import IconButton from "../../utils/IconButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import useSound from "use-sound";
import { SOUND_MAP } from "../sound/sound";
import useLocalPersistState from "../../../hooks/useLocalPersistState";
import useGameOverSound from "../../../hooks/useGameOverSound";
import {
  DEFAULT_COUNT_DOWN,
  COUNT_DOWN_90,
  COUNT_DOWN_60,
  COUNT_DOWN_30,
  COUNT_DOWN_15,
  COUNT_DOWN_FREE,
} from "../../../constants/Constants";

const DefaultKeyboard = ({ soundType, soundMode, onAddToLeaderboard, playerName }) => {
  const keyboardRef = useRef();
  const hasSubmittedToLeaderboard = useRef(false);
  const [inputChar, setInputChar] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [play] = useSound(SOUND_MAP[soundType], { volume: 0.5 });

  const [trainerMode, setTrainerMode] = useLocalPersistState(
    "normal",
    "trainer-mode"
  );
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [showFingerPlacementStart, setShowFingerPlacementStart] = useState(false);

  const [countDownConstant, setCountDownConstant] = useLocalPersistState(
    DEFAULT_COUNT_DOWN,
    "trainer-timer-constant"
  );
  const [countDown, setCountDown] = useState(countDownConstant);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  useGameOverSound(showResults);

  const accuracy =
    correctCount + incorrectCount === 0
      ? 0
      : Math.floor((correctCount / (correctCount + incorrectCount)) * 100);
  const keys = [..." abcdefghijklmnopqrstuvwxyz1234567890.,;/ "];
  const resetStats = () => {
    setCorrectCount(0);
    setIncorrectCount(0);
    setCountDown(countDownConstant);
    setIsTimerRunning(false);
    setShowResults(false);
    hasSubmittedToLeaderboard.current = false;
  };

  const getFingerPlacementColor = (key) => {
    const keyUpper = key.toUpperCase();
    const fingerColors = {
      red: ['1', 'Q', 'A', 'Z'],
      orange: ['2', 'W', 'S', 'X'],
      green: ['3', 'E', 'D', 'C'],
      blue: ['4', '5', 'R', 'F', 'V', 'T', 'G', 'B'],
      darkBlue: ['6', '7', 'Y', 'H', 'N', 'U', 'J', 'M'],
      lightBlue: ['8', 'I', 'K', ','],
      yellow: ['9', 'O', 'L', '.'],
      pink: ['0', 'P', ';', '/']
    };

    for (const [color, keys] of Object.entries(fingerColors)) {
      if (keys.includes(keyUpper)) {
        return color;
      }
    }
    return null;
  };

  const getFingerPlacementStyle = (keyString) => {
    if (trainerMode !== 'fingerPlacement') return {};
    
    const color = getFingerPlacementColor(keyString);
    const colorMap = {
      red: { border: '2px solid #f44336', color: '#f44336' },
      orange: { border: '2px solid #ff9800', color: '#ff9800' },
      green: { border: '2px solid #4caf50', color: '#4caf50' },
      blue: { border: '2px solid #2196f3', color: '#2196f3' },
      darkBlue: { border: '2px solid #1565c0', color: '#1565c0' },
      lightBlue: { border: '2px solid #03a9f4', color: '#03a9f4' },
      yellow: { border: '2px solid #ffeb3b', color: '#ffeb3b' },
      pink: { border: '2px solid #e91e63', color: '#e91e63' }
    };

    return colorMap[color] || {};
  };

  const getFingerName = (key) => {
    const color = getFingerPlacementColor(key);
    const fingerMap = {
      red: { hand: 'Left', finger: 'Pinky' },
      orange: { hand: 'Left', finger: 'Ring' },
      green: { hand: 'Left', finger: 'Middle' },
      blue: { hand: 'Left', finger: 'Index' },
      darkBlue: { hand: 'Right', finger: 'Index' },
      lightBlue: { hand: 'Right', finger: 'Middle' },
      yellow: { hand: 'Right', finger: 'Ring' },
      pink: { hand: 'Right', finger: 'Pinky' }
    };

    if (color && fingerMap[color]) {
      return `${fingerMap[color].hand} ${fingerMap[color].finger}`;
    }
    return 'Thumb';
  };

  const getFingerInfo = (key) => {
    const color = getFingerPlacementColor(key);
    const colorToHex = {
      red: '#f44336',
      orange: '#ff9800',
      green: '#4caf50',
      blue: '#2196f3',
      darkBlue: '#1565c0',
      lightBlue: '#03a9f4',
      yellow: '#ffeb3b',
      pink: '#e91e63'
    };
    
    const fingerIndexMap = {
      red: { hand: 'left', index: 0 },
      orange: { hand: 'left', index: 1 },
      green: { hand: 'left', index: 2 },
      blue: { hand: 'left', index: 3 },
      pink: { hand: 'right', index: 0 },
      yellow: { hand: 'right', index: 1 },
      lightBlue: { hand: 'right', index: 2 },
      darkBlue: { hand: 'right', index: 3 }
    };

    if (color && fingerIndexMap[color]) {
      return {
        hand: fingerIndexMap[color].hand,
        fingerIndex: fingerIndexMap[color].index,
        color: colorToHex[color]
      };
    }
    return null;
  };

  const HandSVG = ({ side, highlightedFinger, highlightColor }) => {
    const isLeft = side === 'left';
    
    return (
      <svg 
        width="120" 
        height="200" 
        viewBox="0 0 120 200" 
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
        }}
      >
        {/* Arm */}
        <rect 
          x={isLeft ? "35" : "35"} 
          y="150" 
          width="50" 
          height="50" 
          fill="rgba(150, 150, 150, 0.3)" 
          stroke="rgba(100, 100, 100, 0.5)" 
          strokeWidth="2"
          rx="5"
        />
        
        {/* Palm */}
        <ellipse 
          cx="60" 
          cy="120" 
          rx="35" 
          ry="45" 
          fill="rgba(150, 150, 150, 0.3)" 
          stroke="rgba(100, 100, 100, 0.5)" 
          strokeWidth="2"
        />
        
        {/* Fingers - positioned from pinky to index */}
        {[0, 1, 2, 3].map((fingerIndex) => {
          const isHighlighted = highlightedFinger === fingerIndex;
          const baseX = isLeft ? (30 + fingerIndex * 20) : (30 + (3 - fingerIndex) * 20);
          
          return (
            <g key={fingerIndex}>
              {/* Finger glow effect when highlighted */}
              {isHighlighted && (
                <rect
                  x={baseX - 3}
                  y="35"
                  width="16"
                  height="60"
                  rx="8"
                  fill={highlightColor}
                  opacity="0.4"
                  filter="blur(8px)"
                />
              )}
              
              {/* Finger */}
              <rect
                x={baseX}
                y="40"
                width="10"
                height={fingerIndex === 1 ? "55" : fingerIndex === 2 ? "60" : "50"}
                rx="5"
                fill={isHighlighted ? highlightColor : "rgba(150, 150, 150, 0.5)"}
                stroke={isHighlighted ? highlightColor : "rgba(100, 100, 100, 0.6)"}
                strokeWidth={isHighlighted ? "3" : "2"}
                style={{
                  transition: 'all 0.3s ease',
                  filter: isHighlighted ? 'brightness(1.2)' : 'none'
                }}
              />
              
              {/* Fingertip */}
              <ellipse
                cx={baseX + 5}
                cy="40"
                rx="5"
                ry="6"
                fill={isHighlighted ? highlightColor : "rgba(150, 150, 150, 0.5)"}
                stroke={isHighlighted ? highlightColor : "rgba(100, 100, 100, 0.6)"}
                strokeWidth={isHighlighted ? "3" : "2"}
                style={{
                  transition: 'all 0.3s ease'
                }}
              />
            </g>
          );
        })}
        
        {/* Thumb */}
        <ellipse
          cx={isLeft ? "25" : "95"}
          cy="130"
          rx="8"
          ry="20"
          fill="rgba(150, 150, 150, 0.5)"
          stroke="rgba(100, 100, 100, 0.6)"
          strokeWidth="2"
          transform={isLeft ? "rotate(-30 25 130)" : "rotate(30 95 130)"}
        />
      </svg>
    );
  };

  useEffect(() => {
    keyboardRef.current && keyboardRef.current.focus();
  });

  useEffect(() => {
    let timer;
    if (isTimerRunning && countDown > 0 && countDownConstant !== COUNT_DOWN_FREE) {
      timer = setTimeout(() => {
        setCountDown((prevCountDown) => prevCountDown - 1);
      }, 1000);
    } else if (countDown === 0 && isTimerRunning && countDownConstant !== COUNT_DOWN_FREE) {
      setIsTimerRunning(false);
      setShowResults(true);
    }
    return () => clearTimeout(timer);
  }, [countDown, isTimerRunning, countDownConstant]);

  // Submit to leaderboard when results are shown (guard against double submission in React 18 Strict Mode)
  useEffect(() => {
    if (showResults && onAddToLeaderboard && correctCount > 0 && !hasSubmittedToLeaderboard.current) {
      hasSubmittedToLeaderboard.current = true;
      const lps = parseFloat((correctCount / countDownConstant).toFixed(2));
      onAddToLeaderboard(lps, "Trainer", accuracy, incorrectCount);
    }
  }, [showResults, onAddToLeaderboard, correctCount, countDownConstant, accuracy, incorrectCount]);

  useEffect(() => {
    setCountDown(countDownConstant);
  }, [countDownConstant]);

  const handleInputBlur = (event) => {
    keyboardRef.current && keyboardRef.current.focus();
  };
  const handleKeyDown = (event) => {
    if (soundMode) {
      play();
    }
    setInputChar(event.key);
    event.preventDefault();
    return;
  };
  const handleKeyUp = (event) => {
    if (!isTimerRunning && countDown > 0) {
      setIsTimerRunning(true);
    }
    
    setInputChar("");
    if (event.key === randomKey) {
      let newRandom = getRandomKeyIndex();
      let newKey = keys[newRandom];
      if (newKey === randomKey) {
        if (newRandom === 0 || newRandom === keys.length - 1) {
          newRandom = 1;
        } else {
          newRandom = newRandom + 1;
        }
      }
      setRandomKey(keys[newRandom]);
      setCorrectCount(correctCount + 1);
      return;
    }

    setIncorrectCount(incorrectCount + 1);

    event.preventDefault();
    return;
  };
  const getRandomKeyIndex = () => {
    return Math.floor(Math.random() * keys.length);
  };

  const [randomKey, setRandomKey] = useState(() => {
    return keys[getRandomKeyIndex()];
  });

  const getClassName = (keyString) => {
    if (keyString !== randomKey) {
      if (inputChar !== "" && inputChar === keyString) {
        return "UNITKEY VIBRATE-ERROR";
      }
      return "UNITKEY";
    }
    if (inputChar !== "" && inputChar === keyString) {
      return "UNITKEY NOVIBRATE-CORRECT";
    }
    return "UNITKEY VIBRATE";
  };
  const getSpaceKeyClassName = () => {
    if (" " !== randomKey) {
      if (inputChar !== "" && inputChar === " ") {
        return "SPACEKEY VIBRATE-ERROR";
      }
      return "SPACEKEY";
    }
    if (inputChar !== "" && inputChar === " ") {
      return "SPACEKEY NOVIBRATE-CORRECT";
    }
    return "SPACEKEY VIBRATE";
  };

  const getTimerButtonClassName = (buttonTimerCountDown) => {
    if (countDownConstant === buttonTimerCountDown) {
      return "active-button";
    }
    return "inactive-button";
  };

  const handleTimerChange = (newTimer) => {
    setCountDownConstant(newTimer);
    setCountDown(newTimer);
    setIsTimerRunning(false);
    setShowResults(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    hasSubmittedToLeaderboard.current = false;
  };

  const lettersPerSecond = countDownConstant > 0 
    ? (correctCount / countDownConstant).toFixed(2) 
    : 0;

  const numbersRow = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  const row0Elements = numbersRow.map((num, index) => (
    <div 
      className={getClassName(num.toLowerCase())} 
      key={index} 
      id={num}
      style={getFingerPlacementStyle(num)}
    >
      {num}
    </div>
  ));

  const lettersRow1 = [
    "Q",
    "W",
    "E",
    "R",
    "T",
    "Y",
    "U",
    "I",
    "O",
    "P",
    "[",
    "]",
  ];

  const row1Elements = lettersRow1.map((letter, index) => (
    <div 
      className={getClassName(letter.toLowerCase())} 
      key={index} 
      id={letter}
      style={getFingerPlacementStyle(letter)}
    >
      {letter}
    </div>
  ));

  const lettersRow2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"];

  const row2Elements = lettersRow2.map((letter, index) => (
    <div 
      className={getClassName(letter.toLowerCase())} 
      key={index} 
      id={letter}
      style={getFingerPlacementStyle(letter)}
    >
      {letter}
    </div>
  ));

  const lettersRow3 = ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"];

  const row3Elements = lettersRow3.map((letter, index) => (
    <div 
      className={getClassName(letter.toLowerCase())} 
      key={index} 
      id={letter}
      style={getFingerPlacementStyle(letter)}
    >
      {letter}
    </div>
  ));

  const handleModeSelection = (mode) => {
    setTrainerMode(mode);
    setShowModeSelection(false);
    if (mode === 'fingerPlacement') {
      setShowFingerPlacementStart(true);
    }
  };

  const handleStartFingerPlacement = () => {
    setShowFingerPlacementStart(false);
  };

  const handleBackToModeSelection = () => {
    setShowModeSelection(true);
    setShowFingerPlacementStart(false);
    resetStats();
  };

  return (
    <div>
      {showModeSelection ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          gap: '24px'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>⌨️ Choose Training Mode</h2>
          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '16px' }}>
            Select your preferred practice mode
          </p>
          
          <Box display="flex" gap={3} flexWrap="wrap" justifyContent="center">
            <div 
              onClick={() => handleModeSelection('normal')}
              style={{
                cursor: 'pointer',
                padding: '32px',
                borderRadius: '12px',
                border: '2px solid rgba(255, 152, 0, 0.3)',
                backgroundColor: 'rgba(255, 152, 0, 0.05)',
                width: '280px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 152, 0, 0.8)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 152, 0, 0.3)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.05)';
              }}
            >
              <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>📝 Normal Mode</h3>
              <p style={{ fontSize: '14px', opacity: 0.8 }}>
                Practice typing with standard keyboard layout. Perfect for general speed improvement.
              </p>
            </div>

            <div 
              onClick={() => handleModeSelection('fingerPlacement')}
              style={{
                cursor: 'pointer',
                padding: '32px',
                borderRadius: '12px',
                border: '2px solid rgba(33, 150, 243, 0.3)',
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                width: '280px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(33, 150, 243, 0.8)';
                e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(33, 150, 243, 0.3)';
                e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.05)';
              }}
            >
              <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>👆 Good Finger Placement Mode</h3>
              <p style={{ fontSize: '14px', opacity: 0.8 }}>
                Learn proper finger placement with color-coded keys for each finger.
              </p>
            </div>
          </Box>
        </div>
      ) : showFingerPlacementStart ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '24px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>👆 Good Finger Placement Guide</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr 280px',
            gap: '20px',
            width: '100%',
            maxWidth: '1200px',
            alignItems: 'start'
          }}>
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid rgba(244, 67, 54, 0.3)',
              backgroundColor: 'rgba(244, 67, 54, 0.05)',
              height: '100%'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>👈 Left Hand</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#f44336', borderRadius: '4px', flexShrink: 0 }}></div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>Red - Pinky</strong><br/>
                    <span style={{ opacity: 0.8 }}>1, Q, A, Z</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#ff9800', borderRadius: '4px', flexShrink: 0 }}></div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>Orange - Ring</strong><br/>
                    <span style={{ opacity: 0.8 }}>2, W, S, X</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#4caf50', borderRadius: '4px', flexShrink: 0 }}></div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>Green - Middle</strong><br/>
                    <span style={{ opacity: 0.8 }}>3, E, D, C</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#2196f3', borderRadius: '4px', flexShrink: 0 }}></div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>Blue - Index</strong><br/>
                    <span style={{ opacity: 0.8 }}>4, 5, R, F, V, T, G, B</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid rgba(33, 150, 243, 0.3)',
              backgroundColor: 'rgba(33, 150, 243, 0.05)',
              padding: '16px'
            }}>
              <img 
                src="https://raw.githubusercontent.com/dumangasdarryl013008-alt/image2/main/A-Guide-on-Proper-Keyboard-Hand-placement0000494b7fb02a7.png" 
                alt="Finger Placement Guide"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{
                display: 'none',
                padding: '40px',
                textAlign: 'center',
                fontSize: '14px',
                opacity: 0.6
              }}>
                <p>📷 Finger placement guide image not found.</p>
              </div>
            </div>

            <div style={{
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid rgba(33, 150, 243, 0.3)',
              backgroundColor: 'rgba(33, 150, 243, 0.05)',
              height: '100%'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>👉 Right Hand</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#1565c0', borderRadius: '4px', flexShrink: 0 }}></div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>Dark Blue - Index</strong><br/>
                    <span style={{ opacity: 0.8 }}>6, 7, Y, H, N, U, J, M</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#03a9f4', borderRadius: '4px', flexShrink: 0 }}></div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>Light Blue - Middle</strong><br/>
                    <span style={{ opacity: 0.8 }}>8, I, K, ,</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#ffeb3b', borderRadius: '4px', flexShrink: 0 }}></div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>Yellow - Ring</strong><br/>
                    <span style={{ opacity: 0.8 }}>9, O, L, .</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#e91e63', borderRadius: '4px', flexShrink: 0 }}></div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <strong>Pink - Pinky</strong><br/>
                    <span style={{ opacity: 0.8 }}>0, P, ;, /</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            textAlign: 'center',
            fontSize: '13px',
            maxWidth: '1200px',
            marginTop: '16px'
          }}>
            <strong>💡 Tip:</strong> Keep your fingers on the home row (ASDF for left hand, JKL; for right hand) and stretch to reach other keys. Your index fingers are responsible for more keys!
          </div>

          <Box display="flex" gap={2} marginTop="16px">
            <button
              onClick={handleStartFingerPlacement}
              style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '16px 48px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2196f3';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Start Practice
            </button>
            <button
              onClick={handleBackToModeSelection}
              style={{
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                color: 'inherit',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.1)';
              }}
            >
              Back
            </button>
          </Box>
        </div>
      ) : showResults ? (
        <div className="stats-overlay" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px',
          gap: '8px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '4px', margin: 0 }}>⌨️ Results</h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>LPS</p>
              <h1 style={{ fontSize: '28px', margin: '4px 0' }}>{lettersPerSecond}</h1>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>Accuracy</p>
              <h1 style={{ fontSize: '28px', margin: '4px 0' }}>{accuracy}%</h1>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>Correct</p>
              <h2 style={{ fontSize: '18px', margin: '4px 0' }} className="correct-char-stats">{correctCount}</h2>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>Incorrect</p>
              <h2 style={{ fontSize: '18px', margin: '4px 0' }} className="incorrect-char-stats">{incorrectCount}</h2>
            </div>
          </div>

          <p style={{ fontSize: '12px', opacity: 0.7, margin: '4px 0' }}>Time: {countDownConstant}s</p>

          <Box display="flex" gap={1.5} marginTop="8px">
            <IconButton
              onClick={() => {
                resetStats();
              }}
              style={{
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                padding: '12px 24px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RestartAltIcon />
              <span>Try Again</span>
            </IconButton>
            <button
              onClick={handleBackToModeSelection}
              style={{
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                color: 'inherit',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
              }}
            >
              Change Mode
            </button>
          </Box>
        </div>
      ) : (
        <>
          {trainerMode === 'fingerPlacement' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              width: '100%',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Left Hand */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <HandSVG 
                  side="left" 
                  highlightedFinger={getFingerInfo(randomKey)?.hand === 'left' ? getFingerInfo(randomKey)?.fingerIndex : null}
                  highlightColor={getFingerInfo(randomKey)?.hand === 'left' ? getFingerInfo(randomKey)?.color : null}
                />
                <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>Left Hand</p>
              </div>

              {/* Keyboard */}
              <div className="keyboard">
                <input
                  className="hidden-input"
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  ref={keyboardRef}
                ></input>
                <ul className="row row-0">{row0Elements}</ul>
                <ul className="row row-1">{row1Elements}</ul>
                <ul className="row row-2">{row2Elements}</ul>
                <ul className="row row-3">{row3Elements}</ul>
                <ul className="row row-4">
                  <div className={getSpaceKeyClassName()} id="SPACE">
                    SPACE
                  </div>
                </ul>{" "}
                
                {/* Finger name display */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: '16px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  border: '2px solid rgba(33, 150, 243, 0.3)'
                }}>
                  <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>Use this finger:</p>
                  <h2 style={{ 
                    fontSize: '20px', 
                    margin: '4px 0',
                    fontWeight: 'bold',
                    color: '#2196f3'
                  }}>
                    👆 {getFingerName(randomKey)}
                  </h2>
                </div>
              </div>

              {/* Right Hand */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <HandSVG 
                  side="right" 
                  highlightedFinger={getFingerInfo(randomKey)?.hand === 'right' ? getFingerInfo(randomKey)?.fingerIndex : null}
                  highlightColor={getFingerInfo(randomKey)?.hand === 'right' ? getFingerInfo(randomKey)?.color : null}
                />
                <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>Right Hand</p>
              </div>
            </div>
          ) : (
            <div className="keyboard">
              <input
                className="hidden-input"
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                ref={keyboardRef}
              ></input>
              <ul className="row row-0">{row0Elements}</ul>
              <ul className="row row-1">{row1Elements}</ul>
              <ul className="row row-2">{row2Elements}</ul>
              <ul className="row row-3">{row3Elements}</ul>
              <ul className="row row-4">
                <div className={getSpaceKeyClassName()} id="SPACE">
                  SPACE
                </div>
              </ul>
            </div>
          )}
          <div className="keyboard-stats">
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {/* Live countdown timer - above accuracy */}
          <Box display="flex" alignItems="center" gap={2}>
            <h3 className={isTimerRunning ? (countDown < 10 ? "timer-warning" : "timer-countdown") : ""}>
              {countDownConstant === COUNT_DOWN_FREE ? '∞ Free Time' : `${countDown} s`}
            </h3>
            {countDownConstant === COUNT_DOWN_FREE && isTimerRunning && (
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setShowResults(true);
                }}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#388e3c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4caf50';
                }}
              >
                Finish
              </button>
            )}
            <IconButton
              aria-label="restart"
              size="small"
              onClick={() => {
                resetStats();
              }}
            >
              <RestartAltIcon />
            </IconButton>
          </Box>

          {/* Accuracy display */}
          <Box display="flex" flexDirection="row" gap={2}>
            <h3>Accuracy: {accuracy} %</h3>
            <h3>
              <span className="CorrectKeyDowns">{correctCount}</span>
              {"  "} {"/"} {"  "}
              <span className="IncorrectKeyDowns">{incorrectCount}</span>
            </h3>
          </Box>

          {/* Timer selection buttons - below accuracy */}
          <Box display="flex" flexDirection="row" gap={1} flexWrap="wrap" justifyContent="center">
            <IconButton onClick={() => handleTimerChange(COUNT_DOWN_90)}>
              <span className={getTimerButtonClassName(COUNT_DOWN_90)}>
                {COUNT_DOWN_90}
              </span>
            </IconButton>
            <IconButton onClick={() => handleTimerChange(COUNT_DOWN_60)}>
              <span className={getTimerButtonClassName(COUNT_DOWN_60)}>
                {COUNT_DOWN_60}
              </span>
            </IconButton>
            <IconButton onClick={() => handleTimerChange(COUNT_DOWN_30)}>
              <span className={getTimerButtonClassName(COUNT_DOWN_30)}>
                {COUNT_DOWN_30}
              </span>
            </IconButton>
            <IconButton onClick={() => handleTimerChange(COUNT_DOWN_15)}>
              <span className={getTimerButtonClassName(COUNT_DOWN_15)}>
                {COUNT_DOWN_15}
              </span>
            </IconButton>
            <IconButton onClick={() => handleTimerChange(COUNT_DOWN_FREE)}>
              <span className={getTimerButtonClassName(COUNT_DOWN_FREE)}>
                ∞
              </span>
            </IconButton>
          </Box>

          {/* Change Mode button */}
          <Box marginTop={1}>
            <button
              onClick={handleBackToModeSelection}
              style={{
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                color: 'inherit',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
              }}
            >
              Change Mode
            </button>
          </Box>
        </Box>
      </div>
        </>
      )}
    </div>
  );
};

export default DefaultKeyboard;
