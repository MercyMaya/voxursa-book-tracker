import React, { useState } from 'react';

// Three SVG path definitions for star states (from Bootstrap Icons, MIT license)
const starEmptyPath = "M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z";
const starHalfPath = "M5.354 5.119 7.538.792A.52.52 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.54.54 0 0 1 16 6.32a.55.55 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.5.5 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.6.6 0 0 1 .085-.302.51.51 0 0 1 .37-.245zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.56.56 0 0 1 .162-.505l2.907-2.77-4.052-.576a.53.53 0 0 1-.393-.288L8.001 2.223 8 2.226z";
const starFullPath = "M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z";

interface StarRatingProps {
  value: number;               // current rating value (0 to 5, can be .5 increments)
  onChange?: (newValue: number) => void;  // if provided, makes the rating interactive
  className?: string;          // additional CSS classes for the container
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, className = '' }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;
  const floorVal = Math.floor(displayValue);
  const hasHalf = displayValue - floorVal >= 0.5;

  const handleMouseMove = (index: number, event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!onChange) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - left;
    // Determine if cursor is in left half or right half of the star
    const isHalf = x < width / 2;
    let newHover = index + (isHalf ? 0.5 : 1);
    if (newHover === 0) newHover = 0.5;  // ensure minimum half if at very start
    setHoverValue(newHover);
  };

  const handleMouseLeave = () => {
    if (!onChange) return;
    setHoverValue(null);
  };

  const handleClick = (index: number, event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!onChange) return;
    // Determine clicked value in the same way as hover
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - left;
    const isHalf = x < width / 2;
    const newValue = index + (isHalf ? 0.5 : 1);
    onChange(newValue);
    setHoverValue(null);
  };

  return (
    <div 
      className={`flex items-center ${onChange ? 'cursor-pointer' : ''} ${className}`} 
      onMouseLeave={handleMouseLeave}
    >
      {[0,1,2,3,4].map(i => {
        let starType: 'empty' | 'half' | 'full';
        if (i < floorVal) {
          starType = 'full';
        } else if (i === floorVal && hasHalf) {
          starType = 'half';
        } else {
          starType = 'empty';
        }

        const paths = {
          'full': starFullPath,
          'half': starHalfPath,
          'empty': starEmptyPath
        };
        const colorClass = starType === 'empty' ? 'text-gray-300' : 'text-yellow-500';

        return (
          <svg 
            key={i}
            viewBox="0 0 16 16" 
            fill="currentColor" 
            className={`w-6 h-6 transition-colors duration-200 ${colorClass} ${onChange ? 'hover:scale-110 transform transition-transform' : ''}`}
            onMouseMove={(e) => handleMouseMove(i, e)}
            onClick={(e) => handleClick(i, e)}
          >
            <path d={paths[starType]} />
          </svg>
        );
      })}
    </div>
  );
};

export default StarRating;
