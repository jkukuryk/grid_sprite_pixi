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
    const drawDebug = useCallback(
        (g) => {
            const w = width / 2;
            const h = height / 2;
            g.clear();
            g.lineStyle(3, 0x900000, 5);
            g.moveTo(-w, -h);
            g.lineTo(-w, h);
            g.lineTo(w, h);
            g.lineTo(w, -h);
            g.lineTo(-w, -h);
        },
        [height, width]
    );
    const [scale, setScale] = useState(1);
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
        const speed = lerp(0.000001, 1, ZOOM_SPEED / 100);
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
        const trY = mouseTranslate[1];

        const a = Math.abs(trX - width * x - width / 2);
        const b = Math.abs(trY - height * y - height / 2);

        const imageZoom = getImageZoom();
        const mouseZoom = getMouseImageZoom();

        switch (DISPLAY) {
            case DisplayMode.GRID:
                let gridRadius = ZOOM_RANGE_CELLS * Math.max(width, height);
                const cellsRange = 1 - Math.sqrt(a * a + b * b) / gridRadius;
                setAnchorScale(lerp(CELL_IMAGE_ZOOM, SCALE_MOUSE_ZOOM, cellsRange));
                const scalePrcG = lerp(imageZoom, mouseZoom, cellsRange);
                setScale(scalePrcG);
                break;
            case DisplayMode.COLUMN:
                let radiusX = ZOOM_RANGE_CELLS * width;
                const cellsRangeX = Math.min(a, radiusX);
                const scalePrcC = lerp(mouseZoom, imageZoom, cellsRangeX / radiusX);
                setAnchorScale(lerp(CELL_IMAGE_ZOOM, SCALE_MOUSE_ZOOM, cellsRangeX));

                setScale(scalePrcC);
                break;
            case DisplayMode.ROW:
                let radiusY = ZOOM_RANGE_CELLS * height;
                const cellsRangeY = Math.min(b, radiusY);
                const scalePrcR = lerp(mouseZoom, imageZoom, cellsRangeY / radiusY);
                setAnchorScale(lerp(CELL_IMAGE_ZOOM, SCALE_MOUSE_ZOOM, cellsRangeY));

                setScale(scalePrcR);
                break;
        }
    }, [height, mouseTranslate, sourceHeight, width, x, y]);

    const startTime = useMemo(() => {
        const turbulenceTime = Math.random() * STIR_FREQUENCY_BASE_TIME * 1000 * (DISORDER / 100);
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
        setTurbulenceAnchor([
            DISPLAY === DisplayMode.ROW ? 0.5 : lerp(anchor[0], 1 - anchor[0], strengthX),
            DISPLAY === DisplayMode.COLUMN ? 0.5 : lerp(anchor[1], 1 - anchor[1], strengthY),
        ]);
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
    const spritePosition = useMemo(() => {
        switch (DISPLAY) {
            case DisplayMode.GRID:
                return [0, 0];
            case DisplayMode.ROW:
                const heightSource = (sourceHeight / sourceWidth) * width;
                const positionY = lerp(heightSource / 2 - height / 2, -heightSource / 2 + height / 2, y / SUBDIVISION);
                const zoomPositionRow = lerp(0, positionY, Math.min(0, CELL_IMAGE_ZOOM / 100));
                return [0, zoomPositionRow];
            case DisplayMode.COLUMN:
                const widthSource = (sourceWidth / sourceHeight) * height;
                const positionX = lerp(widthSource / 2 - width / 2, -widthSource / 2 + width / 2, x / SUBDIVISION);
                const zoomPositionColumn = lerp(0, positionX, Math.min(0, CELL_IMAGE_ZOOM / 100));
                return [zoomPositionColumn, 0];
        }
    }, [height, sourceHeight, sourceWidth, width, x, y]);

    const imageSize = useMemo(() => {
        switch (DISPLAY) {
            case DisplayMode.GRID:
                return [baseSize[0] * currentScale, baseSize[1] * currentScale];
            case DisplayMode.ROW:
                return [width, height * currentScale * SUBDIVISION];
            case DisplayMode.COLUMN:
                console.log('currentScale', currentScale);
                return [width * currentScale * SUBDIVISION, height];
        }
    }, [baseSize, currentScale, height, width]);
    return (
        <Container mask={maskRef?.current} position={[position[0], position[1]]} scale={[flipX, flipY]}>
            <Graphics name="mask" draw={draw} ref={maskRef} />
            <Sprite
                image={source}
                anchor={[turbulenceAnchor[0], turbulenceAnchor[1]]}
                width={imageSize[0]}
                height={imageSize[1]}
                position={[spritePosition[0], spritePosition[1]]}
            />
            {/* <Graphics name="debug" draw={drawDebug} /> */}
        </Container>
    );
};

function getImageZoom() {
    if (CELL_IMAGE_ZOOM <= 0) {
        const minScale = 1 / SUBDIVISION;
        return lerp(minScale, 1, (100 + CELL_IMAGE_ZOOM) / 100);
    } else {
        return lerp(1, CELL_IMAGE_ZOOM, CELL_IMAGE_ZOOM / 100);
    }
}
function getMouseImageZoom() {
    if (SCALE_MOUSE_ZOOM <= 0) {
        const minScale = 1 / SUBDIVISION;
        return lerp(minScale, 1, (100 + SCALE_MOUSE_ZOOM) / 100);
    } else {
        return lerp(1, SCALE_MOUSE_ZOOM, SCALE_MOUSE_ZOOM / 100);
    }
}
