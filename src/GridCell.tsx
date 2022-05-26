import { Container, Graphics, Sprite, useTick } from '@inlet/react-pixi';
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import gsap from 'gsap';
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
    turbulenceTime: number;
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
    turbulenceTime,
    position,
    sourceWidth,
    sourceHeight,
}) => {
    const maskRef = useRef(null);
    const [anchorTranslation] = useState({ x: 0, y: 0 });

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
    const [currentScale, setCurrentScale] = useState(SUBDIVISION);
    const startTime = useMemo(() => {
        return Date.now() - turbulenceTime;
    }, [turbulenceTime]);

    const mouseZoom = useCallback(() => {
        const maxSpeed = Math.abs(currentScale - scale) / Math.min(currentScale, scale);

        const speed = lerp(0.0001, maxSpeed, ZOOM_SPEED / 100);
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
        const minScale = 1 + getTurbulence() * 2;
        const imageZoom = getImageZoom();
        const mouseZoom = getMouseImageZoom(imageZoom);
        switch (DISPLAY) {
            case DisplayMode.GRID:
                const scalePrcG = lerp(imageZoom, mouseZoom, cellsRange);
                setScale(max([scalePrcG, minScale]));
                break;
            case DisplayMode.COLUMN:
                const scalePrcC = lerp(imageZoom, mouseZoom, cellsRangeX);
                setScale(max([scalePrcC, minScale]));
                break;
            case DisplayMode.ROW:
                const scalePrcR = lerp(imageZoom, mouseZoom, cellsRangeY);
                setScale(max([scalePrcR, minScale]));
                break;
        }
    }, [height, mouseTranslate, position, sourceHeight, sourceWidth, width, x, y]);

    const nextTranslation = useCallback(() => {
        if (STIR_FREQUENCY > 0) {
            const turbulenceStepTime = (STIR_FREQUENCY / 100) * (STIR_FREQUENCY_BASE_TIME * 1000);
            const currentTime = Date.now() - startTime;
            const targetStep = Math.ceil(currentTime / turbulenceStepTime) % turbulence.length;
            const diffTime = currentTime % turbulenceStepTime;
            const turbulenceRange = getTurbulence();
            gsap.to(anchorTranslation, {
                duration: (turbulenceStepTime - diffTime) / 1000,
                ease: 'back.inOut',
                y: (turbulence[targetStep][0] * turbulenceRange) / 2,
                x: (turbulence[targetStep][1] * turbulenceRange) / 2,
            }).then(nextTranslation);
        } else {
            setTimeout(nextTranslation, 1000);
        }
    }, [anchorTranslation, startTime]);

    useEffect(() => {
        nextTranslation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const anchorValue = useMemo(() => {
        const turbulenceRange = 1 - getTurbulence() * 2;
        const turbulenceStart = getTurbulence();
        let anchorX = turbulenceStart + (x / SUBDIVISION) * turbulenceRange;
        let anchorY = turbulenceStart + (y / SUBDIVISION) * turbulenceRange;
        if (DISPLAY === DisplayMode.ROW) {
            anchorX = 0.5;
        }
        if (DISPLAY === DisplayMode.COLUMN) {
            anchorY = 0.5;
        }

        return [anchorX, anchorY];
    }, [x, y]);

    const finalAnchor = useMemo(() => {
        return [
            anchorValue[0] + (DISPLAY === DisplayMode.ROW ? 0 : anchorTranslation.x),
            anchorValue[1] + (DISPLAY === DisplayMode.COLUMN ? 0 : anchorTranslation.y),
        ];
    }, [anchorTranslation.x, anchorTranslation.y, anchorValue]);
    const finalPosition = useMemo(() => {
        return [-width / 2 + width * finalAnchor[0], -height / 2 + height * finalAnchor[1]];
    }, [finalAnchor, height, width]);
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
                position={[finalPosition[0], finalPosition[1]]}
                anchor={[finalAnchor[0], finalAnchor[1]]}
                width={width * (DISPLAY === DisplayMode.ROW ? 1 : currentScale)}
                height={height * (DISPLAY === DisplayMode.COLUMN ? 1 : currentScale)}
            />
        </Container>
    );
};
const maxTurbulence = 0.5;
export function getTurbulence() {
    return lerp(0, maxTurbulence, STIR_STRENGTH / 100);
}
function max(values: number[]): number {
    let maxValue = 0;
    values.forEach((val, key) => {
        if (key === 0 && (val || val === 0)) {
            maxValue = val;
        } else {
            if (val && maxValue < val) {
                maxValue = val;
            }
        }
    });
    return maxValue;
}
const ZOOM_MIN = 1.4;
const ZOOM_MAX = 5;
const ZOOM_MOUSE_MAX = 200000;

function getImageZoom() {
    let zoom = Math.min(100, CELL_IMAGE_ZOOM);
    zoom = Math.max(0, zoom);
    return lerp(ZOOM_MIN, ZOOM_MAX, zoom / 100);
}
function getMouseImageZoom(imageSize: number) {
    // imageZoom 0
    if (SCALE_MOUSE_ZOOM > 0) {
        return lerp(imageSize, imageSize * ZOOM_MOUSE_MAX, SCALE_MOUSE_ZOOM / 100);
    } else {
        const removeScale = lerp(ZOOM_MIN, ZOOM_MAX, -SCALE_MOUSE_ZOOM / 100);
        if (imageSize - removeScale < ZOOM_MIN) {
            return ZOOM_MIN;
        } else {
            return removeScale;
        }
    }
}
