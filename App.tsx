import React, { useState, useRef } from 'react';
import Die from './components/Die';
import { useShake } from './hooks/useShake';
import { getDiceCommentary } from './services/geminiService';
import { DiceValue, RollResult } from './types';

const App: React.FC = () => {
  const [dice1, setDice1] = useState<DiceValue>(1);
  const [dice2, setDice2] = useState<DiceValue>(2); // Start with different values for visual interest
  const [rollId, setRollId] = useState(0); // Triggers animation
  const [isRolling, setIsRolling] = useState(false);
  const [commentary, setCommentary] = useState<string>("핸드폰을 흔들거나 버튼을 눌러주세요!");
  const [history, setHistory] = useState<RollResult[]>([]);
  
  // Ref to lock rolling state
  const rollingRef = useRef(false);

  const rollDice = async () => {
    if (rollingRef.current) return;
    rollingRef.current = true;
    setIsRolling(true);
    setCommentary("운명을 던지는 중..."); // Temporary text during spin

    // 1. Determine Result Immediately
    const finalD1 = Math.ceil(Math.random() * 6) as DiceValue;
    const finalD2 = Math.ceil(Math.random() * 6) as DiceValue;
    
    // 2. Trigger Animation
    setDice1(finalD1);
    setDice2(finalD2);
    setRollId(prev => prev + 1);

    // 3. Wait for Animation (1.2s matches CSS transition)
    // We fetch AI response during the animation to save time
    const aiPromise = getDiceCommentary(finalD1, finalD2);
    
    // Ensure we wait at least 1.2s for visual satisfaction
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const aiText = await aiPromise;
    setCommentary(aiText);

    // 4. Update History & Unlock
    const newResult: RollResult = {
      dice1: finalD1,
      dice2: finalD2,
      total: finalD1 + finalD2,
      timestamp: Date.now(),
      commentary: aiText
    };
    
    setHistory(prev => [newResult, ...prev].slice(0, 10));
    setIsRolling(false);
    rollingRef.current = false;
  };

  // Shake handler
  const { needsPermission, requestPermission } = useShake(rollDice, 25);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="p-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-2xl">🎲</span> AI Dice 3D
          </h1>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold bg-slate-800 px-2 py-1 rounded border border-slate-700">
            Gemini 2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full relative z-10">
        
        {/* Score Display */}
        <div className="mb-12 text-center scale-110">
          <h2 className="text-slate-400 uppercase tracking-[0.2em] text-xs font-bold mb-2">Total Score</h2>
          <div className={`text-7xl font-black text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-300 ${isRolling ? 'opacity-50 blur-sm scale-90' : 'opacity-100 scale-100'}`}>
            {isRolling ? '?' : dice1 + dice2}
          </div>
        </div>

        {/* 3D Dice Container */}
        <div className="flex gap-8 justify-center items-center py-6 perspective-[1000px]">
          <Die value={dice1} rollId={rollId} />
          <Die value={dice2} rollId={rollId} />
        </div>

        <div className="h-12"></div> {/* Spacer */}

        {/* Action Area */}
        <div className="w-full flex flex-col gap-4 mt-auto">
          <div className="min-h-[80px] bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 text-center border border-slate-700/50 flex items-center justify-center shadow-lg">
             <p className={`text-lg font-medium text-slate-200 transition-opacity duration-500 ${isRolling ? 'animate-pulse' : ''}`}>
               {commentary}
             </p>
          </div>

          <button
            onClick={rollDice}
            disabled={isRolling}
            className={`
              w-full py-4 rounded-2xl text-lg font-bold shadow-xl transition-all duration-300 transform
              ${isRolling 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed scale-95' 
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-purple-500/30 active:scale-95 hover:-translate-y-1'}
            `}
          >
            {isRolling ? '주사위가 구르는 중...' : '주사위 던지기'}
          </button>

          {needsPermission && (
            <button
              onClick={requestPermission}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Enable Shake (iOS)
            </button>
          )}
        </div>
      </main>

      {/* History Section (Collapsed look) */}
      <section className="mt-4 bg-slate-900/80 border-t border-slate-800 p-4 w-full max-w-md mx-auto backdrop-blur-sm z-10">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Rolls</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {history.length === 0 ? (
            <span className="text-slate-700 text-xs">기록 없음</span>
          ) : (
            history.map((record, idx) => (
              <div key={record.timestamp} className="flex-shrink-0 flex flex-col items-center bg-slate-800 p-2 rounded-lg border border-slate-700 w-16">
                <div className="flex gap-1 mb-1">
                  <div className="w-4 h-4 bg-slate-700 rounded-sm flex items-center justify-center text-[8px]">{record.dice1}</div>
                  <div className="w-4 h-4 bg-slate-700 rounded-sm flex items-center justify-center text-[8px]">{record.dice2}</div>
                </div>
                <span className="text-purple-400 font-bold text-sm">{record.total}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default App;
