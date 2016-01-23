Stocks = new Mongo.Collection("stocks");



// const listexample = {
// 	name: "ex",
// 	virgin: 1,
// 	user_id: "_000",
// };
// stock_schema.validate(listexample);

// server oriented code
if(Meteor.isServer) {

	// stock_schema = new SimpleSchema({
	// 	name: {type: String},
	// 	virgin: {type: Boolean, defaultValue: true},
	// 	seed: {type: String, optional: true},
	// 	fertility: {type: String, optional: true, defaultValue: "unknown", allowedValues: ["unknown", "none", "low", "medium", "high"]},
	// 	status: {type: String, defaultValue: "queue", allowedValues: ["queue", "target", "abort"]},
	// 	vndb_id: {type: Number, optional: true},
	// 	user_id: {type: String, regEx: SimpleSchema.RegEx.Id},
	// 	created_at: {type: Date, defaultValue: new Date()},
	// 	updated_at: {type: Date, defaultValue: new Date()},
	// });

	// const MAX_STOCKS = 9999;

	// publisher for stocks
	Meteor.publish('stocks', function(limit) {
		// if(!this.userId) {
			// explanation says returning ready state with empty content let client know it's not loading forever
			// return this.ready();
		// }

		limit = limit ? limit : 1;
		// validating limit request value
		new SimpleSchema({
			limit: {type: Number, optional: true},
		}).validate({ limit });

		// const options = {
		// 	sort: {created_at: -1},
		// 	limit: Math.min(limit, MAX_STOCKS),
		// }

		return Stocks.find({
			// $or: [
			// 	{ virgin: {$ne: false} },
			// 	{ user_id: this.userId },
			// ]
		}, {
			limit: limit,
	// 		limit: 20,
		});
	});
}

// term fecundation

// client oriented code
if (Meteor.isClient) {
	
	// Meteor.subscribe('stocks');

	var slaves_expansion = 20;
	Session.setDefault('slaves_limit', slaves_expansion);
	Tracker.autorun(function() {
		Meteor.subscribe('stocks', Session.get('slaves_limit'));
	});

	Template.body.helpers({
		// helper for body
	});

	Template.anal.helpers({
		slaves: function() {
			return Stocks.find();
		},
		moreResults: function() {
			return !(Stocks.find().count() < Session.get("slaves_limit"));
		}
	});

	// whenever #showMoreResults becomes visible, retieve more results
	function loadMore() {
		var threshold, target = $("body");
		if(!target.length) return;

		threshold = $(window).scrollTop() + $(window).height() - target.height();

		if(target.offset().top < threshold) {
			console.log("OFF:"+ target.offset().top +" TR:"+  threshold +" ST:"+$(window).scrollTop() +" WH:"+ $(window).height());
			Session.set("slaves_limit", Session.get("slaves_limit") + slaves_expansion);
		}
		else {
			if(target.data("visible")) {
				target.data("visible", false);
			}
		}
	}

	Meteor.startup(function () {
		// code to run on client at startup
		$(window).scroll(loadMore);
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}
