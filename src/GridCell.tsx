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
        const cellsRangeY = Math.max(ZOOM_RANGE_CELLS - rangeY / height, 0);
        const cellsRangeX = Math.max(ZOOM_RANGE_CELLS - rangeX / width, 0);
        const cellsRange = Math.max(cellsRangeY * cellsRangeX, ZOOM_RANGE_CELLS);
        const turbulance = getTurbulance();
        const scalePrc = 1 + turbulance + (SCALE_MOUSE_ZOOM * cellsRange) / ZOOM_RANGE_CELLS;
        const cellZoom = CELL_IMAGE_ZOOM - turbulance * CELL_IMAGE_ZOOM;

        setScale(Math.max(cellZoom, scalePrc, 1));
    }, [height, mouseTranslate, position, width, x, y]);

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

    const imageSize = useMemo(() => {
        switch (DISPLAY) {
            case DisplayMode.GRID:
                return [width, height];
            case DisplayMode.ROW:
                const cellHeight = height * Math.max(1, CELL_IMAGE_ZOOM);
                return [width, cellHeight];
            case DisplayMode.COLUMN:
                const cellWidth = width * 2 * Math.max(1, CELL_IMAGE_ZOOM);
                return [cellWidth, height];
        }
    }, [height, width]);
    return (
        <Container mask={maskRef?.current} position={[x * width, y * height]} anchor={0.5}>
            <Graphics name="mask" draw={draw} ref={maskRef} scale={[1, 1]} />
            <Sprite
                image={source}
                anchor={[
                    anchorValue[0] + (DISPLAY === DisplayMode.ROW ? 0 : anchorTranslation.y),
                    anchorValue[1] + (DISPLAY === DisplayMode.COLUMN ? 0 : anchorTranslation.x),
                ]}
                width={imageSize[0] * (DISPLAY === DisplayMode.ROW ? 1 : currentScale)}
                height={imageSize[1] * (DISPLAY === DisplayMode.COLUMN ? 1 : currentScale)}
            />
        </Container>
    );
};

export function getTurbulance() {
    return Math.min(0.1, SCALE_TURBULENCE);
}
