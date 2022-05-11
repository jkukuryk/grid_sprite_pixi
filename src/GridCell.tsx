import { Container, Graphics, Sprite, useTick } from '@inlet/react-pixi';
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ZOOM_RANGE_CELLS, SCALE_MOUSE_ZOOM, SCALE_TURBULENCE, TURBULANCE_STEP_TIME, CELL_IMAGE_ZOOM } from './config';
import { turbulence } from './turbulance';
import { lerp } from './math';
const ADD_SCALE = 0.03;
const SUBTRACT_SCALE = 0.01;
type Props = {
    x: number;
    y: number;
    width: number;
    height: number;
    mouseTranslate: [number, number];
    source: string;
    turbulenceTime: number;
    position: [number, number];
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
}) => {
    const maskRef = useRef(null);
    const [anchorPosition, setAnchorPosition] = useState([0.5, 0.5]);

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
    const [currentScale, setCurrentScale] = useState(12);
    const startTime = useMemo(() => {
        return Date.now() - turbulenceTime;
    }, [turbulenceTime]);
    const [translation] = useState({ x: 0, y: 0 });

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
        //todo get this value from ... ?

        const anchorX = 0.1 + turbulance + lerp(0, 0.8 - turbulance, position[0]);
        const anchorY = 0.1 + turbulance + lerp(0, 0.8 - turbulance, position[1]);
        setAnchorPosition([anchorX, anchorY]);
        setScale(Math.max(CELL_IMAGE_ZOOM, scalePrc));
        console.log('scale', scalePrc);
    }, [height, mouseTranslate, position, width, x, y]);

    const nextTranslation = useCallback(() => {
        const currentTime = Date.now() - startTime;
        const targetStep = Math.ceil(currentTime / TURBULANCE_STEP_TIME) % turbulence.length;
        const diffTime = currentTime % TURBULANCE_STEP_TIME;
        const turbulance = getTurbulance();

        gsap.to(translation, {
            duration: (TURBULANCE_STEP_TIME - diffTime) / 1000,
            ease: 'power1.inOut',
            y: (-turbulance * width) / 2 + turbulence[targetStep][0] * turbulance * width,
            x: (-turbulance * height) / 2 + turbulence[targetStep][1] * turbulance * height,
        }).then(nextTranslation);
    }, [height, startTime, translation, width]);

    useEffect(() => {
        nextTranslation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container mask={maskRef?.current} position={[x * width, y * height]} anchor={0.5}>
            <Graphics name="mask" draw={draw} ref={maskRef} scale={[1, 1]} />
            <Sprite
                image={source}
                anchor={[anchorPosition[0], anchorPosition[1]]}
                width={width * currentScale}
                height={height * currentScale}
                position={[translation.x * currentScale, translation.y * currentScale]}
            />
        </Container>
    );
};

function getTurbulance() {
    return Math.min(0.2, SCALE_TURBULENCE);
}
