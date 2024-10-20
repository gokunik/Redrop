type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function scaleRect(rect: Rect, scaleFactor: number): Rect {
  const { x, y, width, height } = rect;

  const newWidth = width * scaleFactor;
  const newHeight = height * scaleFactor;

  const newX = x + (width - newWidth) / 2;
  const newY = y + (height - newHeight) / 2;

  const newLeft = newX;
  const newTop = newY;
  const newRight = newLeft + newWidth;
  const newBottom = newTop + newHeight;

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
    top: newTop,
    right: newRight,
    bottom: newBottom,
    left: newLeft,
  };
}
