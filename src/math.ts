export function degreesToRadians(degrees: number) {
  if (degrees) {
    return (degrees * Math.PI) / 180;
  }
  return 0;
}
