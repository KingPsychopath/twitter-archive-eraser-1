import { getEnv } from './env'

import { filterCSV, Row } from "../src/tweet-filter"
import { getSession, deleteTwit } from "../src/tweet-delete"

const argv = Array.from(process.argv)
if (argv.length < 3) throw 'wat'
const tweetsCSVPath = argv[argv.length-1]

const { TWITTER_CREDENTIAL } = getEnv()
const deleteTweet = deleteTwit(getSession(TWITTER_CREDENTIAL, 16 /* maximum parallel jobs */))

// below is a example: deleting retweets (un-retweet) in Nov 2017 - Sep 2018.
const startTime = new Date().setFullYear(2017, 11)
const endTime = new Date().setFullYear(2018, 9)
filterCSV(
	tweetsCSVPath,

	// You may want to change this
	({retweeted_status_id, timestamp}) =>
		!!retweeted_status_id && timestamp > startTime && timestamp < endTime

).on('data', ({tweet_id, text}: Row) => {
	if (process.env.DELETE_TWEET_WITH_FORCE) {
		deleteTweet(tweet_id)
	} else {
		console.log(`Keep https://twitter.com/a/status/${tweet_id}  ${text.replace(/\n/g, '')}`)
	}
})
