import { Container, Text } from '@inlet/react-pixi';
import { TextStyle } from 'pixi.js';
import { Loader } from '@pixi/loaders';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { DisplayMode, SUBDIVISION } from './config';
import { GridCell } from './GridCell';
import source from './assets/source.jpg';

type Props = {
    canvasSize: [number, number];
    displayMode: DisplayMode;
};
export const Grid: FunctionComponent<Props> = ({ canvasSize, displayMode }) => {
    const [mouseTranslate, setMouseTranslation] = useState<[number, number]>([0, 0]);
    const [cellWidth, setCellWidth] = useState(0);
    const [cellHeight, setCellHeight] = useState(0);
    const [heightGrid, setHeightGrid] = useState(1);
    const [widthGrid, setWidthGrid] = useState(1);
    const [sourceDimensions, setSourceDimensions] = useState([0, 0]);
    const [gridSize, setGridSize] = useState(canvasSize);

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
                setSourceDimensions([sourceLoaded.data.width, sourceLoaded.data.height]);
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
        switch (displayMode) {
            case DisplayMode.GRID:
                gridCellWidth = canvasSize[0] / SUBDIVISION;
                gridCellHeight = (sourceDimensions[1] / sourceDimensions[0]) * gridCellWidth;
                if (gridCellHeight * SUBDIVISION < canvasSize[1]) {
                    gridCellHeight = canvasSize[1] / SUBDIVISION;
                    gridCellWidth = (sourceDimensions[0] / sourceDimensions[1]) * gridCellHeight;
                }
                setGridSize([gridCellWidth * SUBDIVISION, gridCellHeight * SUBDIVISION]);
                setHeightGrid(SUBDIVISION);
                setWidthGrid(SUBDIVISION);
                break;
            case DisplayMode.ROW:
                gridCellWidth = canvasSize[0];
                gridCellHeight = canvasSize[1] / SUBDIVISION;
                setHeightGrid(SUBDIVISION);
                setWidthGrid(1);

                break;
            case DisplayMode.COLUMN:
                gridCellWidth = canvasSize[0] / SUBDIVISION;
                gridCellHeight = canvasSize[1];
                setHeightGrid(1);
                setWidthGrid(SUBDIVISION);

                break;
        }

        setCellWidth(gridCellWidth);
        setCellHeight(gridCellHeight);
    }, [canvasSize, heightGrid, sourceDimensions, displayMode]);

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
        <Container anchor={0.5} position={[canvasSize[0] / 2, canvasSize[1] / 2]}>
            {cellWidth ? (
                <>
                    {gridMap.map((row, y) => {
                        return (
                            <Container key={y}>
                                {row.map((cell, x) => {
                                    let position = [0, 0];
                                    let translate = [0, 0];

                                    if (displayMode === DisplayMode.GRID) {
                                        position = [
                                            -gridSize[0] / 2 + (x / SUBDIVISION) * gridSize[0] + cellWidth / 2,
                                            -gridSize[1] / 2 + (y / SUBDIVISION) * gridSize[1] + cellHeight / 2,
                                        ];
                                        translate = [
                                            mouseTranslate[0] - canvasSize[0] / 2,
                                            mouseTranslate[1] - canvasSize[1] / 2,
                                        ];
                                    }

                                    if (displayMode === DisplayMode.ROW) {
                                        position[0] = 0;
                                        position[1] = mouseTranslate[1] - canvasSize[1] / 2;
                                        translate = [...mouseTranslate];
                                    }

                                    if (displayMode === DisplayMode.COLUMN) {
                                        position[1] = 0;
                                        position[0] = mouseTranslate[0] - canvasSize[0] / 2;
                                        translate = [...mouseTranslate];
                                    }

                                    return (
                                        <GridCell
                                            width={cellWidth}
                                            height={cellHeight}
                                            x={x}
                                            y={y}
                                            key={`${x}${y}`}
                                            mouseTranslate={[translate[0], translate[1]]}
                                            source={source}
                                            position={[position[0], position[1]]}
                                            sourceWidth={sourceDimensions[0]}
                                            sourceHeight={sourceDimensions[1]}
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
