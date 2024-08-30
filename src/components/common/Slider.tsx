import React from 'react';
import '../../styles/components/common/_Slider.scss';

interface SliderProps {
  label?: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ label, min, max, value, onChange, step = 1, className = '' }) => {
  return (
    <div className={`ae-slider-container ${className}`}>
      {label && <label className="ae-slider-label">{label}</label>}
      <input
        type="range"
        className="ae-slider"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};

export default Slider;