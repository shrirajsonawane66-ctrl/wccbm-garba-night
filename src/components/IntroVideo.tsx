import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroVideoProps {
  onComplete: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SESSION_KEY = 'garba_intro_played';
  const INTRO_DURATION = 3000; // 3 seconds
  const FADE_DURATION = 600; // 600ms fade out

  // Check if intro was already played in this session
  const checkSession = useCallback(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  }, []);

  const markSession = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  }, []);

  // Handle video end or error - start fade out
  const handleVideoEnd = useCallback(() => {
    if (!isVisible) return;
    
    markSession();
    
    // Start fade out
    setIsVisible(false);
    
    // Call onComplete after fade animation
    fadeTimeoutRef.current = setTimeout(() => {
      onComplete();
    }, FADE_DURATION);
  }, [isVisible, markSession, onComplete, FADE_DURATION]);

  // Handle video playing
  const handlePlaying = useCallback(() => {
    setIsPlaying(true);
    
    // Set timeout for 3 seconds
    timeoutRef.current = setTimeout(() => {
      handleVideoEnd();
    }, INTRO_DURATION);
  }, [INTRO_DURATION, handleVideoEnd]);

  // Handle video error - fail gracefully
  const handleError = useCallback(() => {
    setHasError(true);
    handleVideoEnd();
  }, [handleVideoEnd]);

  // Handle video loaded metadata - try to play
  const handleLoadedMeta = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay failed, try muted play
        video.muted = true;
        video.play().catch(() => {
          handleError();
        });
      });
    }
  }, [handleError]);

  // Mount effect - check session and set up
  useEffect(() => {
    // Check if already played this session
    if (checkSession()) {
      setIsVisible(false);
      // Call onComplete immediately if already played
      onComplete();
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      markSession();
      setIsVisible(false);
      onComplete();
      return;
    }

    // Set up video
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      
      // Try to play
      video.play().catch(() => {
        // If autoplay fails, try with user interaction fallback
        handleError();
      });
    }

    return cleanup;
  }, [checkSession, markSession, onComplete, handleError, cleanup]);

  // Don't render if not visible and animation complete
  if (!isVisible) {
    return null;
  }

  // If error occurred, don't show video
  if (hasError) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: FADE_DURATION / 1000, ease: 'easeOut' }}
        className="fixed inset-0 z-[100] w-full h-full overflow-hidden"
        role="presentation"
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          src="/video/20260927_174848_0_UTC_0.mp4"
          autoPlay
          muted
          playsInline
          loop={false}
          onPlaying={handlePlaying}
          onEnded={handleVideoEnd}
          onError={handleError}
          onLoadedMetadata={handleLoadedMeta}
          className="w-full h-full object-cover"
          poster="/og-image.jpg"
        />
      </motion.div>
    </AnimatePresence>
  );
};