import { random } from './random';
const TURBULENCE_STEPS = 12;
export const turbulence = [] as [number, number][];

for (let i = 0; i < TURBULENCE_STEPS; i++) {
    turbulence.push([random(i * 2), random(i * 2 + 1)]);
}
