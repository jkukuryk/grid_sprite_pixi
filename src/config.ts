export const SUBDIVISION = 12;

export const SCALE_MOUSE_ZOOM = 5;
export const CELL_IMAGE_ZOOM = 2;
export const ZOOM_RANGE_CELLS = 12;

export const STIR_FREQUENCY = 23; //0-100
export const STIR_FREQUENCY_BASE_TIME = 4; //secounds
export const STIR_STRANGTH = 1; //0-100

export const DISORDER = 5; //0-100

export const ADD_SCALE = 0.001;
export const SUBTRACT_SCALE = 0.007;
export const FLIP_CELLS = true;

export enum DisplayMode {
    GRID = 'grid',
    COLUMN = 'column',
    ROW = 'row',
}
export const DISPLAY: DisplayMode = DisplayMode.GRID;
