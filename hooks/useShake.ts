import { useState, useEffect, useCallback, useRef } from 'react';

// iOS 13+ types
interface DeviceMotionEventiOS extends DeviceMotionEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export const useShake = (onShake: () => void, threshold = 20) => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const lastZ = useRef<number>(0);
  const lastTime = useRef<number>(0);

  // Check if permission is needed (iOS 13+)
  // Safety check: ensure DeviceMotionEvent is defined before accessing it
  const needsPermission = 
    typeof DeviceMotionEvent !== 'undefined' && 
    typeof (DeviceMotionEvent as unknown as DeviceMotionEventiOS).requestPermission === 'function';

  const requestPermission = async () => {
    if (needsPermission) {
      try {
        const response = await (DeviceMotionEvent as unknown as DeviceMotionEventiOS).requestPermission?.();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          alert("흔들기 기능을 사용하려면 권한이 필요합니다.");
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const current = event.accelerationIncludingGravity;
    if (!current) return;

    const currentTime = Date.now();
    // Debounce to 100ms
    if ((currentTime - lastTime.current) > 100) {
      const diffTime = currentTime - lastTime.current;
      lastTime.current = currentTime;

      const x = current.x || 0;
      const y = current.y || 0;
      const z = current.z || 0;

      const speed = Math.abs(x + y + z - lastX.current - lastY.current - lastZ.current) / diffTime * 10000;

      if (speed > threshold) {
        onShake();
      }

      lastX.current = x;
      lastY.current = y;
      lastZ.current = z;
    }
  }, [onShake, threshold]);

  useEffect(() => {
    // If permission is granted or not needed, add listener
    if (permissionGranted || !needsPermission) {
      // Check if device actually supports it
      if (typeof window.DeviceMotionEvent === 'undefined') {
        setIsSupported(false);
        return;
      }

      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (typeof window.DeviceMotionEvent !== 'undefined') {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [permissionGranted, needsPermission, handleMotion]);

  return {
    isSupported,
    needsPermission: needsPermission && !permissionGranted,
    requestPermission
  };
};
