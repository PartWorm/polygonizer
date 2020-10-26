import { Point } from './Point';

export type Tile = { beginX: number, endX: number };

class PointGroup {

  private parent: PointGroup;

  static merge(roots: Set<PointGroup>, g1: PointGroup, g2: PointGroup) {
    const r1 = g1.root(), r2 = g2.root();
    roots.delete(r1);
    roots.delete(r2);
    const root = new PointGroup(roots, r2.anyPoint);
    r1.parent = root;
    r2.parent = root;
  }

  constructor(roots: Set<PointGroup>, public anyPoint: GroupedPoint) {
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

class GroupedPoint implements Point {

  constructor(public group: PointGroup, public x: number, public y: number, public next: GroupedPoint) {}

  fork(groupRoots: Set<PointGroup>) {
    const group = new PointGroup(groupRoots, this);
    let here: GroupedPoint = this;
    do {
      here.group = group;
      here = here.next;
    } while (here != this);
  }
}

class TopTile {

  constructor(public begin: GroupedPoint, public end: GroupedPoint) {}

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
      PointGroup.merge(pointGroupRoots, this.begin.group, t.begin.group);
    }
    let result: BottomTile;
    if (this.begin.x > t.begin.x) {
      this.end = t.begin;
    }
    else if (this.begin.x < t.begin.x) {
      result = new BottomTile(t.begin, this.begin);
    }
    return result;
  }
}

class BottomTile {

  constructor(public begin: GroupedPoint, public end: GroupedPoint) {}

  toTopTile() {
    return new TopTile(this.begin.next, this.begin.next.next);
  }
}

function createBottomTile(groupRoots: Set<PointGroup>, y: number, beginX: number, endX: number): BottomTile {
  const group = new PointGroup(groupRoots, null);
  const begin = new GroupedPoint(group, endX, y, null);
  const end = new GroupedPoint(group, beginX, y, null);
  end.next = begin;
  begin.next = new GroupedPoint(group, endX, y + 1, new GroupedPoint(group, beginX, y + 1, end));
  group.anyPoint = begin;
  return new BottomTile(begin, end);
}

export function tilesToPolygons(rows: Tile[][]) {
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