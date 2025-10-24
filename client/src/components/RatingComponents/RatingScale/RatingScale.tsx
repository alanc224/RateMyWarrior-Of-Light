import React, { useState } from 'react'
import "./RatingScale.css"
interface RatingScaleProps {
  value: number;
  onChange?: (newValue: number | null) => void;
}
const RatingScale = ({value, onChange}: RatingScaleProps) => {
    const [hovered, setHovered] = useState<number | null>(null);
    const [selected, setSelected] = useState<number | null>(null); 
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const handleMouseEnter = (rating: number) => {
        setHovered(rating);
        setIsHovering(true);
    };
    const handleMouseLeave = () => {
        setHovered(null);
        setIsHovering(false);
    };
    const handleClick = (rating: number) => {
        setIsHovering(false);
        const newValue = selected === rating ? null : rating;
        setSelected(newValue);
        if (onChange) onChange(newValue);
    };
    const getBoxColor = (index: number) => {
        if (isHovering && hovered !== null) {
            if (index > hovered) {
                return;
            }
        }
        if (hovered !== null && hovered >= index) {
            if (index === 1) return 'rating-hover-1';
            if (index === 2) return 'rating-hover-2';
            if (index === 3) return 'rating-hover-3';
            if (index === 4) return 'rating-hover-4';
            if (index === 5) return 'rating-hover-5';
        }

        if (selected !== null && index <= selected) {
            if (index === 1) return 'rating-selected-1';
            if (index === 2) return 'rating-selected-2';
            if (index === 3) return 'rating-selected-3';
            if (index === 4) return 'rating-selected-4';
            if (index === 5) return 'rating-selected-5';
        }

        return;
    };
    return (
        <div className='rating-component'>
            <div className='rating-question'>
                <p>What do you rate your player??</p>
            </div>
            <p>Value is {value}</p>
            <div className="rating-boxes">
                <div
                    className={`rating-1 ${getBoxColor(1)}`}
                    onMouseEnter={() => handleMouseEnter(1)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(1)}
                ></div>
                <div
                    className={`rating-2 ${getBoxColor(2)}`}
                    onMouseEnter={() => handleMouseEnter(2)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(2)}
                ></div>
                <div
                    className={`rating-3 ${getBoxColor(3)}`}
                    onMouseEnter={() => handleMouseEnter(3)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(3)}
                ></div>
                <div
                    className={`rating-4 ${getBoxColor(4)}`}
                    onMouseEnter={() => handleMouseEnter(4)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(4)}
                ></div>
                <div
                    className={`rating-5 ${getBoxColor(5)}`}
                    onMouseEnter={() => handleMouseEnter(5)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(5)}
                ></div>
            </div>
        </div>
    )
}

export default RatingScale