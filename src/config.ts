export const SUBDIVISION = 8;
export const SCALE_TURBULENCE = 0.1;

export const SCALE_MOUSE_ZOOM = 1.3;
export const CELL_IMAGE_ZOOM = 6;
export const ZOOM_RANGE_CELLS = 2;
export const TURBULANCE_STEP_TIME = 2000; //time between turbulence positions points in ms
export const TURBULANCE_TIME_NOISE = 77; //difference in time between cells in ms

export const ADD_SCALE = 0.02;
export const SUBTRACT_SCALE = 0.1;
export enum DisplayMode {
    GRID = 'grid',
    COLUMN = 'column',
    ROW = 'row',
}
export const DISPLAY: DisplayMode = DisplayMode.ROW;
