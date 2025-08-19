import { Canvas } from "canvas";


export class CanvasDb {
  private _canvas;
  private _fieldSize;
  constructor(fieldSize: number) {
    this._fieldSize = fieldSize;
    this._canvas = Array.from(
      { length: fieldSize * fieldSize },
      () => "#FFFFFF"
    );
  }

  public clear() {
    this._canvas.fill("#FFFFFF");
  }

  public setPixel(location: [number, number], color: string): void {
    this._canvas[location[0] * this._fieldSize + location[1]] = color;
  }

  public setBatchPixels(pixels: [number, number][], color: string): void {
    pixels.forEach((location) => {
      this.setPixel(location, color);
    });
  }

  public getPixel(location: [number, number]): string {
    return this._canvas[location[0] * this._fieldSize + location[1]]!;
  }

  public getCanvasData(): string[][] {
    // convert 1d db to 2d db
    const result: string[][] = [];
    for (let i = 0; i < this._fieldSize; i++) {
      const row: string[] = [];
      for (let j = 0; j < this._fieldSize; j++) {
        row.push(this.getPixel([i, j]));
      }
      result.push(row);
    }
    return result;
  }

  public generateImage(): Buffer {
    const canvas = new Canvas(this._fieldSize * 4, this._fieldSize * 4, 'image');
    const ctx = canvas.getContext("2d");
    for (let i = 0; i < this._fieldSize; i++) {
        for(let j = 0; j < this._fieldSize; j++) {
            const color = this.getPixel([i, j]);
            ctx.fillStyle = color;
            ctx.fillRect(j * 4, i * 4, 4, 4);
        }
    }
    return canvas.toBuffer()
  }
}
