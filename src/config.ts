export const SUBDIVISION = 12;
export const SCALE_TURBULENCE = 0.1;

export const SCALE_MOUSE_ZOOM = 1;
export const CELL_IMAGE_ZOOM = 22;
export const ZOOM_RANGE_CELLS = 12;
export const TURBULANCE_STEP_TIME = 2000; //time between turbulence positions points in ms
export const TURBULANCE_TIME_NOISE = 77; //difference in time between cells in ms

export const ADD_SCALE = 0.1;
export const SUBTRACT_SCALE = 0.1;
export const MAX_BLUR = 3;

export enum DisplayMode {
    GRID = 'grid',
    COLUMN = 'column',
    ROW = 'row',
}
export const DISPLAY: DisplayMode = DisplayMode.GRID;
