import { Point } from './Point';

const is_clockwise = (p: Point) => {
	const origin = p;
	let sum = 0;
	do {
		sum += (p.next.x + p.x) * (p.next.y - p.y);
		p = p.next;
	} while (p != origin);
	return sum > 0;
};

const scanline = (p: Point, min_y: number, max_y: number) => {
	const image = [];
	const origin = p;
	const edges = [];
	const clockwise = is_clockwise(p);
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
	for (let y = min_y; y < max_y; ++y) {
		active = active.filter(e => e.end.y > y);
		while (edges.length > 0 && edges[0].begin.y <= y) {
			active.push(edges.shift());
		}
		active.sort((e, f) => e.begin.x - f.begin.x);
		let line = '';
		let flag = false;
		let prev_x = 0;
		for (const e of active) {
			flag = !flag;
			if (flag) {
				for (let x = prev_x; x < e.begin.x; ++x) {
					line += ' ';
				}
			}
			else {
				for (let x = prev_x; x < e.begin.x; ++x) {
					line += clockwise ? '#' : '^';
				}
			}
			prev_x = e.begin.x;
		}
		image.push(line);
	}
	return image.join('\n');
};

export const traverse = (p: Point) => {
	const origin = p;
	let min_y = Number.MAX_SAFE_INTEGER;
	let max_y = Number.MIN_SAFE_INTEGER;
	const arr = [];
	do {
		arr[p.y] = arr[p.y] || [];
		arr[p.y][p.x] = true;
		min_y = Math.min(p.y, min_y);
		max_y = Math.max(p.y, max_y);
		p = p.next;
	} while (p != origin);
	console.log(scanline(p, min_y, max_y));
	console.log('Traverse end');
};
