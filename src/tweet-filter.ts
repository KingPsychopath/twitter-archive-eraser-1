import { createReadStream, PathLike } from "fs"
import assert = require('assert')
import csv = require('csv-parser')
import { Transform } from "stream";

const columns = (() => {
	const columnsWrap
		= {   'tweet_id'
		:'', 'in_reply_to_status_id'
		:'', 'in_reply_to_user_id'
		:'', 'timestamp'
		:'', 'source'
		:'', 'text'
		:'', 'retweeted_status_id'
		:'', 'retweeted_status_user_id'
		:'', 'retweeted_status_timestamp'
		:'', 'expanded_urls'
		:''}

	return Object.getOwnPropertyNames(columnsWrap) as (keyof typeof columnsWrap)[]
})()

type InputRow = {[keys in typeof columns[number]]: string}
export type Row = {[key in Exclude<keyof InputRow, 'timestamp' | 'retweeted_status_timestamp'>]: string} & {timestamp: number, retweeted_status_timestamp: number | null}

export const filterCSV = (filename: PathLike, filterFunc: (x: Row) => boolean) =>
	createReadStream(filename)
		.pipe(csv({strict: true}))
		.on('headers', (headers: string[]) => {
			const set = new Set(headers)
			assert(columns.every(v => set.has(v)), 'Unsupported columns syntax.')
		})
		.pipe(new Transform({objectMode: true, transform(chunk: InputRow, encoding, cb) {
			const row: Row = {
				...chunk,
				timestamp: new Date(chunk.timestamp).getTime(),
				retweeted_status_timestamp: chunk.retweeted_status_timestamp ? new Date(chunk.retweeted_status_timestamp).getTime() : null,
			}

			filterFunc(row) && this.push(row, encoding)
			cb()
		}}))
