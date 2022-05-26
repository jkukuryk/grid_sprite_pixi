export const SUBDIVISION = 13;

export const CELL_IMAGE_ZOOM = 1; //0 - 100
export const SCALE_MOUSE_ZOOM = 100; //-100 - 100
export const ZOOM_RANGE_CELLS = 13;

export const STIR_FREQUENCY = 45; //0-100
export const STIR_FREQUENCY_BASE_TIME = 12; //seconds
export const STIR_STRENGTH = 100; //0-100

export const DISORDER = 5; //0-100

export const ZOOM_SPEED = 100; //0-100;
export const FLIP_CELLS = true;

export enum DisplayMode {
    GRID = 'grid',
    COLUMN = 'column',
    ROW = 'row',
}
export const DISPLAY: DisplayMode = DisplayMode.GRID;
