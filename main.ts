import { Tile, tilesToPolygons } from './polygonize';
import { traverse } from './traverse';

function toTiles(image: string[]) {
  const tiles: Tile[][] = [];
  for (let imageRow of image) {
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

/*
tilesToPolygons([
  [{ beginX: 0, endX: 3 }]
, [{ beginX: 0, endX: 1 }, { beginX: 2, endX: 3 }]
, [{ beginX: 0, endX: 3 }]
]).forEach(p => traverse(p));
*/

/*
tilesToPolygons([
  [{ beginX: 0, endX: 3 }, { beginX: 4, endX: 7 } ]
, [{ beginX: 0, endX: 1 }, { beginX: 2, endX: 5 }, { beginX: 6, endX: 7 } ]
, [{ beginX: 0, endX: 3 }, { beginX: 4, endX: 7 } ]
]).forEach(traverse);
*/

tilesToPolygons(toTiles([
  '## ### ##'
, '# # # # #'
, ' ### ### '
, '# # # # #'
, '## ### ##'
, '# # # # #'
, ' ### ### '
, '# # # # #'
, '## ### ##'
])).forEach(traverse);

/*
tilesToPolygons(toTiles([
  '#####'
, '# # #'
, '## ##'
, '# # #'
, '#####'
])).forEach(traverse);
*/

/*
tilesToPolygons([
  [{ beginX: 0, endX: 3 }, { beginX: 4, endX: 7 }]
, [{ beginX: 0, endX: 1 }, { beginX: 2, endX: 5 }]
]).forEach(p => traverse(p));
*/