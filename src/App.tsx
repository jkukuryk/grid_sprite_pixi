import { Stage } from '@inlet/react-pixi';
import { useCallback, useEffect, useState } from 'react';
import { DISPLAY, DisplayMode } from './config';
import { Grid } from './Grid';

function App() {
    const [canvasSize, setCanvasSize] = useState<[number, number]>([0, 0]);

    const setViewScale = useCallback(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        setCanvasSize([vw, vh]);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', setViewScale);
        setViewScale();
        return () => {
            window.removeEventListener('resize', setViewScale);
        };
    }, [setViewScale]);
    return (
        <Stage
            options={{
                resolution: window.devicePixelRatio,
                autoDensity: true,
                backgroundColor: 0xe6e6e6,
            }}
            width={window.innerWidth}
            height={window.innerHeight}
        >
            {DisplayMode.GRID === DISPLAY && <Grid canvasSize={canvasSize} displayMode={DisplayMode.GRID} />}
            {DisplayMode.COLUMN === DISPLAY && <Grid canvasSize={canvasSize} displayMode={DisplayMode.COLUMN} />}
            {DisplayMode.ROW === DISPLAY && <Grid canvasSize={canvasSize} displayMode={DisplayMode.ROW} />}
        </Stage>
    );
}

export default App;
