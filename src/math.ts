export function degreesToRadians(degrees: number) {
    if (degrees) {
        return (degrees * Math.PI) / 180;
    }
    return 0;
}

export function lerp(min: number, max: number, value: number) {
    const MARGIN = 0.00000001;
    let returnValue = 0;
    if (value <= 0) {
        return min + MARGIN;
    }
    if (value >= 1) {
        return max - MARGIN;
    }

    if (max > min) {
        const range = max - min;
        const addedValue = range * value;
        returnValue = min + addedValue;
    } else {
        const invertMin = min * -1;
        const invertMax = max * -1;
        const invertRange = invertMax - invertMin;
        const addedInvertValue = invertRange * value;
        returnValue = (invertMin + addedInvertValue) * -1;
    }
    return returnValue;
}
