type Tile = { beginX: number, endX: number };

class PointGroup {

  private parent: PointGroup;

  static merge(g1: PointGroup, g2: PointGroup) {
    const roots = g1.roots;
    const r1 = g1.root(), r2 = g2.root();
    roots.delete(r1);
    roots.delete(r2);
    const root = new PointGroup(roots, r1.anyPoint);
    r1.parent = root;
    r2.parent = root;
  }

  constructor(private roots: Set<PointGroup>, public anyPoint: Point) {
    roots.add(this);
  }

  root() {
    let here: PointGroup = this;
    while (here.parent) {
      here = here.parent;
    }
    return here;
  }
}

class Point {

  constructor(public group: PointGroup, public x: number, public y: number, public next?: Point) {}

  fork(groupRoots: Set<PointGroup>) {
    const group = new PointGroup(groupRoots, this);
    let here: Point = this;
    do {
      here.group = group;
      here = here.next;
    } while (here != this);
  }
}

class TopTile {

  constructor(public begin: Point, public end: Point) {}

  collides(t: BottomTile) {
    return t.end.x < this.begin.x && t.begin.x > this.end.x;
  }

  merge(pointGroupRoots: Set<PointGroup>, t: BottomTile) {
    this.begin.next = t.begin;
    t.end.next = this.end;
    if (this.begin.group.root() == t.begin.group.root()) {
      this.end.fork(pointGroupRoots);
    }
    else {
      PointGroup.merge(this.begin.group, t.begin.group);
    }
    let result: BottomTile;
    if (this.begin.x > t.begin.x) {
      this.end = t.begin;
    }
    else if (this.begin.x < t.begin.x) {
      result = new BottomTile(t.begin, this.begin);
      this.end = this.begin;
      this.begin = t.begin;
    }
    return result;
  }
}

class BottomTile {

  constructor(public begin: Point, public end: Point) {}

  toTopTile() {
    return new TopTile(this.begin.next, this.begin.next.next);
  }
}

function createBottomTile(groupRoots: Set<PointGroup>, y: number, beginX: number, endX: number): BottomTile {
  const group = new PointGroup(groupRoots, null);
  const begin = new Point(group, endX, y);
  const end = new Point(group, beginX, y);
  group.anyPoint = begin;
  end.next = begin;
  begin.next = new Point(group, endX, y + 1, new Point(group, beginX, y + 1, end));
  return new BottomTile(begin, end);
}

function tilesToPolygons(rows: Tile[][]) {
  const pointGroupRoots = new Set<PointGroup>();
  let topTiles: TopTile[] = [];
  let y = -1;
  for (const row of rows) {
    const nextTopTiles: BottomTile[] = [];
    const bottomTiles: BottomTile[] = [];
    for (const tile of row) {
      const t = createBottomTile(pointGroupRoots, y + 1, tile.beginX, tile.endX);
      bottomTiles.push(t);
      nextTopTiles.push(t);
    }
    while (topTiles.length > 0 && bottomTiles.length > 0) {
      if (topTiles[0].collides(bottomTiles[0])) {
        const top = topTiles[0];
        const bottom = bottomTiles[0];
        const result = top.merge(pointGroupRoots, bottom);
        if (result === undefined) {
          bottomTiles.shift();
        }
        else {
          topTiles.shift();
          bottomTiles[0] = result;
        }
      }
      else if (topTiles[0].end.x < bottomTiles[0].end.x) {
        topTiles.shift();
      }
      else {
        bottomTiles.shift();
      }
    }
    topTiles = [...nextTopTiles.map(t => t.toTopTile())].sort((a, b) => a.end.x - b.end.x);
    ++y;
  }
  return Array.from(pointGroupRoots).map(g => g.anyPoint);
}

function isClockwise(p: Point) {
  const origin = p;
  let sum = 0;
  do {
    sum += (p.next.x + p.x) * (p.next.y - p.y);
    p = p.next;
  } while (p != origin);
  return sum > 0;
}

function scanline(p: Point, minY: number, maxY: number) {
  const image = [];
  const origin = p;
  const edges = [];
  const clockwise = isClockwise(p);
  do {
    if (p.y < p.next.y) {
      edges.push({ begin: p, end: p.next });
    }
    else if (p.y > p.next.y) {
      edges.push({ begin: p.next, end: p });
    }
    p = p.next;
  } while (p != origin);
  edges.sort((e, f) => e.begin.y - f.begin.y);
  let active = [];
  for (let y = minY; y < maxY; ++y) {
    active = active.filter(e => e.end.y > y);
    while (edges.length > 0 && edges[0].begin.y <= y) {
      active.push(edges.shift());
    }
    active.sort((e, f) => e.begin.x - f.begin.x);
    let line = '';
    let flag = false;
    let prevX = 0;
    for (const e of active) {
      flag = !flag;
      if (flag) {
        for (let x = prevX; x < e.begin.x; ++x) {
          line += ' ';
        }
      }
      else {
        for (let x = prevX; x < e.begin.x; ++x) {
          line += clockwise ? '#' : '^';
        }
      }
      prevX = e.begin.x;
    }
    image.push(line);
  }
  return image.join('\n');
}

function traverse(p: Point) {
  const origin = p;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;
  const arr = [];
  do {
    arr[p.y] = arr[p.y] || [];
    arr[p.y][p.x] = true;
    minY = Math.min(p.y, minY);
    maxY = Math.max(p.y, maxY);
    p = p.next;
  } while (p != origin);
  console.log(scanline(p, minY, maxY));
  console.log('Traverse end');
}

function toTiles(image: string[]) {
  const tiles: Tile[][] = [];
  for (let imageRow of image) {
    imageRow += ' ';
    const row = [];
    let prevX: number;
    let prev = ' ';
    for (let i = 0; i < imageRow.length; ++i) {
      if (prev != imageRow[i]) {
        if (imageRow[i] == '#') {
          prevX = i;
        }
        else {
          row.push({ beginX: prevX, endX: i });
        }
        prev = imageRow[i];
      }
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
  ' # #'
, '#####'
, '# # #'
, '# # #'
, '## ##'
, ' # #'
])).forEach(traverse);

/*
tilesToPolygons([
  [{ beginX: 0, endX: 3 }, { beginX: 4, endX: 7 }]
, [{ beginX: 0, endX: 1 }, { beginX: 2, endX: 5 }]
]).forEach(p => traverse(p));
*/