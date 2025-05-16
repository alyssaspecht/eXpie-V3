import { useState, useEffect } from 'react';

interface ExpieCharacterProps {
  triggerAnimation?: boolean;
}

export function ExpieCharacter({ triggerAnimation = false }: ExpieCharacterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'bounce' | 'wiggle' | 'scale'>('bounce');
  
  useEffect(() => {
    if (triggerAnimation && !isAnimating) {
      // Randomly select animation type
      const animations = ['bounce', 'wiggle', 'scale'] as const;
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
      
      setAnimationType(randomAnimation);
      setIsAnimating(true);
      
      // Reset animation after a short duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500); // Animation lasts 1.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [triggerAnimation, isAnimating]);
  
  const getAnimationClass = () => {
    if (!isAnimating) return '';
    
    switch (animationType) {
      case 'bounce':
        return 'animate-bounce';
      case 'wiggle':
        return 'animate-wiggle';
      case 'scale':
        return 'animate-scale';
      default:
        return 'animate-bounce';
    }
  };
  
  return (
    <div className="fixed top-2 left-24 z-50 select-none pointer-events-none">
      <img 
        src="/images/expie-character.png" 
        alt="eXpie Character" 
        width={45}
        height={45}
        className={`transition-all duration-300 ${getAnimationClass()}`}
      />
    </div>
  );
}

// This is a global singleton to control the character animations
// to ensure we only have one animation at a time
export const expieCharacterController = {
  _listeners: [] as ((value: boolean) => void)[],
  
  addListener(callback: (value: boolean) => void) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  },
  
  triggerAnimation() {
    this._listeners.forEach(listener => listener(true));
  }
};

// Hook to connect components to the character animation system
export function useExpieCharacter() {
  const [triggerAnimation, setTriggerAnimation] = useState(false);
  
  useEffect(() => {
    return expieCharacterController.addListener(setTriggerAnimation);
  }, []);
  
  return {
    triggerAnimation,
    animateExpie: () => expieCharacterController.triggerAnimation()
  };
}