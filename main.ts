import { Tile, tilesToPolygons } from './polygonize';
import { traverse } from './traverse';

function toTiles(image: string[]) {
  const tiles: Tile[][] = [];
  for (const imageRow of image) {
    const row = [];
    let prevX: number;
    let flag = false;
    for (let i = 0; i < imageRow.length; ++i) {
      if (flag != (imageRow[i] == '#')) {
        flag = !flag;
        if (flag) {
          prevX = i;
        }
        else {
          row.push({ beginX: prevX, endX: i });
        }
      }
    }
    if (flag) {
      row.push({ beginX: prevX, endX: imageRow.length });
    }
    tiles.push(row);
  }
  return tiles;
}

tilesToPolygons(toTiles([
  ' #     # '
, '###   ###'
, ' ### ### '
, '  ## ##  '
, '    #    '
, '  ## ##  '
, ' ### ### '
, '###   ###'
, ' #     # '
])).forEach(traverse);