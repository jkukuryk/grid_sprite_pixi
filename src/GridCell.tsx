import { Container, Graphics, Sprite, useTick } from "@inlet/react-pixi";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ZOOM_RANGE_CELLS, SCALE_MOUSE_ZOOM, SCALE_TURBULENCE } from "./config";
import { turbulence } from "./turbulance";
const ADD_SCALE = 0.03;
const SUBTRACT_SCALE = 0.01;
type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  mouseTranslate: [number, number];
  source: string;
};
export const GridCell: FunctionComponent<Props> = ({
  x,
  y,
  width,
  height,
  mouseTranslate,
  source,
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
  const [currentScale, setCurrentScale] = useState(2);
  const [turbulaceRange, setTurbulaceRange] = useState([0, 0]);
  const [turbulencePosition, setTurbulencePosition] = useState([1, 1]);
  const [turbulenceStepValue, setTurbulenceStepValue] = useState([0, 0]);
  const [turbulenceStep, setTurbulenceStep] = useState(0);
  const [turbulenceTarget, setTurbulenceTarget] = useState([0, 0]);

  const mouseZoom = useCallback(() => {
    if (currentScale > scale + SUBTRACT_SCALE) {
      setCurrentScale(currentScale - SUBTRACT_SCALE);
    } else if (currentScale < scale - ADD_SCALE) {
      setCurrentScale(currentScale + ADD_SCALE);
    } else {
      setCurrentScale(scale);
    }
  }, [currentScale, scale]);

  const turbulenceInterval = useCallback(() => {
    if (
      turbulencePosition[0] === turbulenceTarget[0] &&
      turbulencePosition[1] === turbulenceTarget[1]
    ) {
      const newStep = (turbulenceStep + 1) % turbulence.length;

      setTurbulenceStep(newStep);
      setTurbulenceTarget(turbulence[newStep]);

      const rangeX =
        (turbulence[turbulenceStep][0] - turbulence[newStep][0]) / 10;
      const rangeY =
        (turbulence[turbulenceStep][1] - turbulence[newStep][1]) / 10;
      setTurbulenceStepValue([rangeX, rangeY]);
      setTurbulencePosition((current) => {
        return [turbulence[turbulenceStep][0], turbulence[turbulenceStep][1]];
      });
    } else {
      setTurbulencePosition((current) => {
        return [
          current[0] + turbulenceStepValue[1],
          current[1] + turbulenceStepValue[1],
        ];
      });
    }
  }, [
    turbulencePosition,
    turbulenceStep,
    turbulenceStepValue,
    turbulenceTarget,
  ]);
  useTick((delta) => {
    //turbulance
    mouseZoom();
    turbulenceInterval();
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
    const scalePrc =
      1 + SCALE_TURBULENCE + (SCALE_MOUSE_ZOOM * cellsRange) / ZOOM_RANGE_CELLS;
    setScale(scalePrc);
  }, [height, mouseTranslate, width, x, y]);

  useEffect(() => {
    const turbulanceWidth = (width * SCALE_TURBULENCE) / 2;
    const turbulanceHeight = (height * SCALE_TURBULENCE) / 2;
    setTurbulaceRange([turbulanceWidth, turbulanceHeight]);
  }, [height, width]);

  return (
    <Container
      mask={maskRef?.current}
      position={[x * width, y * height]}
      anchor={0.5}
    >
      <Graphics name="mask" draw={draw} ref={maskRef} scale={[1, 1]} />
      <Sprite
        image={source}
        anchor={0.5}
        width={width * currentScale}
        height={height * currentScale}
        position={[
          turbulencePosition[0] * turbulaceRange[0] * currentScale,
          turbulencePosition[1] * turbulaceRange[1] * currentScale,
        ]}
      />
    </Container>
  );
};
