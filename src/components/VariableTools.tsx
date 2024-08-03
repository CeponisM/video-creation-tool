import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setZoom } from '../store/slices/timelineSlice';
import { toggleUnusedVariables } from '../store/slices/uiSlice';
import { setBackgroundColor, setDimensions } from '../store/slices/compositionSlice';
import MediaBrowser from './MediaBrowser';
import EventProperties from './EventProperties';
import '../styles/VariableTools.scss';

const VariableTools: React.FC = () => {
    const dispatch = useAppDispatch();
    const zoom = useAppSelector(state => state.timeline.zoom);
    const showUnused = useAppSelector(state => state.ui.showUnusedVariables);
    const { width, height, backgroundColor } = useAppSelector(state => state.composition);
    const [activeTab, setActiveTab] = useState<'variables' | 'media' | 'properties'>('variables');
    const [localBackgroundColor, setLocalBackgroundColor] = useState(backgroundColor);

    useEffect(() => {
        setLocalBackgroundColor(backgroundColor);
    }, [backgroundColor]);

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setZoom(Number(e.target.value)));
    };

    const toggleUnused = () => {
        dispatch(toggleUnusedVariables());
    };

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setDimensions({ width: Number(e.target.value), height }));
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setDimensions({ width, height: Number(e.target.value) }));
    };

    const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setLocalBackgroundColor(newColor);
        dispatch(setBackgroundColor(newColor));
    };

    return (
        <div className="variable-tools">
            <div className="tabs">
                <button
                    className={activeTab === 'variables' ? 'active' : ''}
                    onClick={() => setActiveTab('variables')}
                >
                    Variables
                </button>
                <button
                    className={activeTab === 'media' ? 'active' : ''}
                    onClick={() => setActiveTab('media')}
                >
                    Media
                </button>
                <button
                    className={activeTab === 'properties' ? 'active' : ''}
                    onClick={() => setActiveTab('properties')}
                >
                    Properties
                </button>
            </div>

            {activeTab === 'variables' && (
                <>
                    <h3>Composition Settings</h3>
                    <div className="tool">
                        <label htmlFor="width">Width:</label>
                        <input
                            type="number"
                            id="width"
                            value={width}
                            onChange={handleWidthChange}
                        />
                    </div>
                    <div className="tool">
                        <label htmlFor="height">Height:</label>
                        <input
                            type="number"
                            id="height"
                            value={height}
                            onChange={handleHeightChange}
                        />
                    </div>
                    <div className="tool">
                        <label htmlFor="background-color">Background Color:</label>
                        <input
                            type="color"
                            id="background-color"
                            value={localBackgroundColor}
                            onChange={handleBackgroundColorChange}
                        />
                    </div>

                    <h3>Viewer Settings</h3>
                    <div className="tool">
                        <label htmlFor="zoom">Zoom:</label>
                        <input
                            type="range"
                            id="zoom"
                            min="10"
                            max="200"
                            value={zoom}
                            onChange={handleZoomChange}
                        />
                        <span>{zoom}%</span>
                    </div>
                    <div className="tool">
                        <label htmlFor="show-unused">Show Unused:</label>
                        <input
                            type="checkbox"
                            id="show-unused"
                            checked={showUnused}
                            onChange={toggleUnused}
                        />
                    </div>
                </>
            )}

            {activeTab === 'media' && <MediaBrowser />}

            {activeTab === 'properties' && <EventProperties />}
        </div>
    );
};

export default VariableTools;
