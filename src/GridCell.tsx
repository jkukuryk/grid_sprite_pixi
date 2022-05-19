import { Container, Graphics, Sprite, useTick } from '@inlet/react-pixi';
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
    ZOOM_RANGE_CELLS,
    SCALE_MOUSE_ZOOM,
    SCALE_TURBULENCE,
    TURBULANCE_STEP_TIME,
    CELL_IMAGE_ZOOM,
    ADD_SCALE,
    SUBTRACT_SCALE,
    DISPLAY,
    DisplayMode,
    SUBDIVISION,
} from './config';
import { turbulence } from './turbulance';
import { lerp } from './math';

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
        if (currentScale > scale + SUBTRACT_SCALE) {
            setCurrentScale(currentScale - SUBTRACT_SCALE);
        } else if (currentScale < scale - ADD_SCALE) {
            setCurrentScale(currentScale + ADD_SCALE);
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
        const minScale = 1 + getTurbulance() * 2;
        switch (DISPLAY) {
            case DisplayMode.GRID:
                const scalePrcG = lerp(CELL_IMAGE_ZOOM, SCALE_MOUSE_ZOOM, cellsRange);
                setScale(max([scalePrcG, minScale]));
                break;
            case DisplayMode.COLUMN:
                const scalePrcC = lerp(CELL_IMAGE_ZOOM, SCALE_MOUSE_ZOOM, cellsRangeX);
                setScale(max([scalePrcC, minScale]));
                break;
            case DisplayMode.ROW:
                const scalePrcR = lerp(CELL_IMAGE_ZOOM, SCALE_MOUSE_ZOOM, cellsRangeY);
                setScale(max([scalePrcR, minScale]));
                break;
        }
    }, [height, mouseTranslate, position, sourceHeight, sourceWidth, width, x, y]);

    const nextTranslation = useCallback(() => {
        const currentTime = Date.now() - startTime;
        const targetStep = Math.ceil(currentTime / TURBULANCE_STEP_TIME) % turbulence.length;
        const diffTime = currentTime % TURBULANCE_STEP_TIME;
        const turbulanceRange = getTurbulance();
        gsap.to(anchorTranslation, {
            duration: (TURBULANCE_STEP_TIME - diffTime) / 1000,
            ease: 'power1.inOut',
            y: (turbulence[targetStep][0] * turbulanceRange) / 2,
            x: (turbulence[targetStep][1] * turbulanceRange) / 2,
        }).then(nextTranslation);
    }, [anchorTranslation, startTime]);

    useEffect(() => {
        nextTranslation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const anchorValue = useMemo(() => {
        const turbulanceRange = 1 - getTurbulance() * 2;
        const turbulanceStart = getTurbulance();
        let anchorX = turbulanceStart + (x / SUBDIVISION) * turbulanceRange;
        let anchorY = turbulanceStart + (y / SUBDIVISION) * turbulanceRange;
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
            anchorValue[0] + (DISPLAY === DisplayMode.ROW ? 0 : anchorTranslation.y),
            anchorValue[1] + (DISPLAY === DisplayMode.COLUMN ? 0 : anchorTranslation.x),
        ];
    }, [anchorTranslation.x, anchorTranslation.y, anchorValue]);
    const finalPosition = useMemo(() => {
        return [-width / 2 + width * finalAnchor[0], -height / 2 + height * finalAnchor[1]];
    }, [finalAnchor, height, width]);
    return (
        <Container mask={maskRef?.current} position={[x * width, y * height]}>
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

export function getTurbulance() {
    return Math.min(0.1, SCALE_TURBULENCE);
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
