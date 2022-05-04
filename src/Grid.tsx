import { Container, useTick } from "@inlet/react-pixi";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SUBDIVISION, sourceDiamensions } from "./config";
import { GridCell } from "./GridCell";
type Props = {
  canvasSize: [number, number];
};
export const Grid: FunctionComponent<Props> = ({ canvasSize }) => {
  const [mouseTranslate, setMouseTranslation] = useState<[number, number]>([
    0, 0,
  ]);
  const [gridPosition, setGridPosition] = useState([0, 0]);
  const [cellWidth, setCellWidth] = useState(0);
  const [cellHeight, setCellHeight] = useState(0);
  const [heightGrid, setHeightGrid] = useState(SUBDIVISION);

  const changeTranslate = useCallback((e) => {
    setMouseTranslation([e.pageX, e.pageY]);
  }, []);

  const getInitialMousePosition = useCallback((e) => {
    // document.removeEventListener("mouseover", getInitialMousePosition);
    setMouseTranslation([e.pageX, e.pageY]);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", changeTranslate);
    // document.addEventListener("mouseover", getInitialMousePosition);
    return () => {
      document.removeEventListener("mousemove", changeTranslate);
    };
  }, [changeTranslate, getInitialMousePosition]);

  useEffect(() => {
    const gridCellWidth = canvasSize[0] / SUBDIVISION;
    const gridCellHeight =
      (sourceDiamensions[1] / sourceDiamensions[0]) * gridCellWidth;
    setCellWidth(gridCellWidth);
    setCellHeight(gridCellHeight);
    const gridHeight = Math.ceil(canvasSize[1] / gridCellHeight);
    setHeightGrid(gridHeight);
    const positionTop =
      gridCellHeight / 2 - (gridHeight * gridCellHeight - canvasSize[1]) / 2;
    setGridPosition([gridCellWidth / 2, positionTop]);
  }, [canvasSize, heightGrid]);

  const gridMap = useMemo(() => {
    const gridList = [] as number[][];

    for (let u = 0; u < heightGrid; u++) {
      const rowArray = [] as number[];
      for (let v = 0; v < SUBDIVISION; v++) {
        rowArray.push(1);
      }
      gridList.push(rowArray);
    }
    return gridList;
  }, [heightGrid]);

  return (
    <Container position={[gridPosition[0], gridPosition[1]]}>
      {gridMap.map((row, y) => {
        return (
          <Container key={y}>
            {row.map((cell, x) => {
              return (
                <GridCell
                  width={cellWidth}
                  height={cellHeight}
                  x={x}
                  y={y}
                  key={`${x}${y}`}
                  mouseTranslate={mouseTranslate}
                />
              );
            })}
          </Container>
        );
      })}
    </Container>
  );
};
