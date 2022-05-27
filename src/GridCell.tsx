import { Container, Graphics, Sprite, useTick } from '@inlet/react-pixi';
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    ZOOM_RANGE_CELLS,
    SCALE_MOUSE_ZOOM,
    STIR_STRENGTH,
    STIR_FREQUENCY,
    CELL_IMAGE_ZOOM,
    ZOOM_SPEED,
    DISPLAY,
    DisplayMode,
    SUBDIVISION,
    STIR_FREQUENCY_BASE_TIME,
    FLIP_CELLS,
    DISORDER,
} from './config';
import { lerp } from './math';
import { turbulence } from './turbulence';

type Props = {
    x: number;
    y: number;
    width: number;
    height: number;
    mouseTranslate: [number, number];
    source: string;
    position: [number, number];
    sourceWidth: number;
    sourceHeight: number;
};
export const GridCell: FunctionComponent<Props> = ({
    x,
    y,
    width,
    height,
    mouseTranslate,
    source,
    position,
    sourceWidth,
    sourceHeight,
}) => {
    const maskRef = useRef(null);

    const draw = useCallback(
        (g) => {
            const w = width / 2;
            const h = height / 2;
            g.clear();
            g.beginFill(0x900000);
            g.moveTo(-w, -h);
            g.lineTo(-w, h);
            g.lineTo(w, h);
            g.lineTo(w, -h);
            g.endFill();
        },
        [height, width]
    );
    const [scale, setScale] = useState(2);
    const [, setFrame] = useState(0);
    const [currentScale, setCurrentScale] = useState(1);
    const baseSize = useMemo(() => {
        const ratioX = (SUBDIVISION * width) / sourceWidth;
        const ratioY = (SUBDIVISION * height) / sourceHeight;
        const r = Math.max(ratioX, ratioY);
        return [sourceWidth * r, sourceHeight * r];
    }, [height, sourceHeight, sourceWidth, width]);

    const anchorBase = useMemo(() => {
        const range = 1 / SUBDIVISION;
        const anchorX = x * range + range / 2;
        const anchorY = y * range + range / 2;
        return [anchorX, anchorY];
    }, [x, y]);
    const [anchorScale, setAnchorScale] = useState(1);
    const mouseZoom = useCallback(() => {
        const speed = lerp(0.000001, 0.1, ZOOM_SPEED / 100);
        if (currentScale > scale + speed) {
            setCurrentScale(currentScale - speed);
        } else if (currentScale < scale - speed) {
            setCurrentScale(currentScale + speed);
        } else {
            setCurrentScale(scale);
        }
    }, [currentScale, scale]);

    useTick(() => {
        mouseZoom();
        turbulenceAnimation();
        setFrame((c) => c + 1); //keep updating
    });

    useEffect(() => {
        const trX = mouseTranslate[0];
        const positionX = x * width + width / 2;
        const rangeX = Math.abs(positionX - trX);

        const trY = mouseTranslate[1];
        const positionY = y * height + height / 2;
        const rangeY = Math.abs(positionY - trY);
        const cellsRangeY = Math.max(ZOOM_RANGE_CELLS - rangeY / height, 0) / ZOOM_RANGE_CELLS;
        const cellsRangeX = Math.max(ZOOM_RANGE_CELLS - rangeX / width, 0) / ZOOM_RANGE_CELLS;
        const cellsRange = Math.max(cellsRangeY * cellsRangeX);
        const imageZoom = getImageZoom();

        setAnchorScale(lerp(CELL_IMAGE_ZOOM, SCALE_MOUSE_ZOOM, cellsRange));
        const mouseZoom = getMouseImageZoom(imageZoom);
        switch (DISPLAY) {
            case DisplayMode.GRID:
                const scalePrcG = lerp(imageZoom, mouseZoom, cellsRange);
                setScale(scalePrcG);
                break;
            case DisplayMode.COLUMN:
                const scalePrcC = lerp(imageZoom, mouseZoom, cellsRangeX);
                setScale(scalePrcC);
                break;
            case DisplayMode.ROW:
                const scalePrcR = lerp(imageZoom, mouseZoom, cellsRangeY);
                setScale(scalePrcR);
                break;
        }
    }, [height, mouseTranslate, position, sourceHeight, sourceWidth, width, x, y]);

    const startTime = useMemo(() => {
        const turbulenceTime = Math.random() * STIR_FREQUENCY_BASE_TIME * 1000 * (DISORDER / 100);
        console.log('turbulenceTime', turbulenceTime);
        return Date.now() - turbulenceTime;
    }, []);
    const anchor = useMemo(() => {
        if (anchorScale < 0) {
            const anchorTranslateX = lerp(anchorBase[0], 0.5, anchorScale / -100);
            const anchorTranslateY = lerp(anchorBase[1], 0.5, anchorScale / -100);
            return [anchorTranslateX, anchorTranslateY];
        } else {
            return anchorBase;
        }
    }, [anchorBase, anchorScale]);
    const [turbulenceAnchor, setTurbulenceAnchor] = useState([anchor[0], anchor[1]]);

    const turbulenceAnimation = useCallback(() => {
        const currentTime = Date.now() - startTime;
        const turbulenceStepTime = lerp(STIR_FREQUENCY_BASE_TIME * 1000, 100, STIR_FREQUENCY / 100);
        const currentStep = Math.floor(currentTime / turbulenceStepTime) % turbulence.length;
        const targetStep = currentStep + 1 === turbulence.length ? 0 : currentStep + 1;
        const diffTime = currentTime % turbulenceStepTime;

        const stepX = lerp(turbulence[currentStep][0], turbulence[targetStep][0], diffTime / turbulenceStepTime);
        const stepY = lerp(turbulence[currentStep][1], turbulence[targetStep][1], diffTime / turbulenceStepTime);

        const strengthX = (stepX * STIR_STRENGTH) / 100;
        const strengthY = (stepY * STIR_STRENGTH) / 100;
        setTurbulenceAnchor([lerp(anchor[0], 1 - anchor[0], strengthX), lerp(anchor[1], 1 - anchor[1], strengthY)]);
    }, [anchor, startTime]);

    const flipX = useMemo(() => {
        if (x % 2 !== 0 && FLIP_CELLS) {
            return -1;
        } else return 1;
    }, [x]);
    const flipY = useMemo(() => {
        if (y % 2 !== 0 && FLIP_CELLS) {
            return -1;
        } else return 1;
    }, [y]);

    return (
        <Container mask={maskRef?.current} position={[x * width, y * height]} scale={[flipX, flipY]}>
            <Graphics name="mask" draw={draw} ref={maskRef} />
            <Sprite
                image={source}
                anchor={[turbulenceAnchor[0], turbulenceAnchor[1]]}
                width={baseSize[0] * (DISPLAY === DisplayMode.ROW ? 1 : currentScale)}
                height={baseSize[1] * (DISPLAY === DisplayMode.COLUMN ? 1 : currentScale)}
            />
        </Container>
    );
};

const ZOOM_MAX = 5;
const ZOOM_MOUSE = 0.01;

function getImageZoom() {
    if (CELL_IMAGE_ZOOM <= 0) {
        const minScale = 1 / SUBDIVISION;
        return lerp(minScale, 1, (100 + CELL_IMAGE_ZOOM) / 100);
    } else {
        return lerp(1, ZOOM_MAX, CELL_IMAGE_ZOOM / 100);
    }
}
function getMouseImageZoom(imageSize: number) {
    if (SCALE_MOUSE_ZOOM <= 0) {
        const minScale = 1 / SUBDIVISION;
        return lerp(minScale, 1, (100 + SCALE_MOUSE_ZOOM) / 100);
    } else {
        return lerp(1, SCALE_MOUSE_ZOOM * SCALE_MOUSE_ZOOM * ZOOM_MOUSE, SCALE_MOUSE_ZOOM / 100);
    }
}
