import { Point } from './Point';

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

export function traverse(p: Point) {
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