import React, { useEffect, useState, useRef } from 'react';
import { DiceValue } from '../types.ts';

interface DieProps {
  value: DiceValue;
  rollId: number; // Incrementing ID to trigger animation even if value is same
}

const Die: React.FC<DieProps> = ({ value, rollId }) => {
  const [rotation, setRotation] = useState({ x: -25, y: -25 }); // Initial slight tilt
  const isFirstRender = useRef(true);

  // Map each face to the rotation required to show it at the front
  // NOTE: This must match the CSS transforms in index.html
  // Front(1) is at 0,0.
  // Back(6) is at Y=180. To show it, we rotate Cube Y=180.
  // Top(2) is at X=90. To show it, we rotate Cube X=-90.
  // Bottom(5) is at X=-90. To show it, we rotate Cube X=90.
  // Right(3) is at Y=90. To show it, we rotate Cube Y=-90.
  // Left(4) is at Y=-90. To show it, we rotate Cube Y=90.
  const getTargetRotation = (val: DiceValue) => {
    switch (val) {
      case 1: return { x: 0, y: 0 };
      case 6: return { x: 180, y: 0 }; // Or x:0, y:180
      case 2: return { x: -90, y: 0 };
      case 5: return { x: 90, y: 0 };
      case 3: return { x: 0, y: -90 };
      case 4: return { x: 0, y: 90 };
      default: return { x: 0, y: 0 };
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const target = getTargetRotation(value);
    
    // Add randomness to rotation count (min 2 spins, max 4)
    // We add 720 (2 spins) + random extra spins
    const extraSpinsX = (2 + Math.floor(Math.random() * 2)) * 360;
    const extraSpinsY = (2 + Math.floor(Math.random() * 2)) * 360;

    // Calculate new total rotation ensuring we keep moving forward
    // Current rotation could be anything (e.g., 3600).
    // We want to land on a multiple of 360 + target.
    
    setRotation(prev => {
      // Find current base
      // We want to add to current, not replace.
      
      // Target logic:
      // We want (newRot % 360) ≈ target
      // So newRot = prev + delta
      
      // Actually simpler: Just add large spins + the difference to target
      // But we need to account for current modulo
      
      // Let's just blindly add spins to the target value?
      // No, if I'm at 360 and target is 90, I go to 90? That's backward.
      // I should go to 360 + 90.
      
      // Calculate effective target relative to current rotation
      // Standardize current to positive module if needed, but simple addition works best for visual flow.
      
      const currentModX = prev.x % 360;
      const currentModY = prev.y % 360;
      
      const diffX = target.x - currentModX;
      const diffY = target.y - currentModY;
      
      return {
        x: prev.x + diffX + extraSpinsX,
        y: prev.y + diffY + extraSpinsY
      };
    });

  }, [rollId, value]);

  const renderDots = (val: number) => {
    // 3x3 Grid indices
    // 0 1 2
    // 3 4 5
    // 6 7 8
    const dotMap: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };
    const active = dotMap[val] || [];
    return Array(9).fill(0).map((_, i) => (
      <div key={i} className="flex items-center justify-center">
        {active.includes(i) && <div className="dot" />}
      </div>
    ));
  };

  return (
    <div className="scene">
      <div 
        className="cube" 
        style={{ 
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        <div className="face face-1">{renderDots(1)}</div>
        <div className="face face-6">{renderDots(6)}</div>
        <div className="face face-2">{renderDots(2)}</div>
        <div className="face face-5">{renderDots(5)}</div>
        <div className="face face-3">{renderDots(3)}</div>
        <div className="face face-4">{renderDots(4)}</div>
      </div>
      <div className="floor-shadow"></div>
    </div>
  );
};

export default Die;