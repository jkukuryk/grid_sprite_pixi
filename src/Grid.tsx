import { Container, Text } from '@inlet/react-pixi';
import { TextStyle } from 'pixi.js';
import { Loader } from '@pixi/loaders';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { DISPLAY, DisplayMode, SUBDIVISION, DISORDER, STIR_FREQUENCY } from './config';
import { GridCell } from './GridCell';
import source from './assets/source.jpg';

type Props = {
    canvasSize: [number, number];
};
export const Grid: FunctionComponent<Props> = ({ canvasSize }) => {
    const [mouseTranslate, setMouseTranslation] = useState<[number, number]>([0, 0]);
    const [gridPosition, setGridPosition] = useState([0, 0]);
    const [cellWidth, setCellWidth] = useState(0);
    const [cellHeight, setCellHeight] = useState(0);
    const [heightGrid, setHeightGrid] = useState(1);
    const [widthGrid, setWidthGrid] = useState(1);
    const [sourceDiamensions, setSourceDiamensions] = useState([0, 0]);

    const changeTranslate = useCallback((e) => {
        setMouseTranslation([e.pageX, e.pageY]);
    }, []);

    const getInitialMousePosition = useCallback((e) => {
        // document.removeEventListener("mouseover", getInitialMousePosition);
        setMouseTranslation([e.pageX, e.pageY]);
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', changeTranslate);
        // document.addEventListener("mouseover", getInitialMousePosition);
        const loader = new Loader();
        loader.add(source);
        loader.load((res) => {
            try {
                const sourceKey = Object.keys(res.resources)[0];
                const sourceLoaded = res.resources[sourceKey];
                setSourceDiamensions([sourceLoaded.data.width, sourceLoaded.data.height]);
            } catch (error) {
                console.error('error while loading sprite', error);
            }
        });
        return () => {
            document.removeEventListener('mousemove', changeTranslate);
        };
    }, [changeTranslate, getInitialMousePosition]);

    useEffect(() => {
        let gridCellWidth = 0;
        let gridCellHeight = 0;
        switch (DISPLAY) {
            case DisplayMode.GRID:
                gridCellWidth = canvasSize[0] / SUBDIVISION;
                gridCellHeight = (sourceDiamensions[1] / sourceDiamensions[0]) * gridCellWidth;
                const gridHeight = Math.ceil(canvasSize[1] / gridCellHeight);
                setHeightGrid(gridHeight);
                setWidthGrid(SUBDIVISION);
                const positionTop = gridCellHeight / 2 - (gridHeight * gridCellHeight - canvasSize[1]) / 2;
                setGridPosition([gridCellWidth / 2, positionTop]);
                break;
            case DisplayMode.ROW:
                gridCellWidth = canvasSize[0];
                gridCellHeight = canvasSize[1] / SUBDIVISION;
                setGridPosition([canvasSize[0] / 2, gridCellHeight / 2]);
                setHeightGrid(SUBDIVISION);
                setWidthGrid(1);

                break;
            case DisplayMode.COLUMN:
                gridCellWidth = canvasSize[0] / SUBDIVISION;
                gridCellHeight = canvasSize[1];
                setGridPosition([gridCellWidth / 2, canvasSize[1] / 2]);
                setHeightGrid(1);
                setWidthGrid(SUBDIVISION);

                break;
        }

        setCellWidth(gridCellWidth);
        setCellHeight(gridCellHeight);
    }, [canvasSize, heightGrid, sourceDiamensions]);

    const gridMap = useMemo(() => {
        const gridList = [] as number[][];

        for (let u = 0; u < heightGrid; u++) {
            const rowArray = [] as number[];
            for (let v = 0; v < widthGrid; v++) {
                rowArray.push(1);
            }
            gridList.push(rowArray);
        }
        return gridList;
    }, [heightGrid, widthGrid]);

    return (
        <Container position={[gridPosition[0], gridPosition[1]]}>
            {cellWidth ? (
                <>
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
                                            source={source}
                                            turbulenceTime={y + x * (DISORDER / 100) * STIR_FREQUENCY}
                                            position={[x / row.length, y / gridMap.length]}
                                            sourceWidth={sourceDiamensions[0]}
                                            sourceHeight={sourceDiamensions[1]}
                                        />
                                    );
                                })}
                            </Container>
                        );
                    })}
                </>
            ) : (
                <Text
                    text="Loading..."
                    anchor={0.5}
                    position={[canvasSize[0] / 2, canvasSize[1] / 2]}
                    style={
                        new TextStyle({
                            align: 'center',
                            fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
                            fontSize: 50,
                            fontWeight: 'bold',
                            fill: '#3b3535', // gradient
                        })
                    }
                />
            )}
        </Container>
    );
};
