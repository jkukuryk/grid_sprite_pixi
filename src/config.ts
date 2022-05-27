export const SUBDIVISION = 12;

export const CELL_IMAGE_ZOOM = 23; //-100 - 100
export const SCALE_MOUSE_ZOOM = 0; //-100 - 100
export const ZOOM_RANGE_CELLS = 15;

export const STIR_FREQUENCY = 0; //0-100
export const STIR_FREQUENCY_BASE_TIME = 4; //seconds
export const STIR_STRENGTH = 0; //0-100

export const DISORDER = 0; //0-100

export const ZOOM_SPEED = 100; //0-100;
export const FLIP_CELLS = false;

export enum DisplayMode {
    GRID = 'grid',
    COLUMN = 'column',
    ROW = 'row',
}
export const DISPLAY: DisplayMode = DisplayMode.GRID;
