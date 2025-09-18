import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, text, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState('top');
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  // Smart positioning logic
  const calculatePosition = () => {
    if (!wrapperRef.current || !tooltipRef.current) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Check if there's enough space above
    const spaceAbove = wrapperRect.top;
    const spaceBelow = viewportHeight - wrapperRect.bottom;
    const tooltipHeight = tooltipRect.height || 40; // Estimate if not measured yet

    // Use 'bottom' position if not enough space above
    if (spaceAbove < tooltipHeight + 10 && spaceBelow > tooltipHeight + 10) {
      setPosition('bottom');
    } else {
      setPosition('top');
    }
  };

  const handleMouseEnter = () => {
    setTimeout(() => {
      setIsVisible(true);
      setTimeout(calculatePosition, 10);
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  // Only show pointer if the child is a button or link
  const child = React.Children.only(children);
  const isInteractive =
    child.type === 'button' ||
    child.type === 'a' ||
    (child.props && child.props.onClick);

  return (
    <div
      ref={wrapperRef}
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={isInteractive ? { cursor: 'pointer' } : undefined}
    >
      {React.cloneElement(child, {
        // Remove pointer cursor for non-interactive icons
        style: isInteractive
          ? { ...child.props.style, cursor: 'pointer' }
          : { ...child.props.style, cursor: 'default' }
      })}
      <div
        ref={tooltipRef}
        className={`tooltip tooltip-${position} ${isVisible ? 'visible' : ''}`}
        style={{
          opacity: isVisible ? 1 : 0,
          pointerEvents: 'none', // <-- Fix: Tooltip never captures mouse events
          transform:
            position === 'top'
              ? `translateX(-50%) translateY(${isVisible ? 0 : -5}px)`
              : `translateX(-50%) translateY(${isVisible ? 0 : 5}px)`
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
