Stocks = new Mongo.Collection("stocks");


// const listexample = {
// 	name: "ex",
// 	virgin: 1,
// 	user_id: "_000",
// };
// stock_schema.validate(listexample);

// server oriented code
if(Meteor.isServer) {

	stock_schema = new SimpleSchema({
		name: {type: String},
		virgin: {type: Number, defaultValue: 1},
		seed: {type: String, optional: true},
		fertility: {type: String, optional: true, defaultValue: "unknown", allowedValues: ["unknown", "none", "low", "medium", "high"]},
		status: {type: String, defaultValue: "queue", allowedValues: ["queue", "target", "abort"]},
		vndb_id: {type: Number, optional: true},
		user_id: {type: String, regEx: SimpleSchema.RegEx.Id},
		created_at: {type: Date, defaultValue: new Date()},
		updated_at: {type: Date, defaultValue: new Date()},
	});

	// const MAX_STOCKS = 9999;

	// publisher for stocks
	Meteor.publish('stocks', function(limit) {
		if(!this.userId) {
			// explanation says returning ready state with empty content let client know it's not loading forever
			return this.ready();
		}

		limit = limit || 0;
		// validating limit request value
		new SimpleSchema({
			limit: {type: Number, optional: true},
		}).validate({ limit });

		// const options = {
		// 	sort: {created_at: -1},
		// 	limit: Math.min(limit, MAX_STOCKS),
		// }

		return Stocks.find({
			$or: [
				{ virgin: {$ne: 1} },
				{ user_id: this.userId },
			]
		}, {
			limit: limit,
		});
	});

	Meteor.methods({
		getTotalSlavesCunt: function() {
			return Stocks.find().count();
		},
		getDirtySlavesCunt: function() {
			return Stocks.find({
				virgin: {$eq: 0},
			}).count();
		},
		getCleanSlavesCunt: function() {
			return Stocks.find({
				virgin: {$eq: 1},
			}).count();
		},
	})

	Meteor.startup(function () {
		// code to run on server at startup
	});
}

// term fecundation

// client oriented code
if (Meteor.isClient) {

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY",
	});

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

	// setInterval(function() {
		
	// }, 1000 * 1);
	Template.climax.helpers({
		current: function() {
			return Stocks.find().count();
		},
		total: function() {
			Session.setDefault("total_slaves_cunt", 0);
			Meteor.call('getTotalSlavesCunt', function(error, response) {
				// console.log("ERROR", error, "RESPONSE", response);
				Session.set("total_slaves_cunt", response);
			});
			return Session.get("total_slaves_cunt");
		},
		dirty: function() {
			Session.setDefault("dirty_slaves_cunt", 0);
			Meteor.call('getDirtySlavesCunt', function(error, response) {
				// console.log("ERROR", error, "RESPONSE", response);
				Session.set("dirty_slaves_cunt", response);
			});
			return Session.get("dirty_slaves_cunt");
		},
		clean: function() {
			Session.setDefault("clean_slaves_cunt", 0);
			Meteor.call('getCleanSlavesCunt', function(error, response) {
				// console.log("ERROR", error, "RESPONSE", response);
				Session.set("clean_slaves_cunt", response);
			});
			return Session.get("clean_slaves_cunt");
		},
	});

	// whenever #showMoreResults becomes visible, retieve more results
	function loadMore() {
		var threshold, target = $("body");
		if(!target.length) return;

		threshold = $(window).scrollTop() + $(window).height() - target.height();

		// target.height() calculate the height of overall document body
		// window height() calculate the height of browser client area (document), substracted to remove the gap from top edge scrollbar to bottom of document body height
		var distance = target.height() - $(window).height();

		// console.log("DIST:"+distance+
		// 	" BODY:"+  target.height() +
		// 	" SCROLLTOP:"+$(window).scrollTop() +
		// 	" WINDOW:"+ $(window).height()+
		// 	" OFFSET:"+ target.offset().top+
		// 	" DOC:" + $(document).height()+
		// 	" POINT:" + ($(document).height() - $(window).height())
		// 	);

		// if(target.offset().top < threshold) {
		// 	console.log("TRIGGER LOAD");
		// 	Session.set("slaves_limit", Session.get("slaves_limit") + slaves_expansion);
		// }
		// else {
		// 	if(target.data("visible")) {
		// 		target.data("visible", false);
		// 	}
		// }

		if($(window).scrollTop() == $(document).height() - $(window).height()) {
			Session.set("slaves_limit", Session.get("slaves_limit") + slaves_expansion);
		}
	}

	Template.injection.events({
		"submit .new-slave": function(event) {
			event.preventDefault();
			var val = event.target.text.value;
			Meteor.call("addSlave", val);
			event.target.text.value = "";
		},
	})

	$(window).on('beforeunload', function() {
		$(window).scrollTop(0);
	});

	Meteor.startup(function () {
		// code to run on client at startup
		$(window).scroll(loadMore);
	});
}
