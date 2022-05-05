import { Stage } from "@inlet/react-pixi";
import { useCallback, useEffect, useState } from "react";
import { Grid } from "./Grid";

function App() {
  const [canvasSize, setCanvasSize] = useState<[number, number]>([0, 0]);

  const setViewScale = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setCanvasSize([vw, vh]);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", setViewScale);
    setViewScale();
    return () => {
      window.removeEventListener("resize", setViewScale);
    };
  }, [setViewScale]);
  return (
    <Stage
      options={{
        resolution: window.devicePixelRatio,
        autoDensity: true,
        backgroundColor: 0xe6e6e6,
      }}
      width={window.innerWidth}
      height={window.innerHeight}
    >
      <Grid canvasSize={canvasSize} />
    </Stage>
  );
}

export default App;
