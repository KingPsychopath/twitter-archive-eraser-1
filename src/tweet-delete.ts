import Twit = require('twit')

const queuedCalls = (size: number = 8, queue: (() => Promise<void>)[] = []) => {
	const next = () => {
		if (size <= 0) return

		const item = queue.shift()
		if (item == null) return

		--size
		const cb = () => ++size && next()
		item().then(cb, cb)
	}

	return (f: () => Promise<void>) => {
		queue.push(f)
		size > 0 && next()
	}
}

export const deleteTwit = ({T, queue}: {T: Twit, queue: (f: () => Promise<void>) => void}) => (id: string) =>
	queue(() =>
		new Promise(ok =>
			T.post('/statuses/destroy/:id', {id, trim_user: true}, (e, d: any) => {
				if (e) console.log(`Failed: https://twitter.com/a/status/${id}`)
				else console.log(`Success: https://twitter.com/a/status/${id}   ${d.text.replace(/\n/g, '')}`)
				ok()
			})
		)
	)

export const getSession = (TWITTER_CREDENTIAL: {
	consumer_key: string,
	consumer_secret: string,
	access_token: string,
	access_token_secret: string
}, size: number = 8) => ({T: new Twit(TWITTER_CREDENTIAL), queue: queuedCalls(size)})
