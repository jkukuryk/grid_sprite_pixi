import { Container, Graphics, Sprite } from "@inlet/react-pixi";
import source from "./assets/source.jpg";
import { FunctionComponent, useCallback, useRef } from "react";

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export const GridCell: FunctionComponent<Props> = ({ x, y, width, height }) => {
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

  return (
    <Container
      mask={maskRef?.current}
      position={[x * width, y * height]}
      anchor={0.5}
    >
      <Graphics name="mask" draw={draw} ref={maskRef} scale={[1, 1]} />
      <Sprite image={source} anchor={0.5} width={width} height={height} />
    </Container>
  );
};
