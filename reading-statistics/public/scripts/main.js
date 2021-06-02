'use strict';

/* Configuration                                               */
/*   Get your keys at: http://www.goodreads.com/api/keys       */
var key = 'unMyyzduiPPhxe3Ymi3fnQ'; //# Enter your key here to test!
var secret = '5hEmpo3yg1oSi8ZwUmfew8LQk6mMroyDuqPv3k4VFY'; //# Enter your goodreads secret here to test!

if (!key || !secret) {
	console.log('You need to set your Goodreads dev Key and Secret!');
	console.log('---');
	console.log('1) Get them at:  http://www.goodreads.com/api/keys');
	console.log('2) Set your key environment variable with: export GOODREADS_KEY=yourkey');
	console.log('3) Set your secret environment variable with: export GOODREADS_SECRET=yoursecret');
	console.log('---');
	console.log('Having trouble? Ask me at @bdickason on Twitter.');
	process.exit(1);
}

// Require the client
var goodreads = require('goodreads'); // For you this looks like: require 'goodreads'
var http = require('http');
var url = require('url');

// excuse the clunkiness, I usually just require express and forget all this
var fakeSession = {};
var sample_user = 4085451;

var onRequest = function onRequest(req, res) {
	var parse = url.parse(req.url, true);
	var pathname = parse.pathname,
	    gr = void 0;
	var dump = function dump(json) {
		json && res.write(JSON.stringify(json));res.end();
	};
	console.log('request for [' + pathname + '] received');

	switch (pathname) {
		// get a users info
		case '/user':case '/user/':
			var username = parse.query.username;

			console.log('Getting user info for ' + username);
			gr = goodreads.client({ 'key': key, 'secret': secret });
			return gr.showUser(username).then(function (json) {
				return dump(json);
			});

		case '/series':case '/series/':
			console.log('Getting list of books from series 40650');
			gr = goodreads.client({ 'key': key, 'secret': secret });
			return gr.getSeries('40650').then(function (json) {
				return dump(json);
			});

		case '/author':case '/author/':
			console.log('Getting page 2 of list of books by author 18541');
			gr = goodreads.client({ 'key': key, 'secret': secret });
			return gr.getAuthor('18541', 2).then(function (json) {
				return dump(json);
			});

		// get a users info
		case '/search':case '/search/':
			var q = parse.query.q;

			console.log('searching for book ' + q);
			gr = goodreads.client({ 'key': key, 'secret': secret });
			return gr.searchBooks(q).then(function (json) {
				return dump(json);
			});

		// get a user's list of shelves
		case '/shelves':case '/shelves/':
			console.log('Getting shelves ' + sample_user);
			gr = goodreads.client({ 'key': key, 'secret': secret });
			return gr.getShelves(sample_user).then(function (json) {
				return dump(json);
			});

		// Get a user's shelf
		case '/shelf':case '/shelf/':
			console.log('Getting list: web');
			gr = goodreads.client({ 'key': key, 'secret': secret });
			var shelfOptions = { 'userID': sample_user, 'shelf': 'web', 'page': 1, 'per_page': 100
				// I would expect you won't be hardcoding these things :)
				// There is a strange bug in /reviews/list. for per_page > 175, you get <error>forbidden</error>
				// I suspect it has to do with the processing time, so if you're getting the error, try reducing per_page
			};if ("accessToken" in fakeSession) {
				shelfOptions.accessToken = fakeSession.accessToken;
				shelfOptions.accessTokenSecret = fakeSession.accessTokenSecret;
				console.log(shelfOptions);
			}
			return gr.getSingleShelf(shelfOptions, dump);

		// Get a protected resource
		case '/friends':case '/friends/':
			console.log('Getting friends ' + sample_user);
			gr = goodreads.client({ 'key': key, 'secret': secret });
			return gr.getFriends(sample_user, fakeSession.accessToken, fakeSession.accessTokenSecret).then(function (json) {
				return dump(json);
			});

		case '/oauth':case '/oauth/':
			// handle oauth

			gr = goodreads.client({ 'key': key, 'secret': secret });
			return gr.requestToken().then(function (result) {
				// log token and secret to our fake session
				fakeSession.oauthToken = result.oauthToken;
				fakeSession.oauthTokenSecret = result.oauthTokenSecret;

				// Redirect to the goodreads url!!
				res.writeHead('302', { 'Location': result.url });
				return res.end();
			});

		case '/callback':
			// handle Goodreads' callback

			// grab token and secret from our fake session
			var oauthToken = fakeSession.oauthToken;
			var oauthTokenSecret = fakeSession.oauthTokenSecret;
			// parse the querystring

			var params = url.parse(req.url, true);

			gr = goodreads.client({ 'key': key, 'secret': secret });
			return gr.processCallback(oauthToken, oauthTokenSecret, params.query.authorize).then(function (result) {
				fakeSession.accessToken = result.accessToken;
				fakeSession.accessTokenSecret = result.accessTokenSecret;
				res.write(JSON.stringify(result));
				return res.end();
			});

		case '/authuser':
			console.log('Getting user authenticated using oauth');
			gr = goodreads.client({ 'key': key, 'secret': secret });
			return gr.showAuthUser(fakeSession.accessToken, fakeSession.accessTokenSecret).then(function (json) {
				return dump(json);
			});

		default:
			// ignore all other requests including annoying favicon.ico
			res.write('<html>Ok but you should enter a parameter or two.\n\n');
			res.write('How about...\n\n');
			res.write('<ul>');
			res.write('<li><A HREF=/shelves>Get a list of shelves</A></li>');
			res.write('<li><A HREF=/shelf>Get all books on a single shelf</A></li>');
			res.write('<li><A HREF=/oauth>Connect to Goodreads via OAuth!</A></li>');
			res.write('</ul></html>');
			return res.end();
	}
};

http.createServer(onRequest).listen(3000);

console.log('server started on port 3000');