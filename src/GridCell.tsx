import { Container, Graphics, Sprite } from "@inlet/react-pixi";
import source from "./assets/source.jpg";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ZOOM_RANGE_CELLS, SCALE_MOUSE_ZOOM } from "./config";

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  mouseTranslate: [number, number];
};
export const GridCell: FunctionComponent<Props> = ({
  x,
  y,
  width,
  height,
  mouseTranslate,
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
  const [scale, setScale] = useState(1);
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
    const scalePrc = 1 + (SCALE_MOUSE_ZOOM * cellsRange) / ZOOM_RANGE_CELLS;

    setScale(scalePrc);
  }, [height, mouseTranslate, width, x, y]);
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
        width={width * scale}
        height={height * scale}
      />
    </Container>
  );
};
