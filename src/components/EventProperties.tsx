import React, { useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { updateEvent, addKeyframe, removeKeyframe, TimelineEvent, Effect, Keyframe } from '../store/slices/timelineSlice';
import '../styles/EventProperties.scss';

const EventProperties: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedEventId = useAppSelector(state => state.timeline.selectedEventId);
  const event = useAppSelector(state => 
    state.timeline.events.find(e => e.id === selectedEventId)
  );

  const [newKeyframe, setNewKeyframe] = useState<Keyframe>({ time: 0, value: 0 });

  if (!event) return null;

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    dispatch(updateEvent({ ...event, position: { ...event.position, [axis]: value } }));
  };

  const handleScaleChange = (axis: 'x' | 'y', value: number) => {
    dispatch(updateEvent({ ...event, scale: { ...event.scale, [axis]: value } }));
  };

  const handleRotationChange = (value: number) => {
    dispatch(updateEvent({ ...event, rotation: value }));
  };

  const handleAddKeyframe = (effectType: Effect['type']) => {
    dispatch(addKeyframe({ eventId: event.id, effectType, keyframe: newKeyframe }));
    setNewKeyframe({ time: 0, value: 0 });
  };

  const handleRemoveKeyframe = (effectType: Effect['type'], time: number) => {
    dispatch(removeKeyframe({ eventId: event.id, effectType, time }));
  };

  return (
    <div className="event-properties">
      <h3>Event Properties</h3>
      <div className="property">
        <label>Position X:</label>
        <input 
          type="number" 
          value={event.position.x} 
          onChange={(e) => handlePositionChange('x', Number(e.target.value))} 
        />
      </div>
      <div className="property">
        <label>Position Y:</label>
        <input 
          type="number" 
          value={event.position.y} 
          onChange={(e) => handlePositionChange('y', Number(e.target.value))} 
        />
      </div>
      <div className="property">
        <label>Scale X:</label>
        <input 
          type="number" 
          value={event.scale.x} 
          onChange={(e) => handleScaleChange('x', Number(e.target.value))} 
        />
      </div>
      <div className="property">
        <label>Scale Y:</label>
        <input 
          type="number" 
          value={event.scale.y} 
          onChange={(e) => handleScaleChange('y', Number(e.target.value))} 
        />
      </div>
      <div className="property">
        <label>Rotation:</label>
        <input 
          type="number" 
          value={event.rotation} 
          onChange={(e) => handleRotationChange(Number(e.target.value))} 
        />
      </div>

      <h4>Effects</h4>
      {['blur', 'brightness', 'contrast', 'saturation'].map((effectType) => (
        <div key={effectType} className="effect">
          <h5>{effectType}</h5>
          {event.effects.find(e => e.type === effectType)?.keyframes.map((keyframe, index) => (
            <div key={index} className="keyframe">
              <span>Time: {keyframe.time}, Value: {keyframe.value}</span>
              <button onClick={() => handleRemoveKeyframe(effectType as Effect['type'], keyframe.time)}>Remove</button>
            </div>
          ))}
          <div className="add-keyframe">
            <input 
              type="number" 
              placeholder="Time" 
              value={newKeyframe.time} 
              onChange={(e) => setNewKeyframe({ ...newKeyframe, time: Number(e.target.value) })} 
            />
            <input 
              type="number" 
              placeholder="Value" 
              value={newKeyframe.value} 
              onChange={(e) => setNewKeyframe({ ...newKeyframe, value: Number(e.target.value) })} 
            />
            <button onClick={() => handleAddKeyframe(effectType as Effect['type'])}>Add Keyframe</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventProperties;
