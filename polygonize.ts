import { make_point, Point } from './Point';

export type Tile = { begin_x: number, end_x: number };

class Group {

	public point: Point;

	private refs = new Set<MergeableEdge>();

	add(ref: MergeableEdge) {
		this.refs.add(ref);
	}

	delete(pool: Group[], ref: MergeableEdge) {
		this.refs.delete(ref);
		if (this.refs.size == 0) {
			this.refs.clear();
			pool.push(this);
		}
	}

	merge_into(pool: Group[], group: Group) {
		for (const r of this.refs) {
			r.group = group;
			group.add(r);
		}
		this.refs.clear();
		pool.push(this);
	}

	size() {
		return this.refs.size;
	}

}

class MergeableEdge {

	constructor(public group: Group, public begin: Point, public end: Point) {
		group.add(this);
	}

	overlaps(e: MergeableEdge) {
		return e.end.x < this.begin.x && e.begin.x > this.end.x;
	}

	deref(group_pool: Group[]) {
		this.group.delete(group_pool, this);
	}

	merge(polygons: Set<Point>, group_pool: Group[], e: MergeableEdge) {
		this.begin.next = e.begin;
		e.end.next = this.end;
		if (this.group == e.group) {
			polygons.add(this.end);
		}
		else if (this.group.size() >= e.group.size()) {
			polygons.delete(this.group.point);
			this.group.point = e.group.point;
			e.group.merge_into(group_pool, this.group);
		}
		else {
			polygons.delete(this.group.point);
			this.group.merge_into(group_pool, e.group);
		}
		if (this.begin.x >= e.begin.x) {
			this.end = e.begin;
		}
		else {
			e.end = this.begin;
			this.deref(group_pool);
			return true;
		}
		return false;
	}

	to_top() {
		this.begin = this.begin.next;
		this.end = this.begin.next;
	}

}

const create_bottom_edge = (polygons: Set<Point>, pool: Group[], y: number, begin_x: number, end_x: number) => {
	const end = make_point(begin_x, y, null as unknown as Point);
	const begin =
		make_point(end_x, y,
		make_point(end_x, y + 1,
		make_point(begin_x, y + 1, end)));
	end.next = begin;
	const group = pool.pop() || new Group();
	group.point = begin.next;
	polygons.add(begin.next);
	return new MergeableEdge(group, begin, end);
};

const cleanup = (p: Point) => {
	let here = p;
	do {
		while (here.next != p && here.x == here.next.x && here.x == here.next.next.x) {
			here.next = here.next.next;
		}
		here = here.next;
	} while (here != p);
};

export const polygonize = (rows: Iterable<Iterable<Tile>>) => {
	const polygons = new Set<Point>();
	const group_pool: Group[] = [];
	let top_edges: MergeableEdge[] = [];
	let y = 0;
	for (const row of rows) {
		const next_top_edges: MergeableEdge[] = [];
		const bottom_edges: MergeableEdge[] = [];
		for (const tile of row) {
			const t = create_bottom_edge(polygons, group_pool, y, tile.begin_x, tile.end_x);
			bottom_edges.push(t);
		}
		let i = 0, j = 0;
		while (i < top_edges.length && j < bottom_edges.length) {
			if (top_edges[i].overlaps(bottom_edges[j])) {
				if (top_edges[i].merge(polygons, group_pool, bottom_edges[j])) {
					++i;
				}
				else {
					next_top_edges.push(bottom_edges[j++]);
				}
			}
			else if (top_edges[i].end.x < bottom_edges[j].end.x) {
				top_edges[i++].deref(group_pool);
			}
			else {
				next_top_edges.push(bottom_edges[j++]);
			}
		}
		while (i < top_edges.length) {
			top_edges[i++].deref(group_pool);
		}
		while (j < bottom_edges.length) {
			next_top_edges.push(bottom_edges[j++]);
		}
		for (const t of next_top_edges) {
			t.to_top();
		}
		top_edges = next_top_edges;
		++y;
	}
	return Array.from(polygons).map(p => (cleanup(p), p));
};
