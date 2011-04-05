var	OAuth = require('./oauth').OAuth,
	querystring= require('querystring'),
	API_PREFIX = 'http://api.t.sina.com.cn/',
	CONSUMER_KEY = 'your consumer key',
	CONSUMER_SECRET = 'your consumer secret';

var sinaOAuth = module.exports = function(access_key, access_secret) {
	this.access_key = access_key;
	this.access_secret = access_secret;
	this.oa = new OAuth(
		API_PREFIX + 'oauth/request_token',
		API_PREFIX + 'oauth/access_token',
		CONSUMER_KEY,
		CONSUMER_SECRET,
		'1.0',
		null,
		'HMAC-SHA1'
	)
};
sinaOAuth.prototype = {
	oAuth : function(req, res, callback) {
		if (req.query.oauth_token && req.query.oauth_verifier) {
			this.getOAuthAccessToken(req, res, callback);
		} else {
			this.getOAuthRequestToken(req, res, callback);
		}
	},

	getOAuthRequestToken : function(req, res, callback) {
		this.oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret,  results){
			if (error) return callback(error);

			var callback_url = req.headers.referer + req.url.substr(1);
			req.session.oauth_token = oauth_token;
			req.session.oauth_token_secret = oauth_token_secret;
			res.redirect(API_PREFIX + 'oauth/authorize?oauth_token=' + oauth_token + '&oauth_callback=' + callback_url);
		});
	},

	getOAuthAccessToken : function(req, res, callback) {
		this.oa.getOAuthAccessToken(
			req.session.oauth_token, 
			req.session.oauth_token_secret, 
			req.query.oauth_verifier,
			function(error, oauth_access_token, oauth_access_token_secret, results) {
				if (error) return callback(error);
				callback(null, oauth_access_token, oauth_access_token_secret);
			});
	},
	
	get : function(url, args, callback) {
		if (!this.access_key || !this.access_secret) return callback("not authorize");
		url = API_PREFIX + url + '.json';
		url += args ? ('?' + querystring.stringify(args)) : '';

		this.oa.get(url, this.access_key, this.access_secret, function(error, data, res) {
			//data = JSON.parse(data);
			callback(error, data, res);
		});
	},

	post: function(url, args, callback) {
		if (!this.access_key || !this.access_secret) return callback("not authorize");
		this.oa.post(API_PREFIX + url + '.json', this.access_key, this.access_secret, args, null, function(error, data, res) {
			//data = JSON.parse(data);
			callback(error, data, res);
		});
	},
	
	delete: function(url, callback) {
		if (!this.access_key || !this.access_secret) return callback("not authorize");
		this.oa.delete(url + '.json', this.access_key, this.access_secret, function(error, data, res) {
			//data = JSON.parse(data);
			callback(error, data, res);
		});
	},


	/**************** API Method ****************/

	emotions : function(args, callback) {
		this.get('emotions', args, callback);
	},
	

	/********** statuses *********/

	update : function(args, callback) {
		if (!args.status) return callback('missing argument status');
		this.post('statuses/update', args, callback);
	},

	destory: function(args, callback) {
		if (!args.id) return callback('missing argument id');
		this.delete('statuses/destory/' + args.id, callback);
	},

	repost: function(args, callback) {
		/* args参数:
		 * 	id : 微博id
		 * 	status : 转发文本 
		 * 	is_comment 0-不发评论 1-发评论给当前微博 2-发评论给原微博 3-都发
		 */
		if (!args.id) return callback('missing argument id');
		this.post('statuses/repost', args, callback);
	},

	/********* comment **********/

	comment: function(args, callback) {
		if (!args.id) return callback('missing argument id');
		if (!args.comment) return callback('missing argument comment');
		this.post('statuses/comment', args, callback);
	},
	
	comment_destory: function(args, callback) {
		if (!args.id) return callback('missing argument id');
		this.delete('statuses/comment_destory/' + args.id, callback);
	},

	comment_destory_batch: function(args, callback) {
		if (!args.ids) return callback('missing argument ids');
		this.post('statuses/comment/destory_batch', args, callback);
	},

	comment_reply: function(args, callback) {
		if (!args.id || !args.cid || !args.comment) return callback('missing argument');
		this.post('statuses/reply', args, callback);
	},


	/********* user **********/
	
	user_show: function(args, callback) {
		this.get('users/show', args, callback);
	},
	
	user_hot: function(args, callback) {
		this.get('users/hot', args, callback);
	},
	
	user_suggestions: function(args, callback) {
		this.get('users/suggestions', args, callback);
	},

	user_update_remark: function(args, callback) {
		if (!args.user_id || !args.remark) return callback('missing argument');
		this.post('user/friends/update_remark', args, callback);
	},

	/********* friendships **********/

	friend_create: function(args, callback) {
		if (args.id) {
			this.post('friendships/create/' + args.id, args, callback);
		} else {
			this.post('friendships/create', args, callback);
		}
	},
	
	friend_destory: function(args, callback) {
		if (args.id) {
			this.delete('friendships/destory/' + args.id, callback);
		} else {
			this.post('friendships/destory', args, callback);
		}
	},

	friend_exists: function(args, callback) {
		if (!args.user_a || !args.user_b) return callback('missing argument user_a or user_b');
		this.get('friendships/exists', args, callback);
	},

	friend_show: function(args, callback) {
		this.get('friendships/show', args, callback);
	},

	/********* direct_messages **********/
	
	dm: function(args, callback) {
		this.get('direct_messages', args, callback);
	},

	dm_sent: function(args, callback) {
		this.get('direct_messages_sent', args, callback);
	},

	dm_new: function(args, callback) {
		if (!args.id || !args.text) return callback('missing argument');
		this.post('direct_messages/new', args, callback);
	},

	dm_destory: function(args, callback) {
		if (!args.id) return callback('missing argument id');
		this.delete('direct_messages/destory/' + args.id, callback);
	},	
	
	dm_destory_batch: function(args, callback) {
		if (!args.ids) return callback('missing argument ids');
		this.post('direct_messages/destory_batch', args, callback);
	},
	
	/********* trends **********/
	trends: function(args, callback) {
		if (!args.user_id) return callback('missing argument user_id');
		this.get('trends', args, callback);
	},

	trends_statuses: function(args, callback) {
		if (!args.trend_name) return callback('missing argument trend_name');
		this.get('trends/statuses', args, callback);
	},

	trends_follow: function(args, callback) {
		if (!args.trend_name) return callback('missing argument trend_name');
		this.post('trends/follow', args, callback);
	},

	trends_destory: function(args, callback) {
		if (!args.trend_id) return callback('missing argument trend_id');
		this.post('trends/destory', args, callback);
	},

	trends_hourly: function(args, callback) {
		this.get('trends/hourly', args, callback);
	},

	trends_daily: function(args, callback) {
		this.get('trends/daily', args, callback);
	},

	trends_weekly: function(args, callback) {
		this.get('trends/weekly', args, callback);
	},


	/********* account **********/

	verify: function(args, callback) {
		this.get('account/verify_credentials', args, callback);
	},

	rate_limit_status: function(args, callback) {
		this.get('account/rate_limit_status', args, callback);
	},

	update_profile: function(args, callback) {
		this.get('account/update_profile', args, callback);
	},

	/********* account **********/
	
	fav: function(args, callback) {
		this.get('favorites', args, callback);
	},
	
	fav_create: function(args, callback) {
		if (!args.id) return callback('missing arguments id');
		this.post('favorites/create', args, callback);
	},

	fav_destory: function(args, callback) {
		if (!args.id) return callback('missing argument id');
		this.delete('favorites/destory/' + args.id, callback);
	},	
	
	fav_destory_batch: function(args, callback) {
		if (!args.ids) return callback('missing argument ids');
		this.post('favorites/destory_batch', args, callback);
	},
};

/********* statuses API Method **********/
['public_timeline', 'friends_timeline', 'user_timeline', 'mentions', 'comments_timeline', 
'comments_by_me', 'comments_to_me','comments', 'counts', 'repost_timeline', 'repost_by_me', 
'unread', 'reset_count', 'friends', 'followers'].forEach(function(fnName) {
	sinaOAuth.prototype[fnName] = function(args, callback) {
		this.get('statuses/' + fnName, args, callback)
	}
});

