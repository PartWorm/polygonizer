export type Point = {
	x: number;
	y: number;
	next: Point;
};

export const make_point = (x: number, y: number, next: Point): Point =>
	({ x, y, next });
