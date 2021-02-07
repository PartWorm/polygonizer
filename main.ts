import { Tile, polygonize } from './polygonize';
import { traverse } from './traverse';

function to_tiles(image: string[]) {
	const tiles: Tile[][] = [];
	for (const image_row of image) {
		const row = [];
		let prev_x: number;
		let flag = false;
		for (let i = 0; i < image_row.length; ++i) {
			if (flag != (image_row[i] == '#')) {
				flag = !flag;
				if (flag) {
					prev_x = i;
				}
				else {
					row.push({ begin_x: prev_x, end_x: i });
				}
			}
		}
		if (flag) {
			row.push({ begin_x: prev_x, end_x: image_row.length });
		}
		tiles.push(row);
	}
	return tiles;
}

polygonize(to_tiles([
	' ####### '
,	'##     ##'
,	' ##   ## '
,	'  #####  '
,	'    #    '
,	'  ## ##  '
,	' ### ### '
,	'###   ###'
,	' #     # '
])).forEach(traverse);
