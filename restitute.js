Stocks = new Mongo.Collection("stocks");


// const listexample = {
// 	name: "ex",
// 	virgin: 1,
// 	user_id: "_000",
// };
// stockSchema.validate(listexample);

// server oriented code
if(Meteor.isServer) {

	stockSchema = new SimpleSchema({
		name: {type: String},
		virgin: {type: Number, defaultValue: 1, allowedValues: [0,1]},
		seed: {type: String, optional: true},
		fertility: {type: String, optional: true, defaultValue: "unknown", allowedValues: ["unknown", "none", "low", "medium", "high"]},
		status: {type: String, defaultValue: "queue", allowedValues: ["queue", "wishlist", "dropped"]},
		"vndb.vn_id": {type: Number, optional: true},
		cover_image: {type: String, optional: true},
		sample_images: {type: [String], optional: true},
		user_id: {type: String, regEx: SimpleSchema.RegEx.Id},
		created_at: {type: Date, defaultValue: new Date()},
		updated_at: {type: Date, defaultValue: new Date()},
	});

	stockUpdateSchema = new SimpleSchema({
		name: {type: String, optional: true},
		virgin: {type: Number, optional: true, allowedValues: [0,1]},
		seed: {type: String, optional: true},
		fertility: {type: String, optional: true, allowedValues: ["unknown", "none", "low", "medium", "high"]},
		status: {type: String, optional: true, allowedValues: ["queue", "wishlist", "dropped"]},
		"vndb.vn_id": {type: Number, optional: true},
		cover_image: {type: String, optional: true},
		sample_images: {type: [String], optional: true},
		user_id: {type: String, optional: true, regEx: SimpleSchema.RegEx.Id},
		created_at: {type: Date, optional: true},
		updated_at: {type: Date, defaultValue: new Date()},
	})

	// const MAX_STOCKS = 9999;

	// publisher for stocks
	Meteor.publish('stocks', function(limit, filter) {
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
		console.log(filter);
		if(filter) {
			var search_query = filter;
			var regular_expression = new RegExp(".*" + search_query + ".*");
			return Stocks.find({
				$and: [
					{ user_id: this.userId },
					{
						$or: [
							{ "name": regular_expression },
							// for  mongodb native full text search, alas currently not working if combined with mongodb's $or expression
							// { $text: {$search: filter} },
						]
					}
					
				]
			}, {
				score: { $meta: "textScore" },
				sort: {score: -1},
				limit: limit,
			});
		}
		else {
			return Stocks.find({
				$or: [
					{ virgin: {$ne: 1} },
					{ user_id: this.userId },
				]
			}, {
				limit: limit,
				sort: {created_at: -1},
			});
		}
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
		updateVirginity: function(stock_id, data) {
			Future = Npm.require('fibers/future');
			var mirai = new Future;

			var stock = Stocks.findOne(stock_id);
			if(stock.user_id !== Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			// translate virginity to integer
			data.virgin = Number(data.virgin);
			if(!data.virgin && data.virgin != 0) {
				throw new Meteor.Error("invalid-type", "Invalid type of Number used against virginity.");
			}

			// validte against schema
			stockUpdateSchema.clean(data);
			stockUpdateSchema.validate(data);

			Stocks.update(stock_id, {
				$set: {
					virgin: data.virgin,
				}
			}, function(error, result) {
				if(error) {
					mirai.throw(error);
					console.log("ERROR", error);
				}
				if(result) {
					mirai.return(result);
				}
			});

			return mirai.wait();
		},
		updateFertility: function(stock_id, data) {
			// load future
			Future = Npm.require('fibers/future');
			var myFuture = new Future;

			var stock = Stocks.findOne(stock_id);
			if(stock.user_id !== Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			stockUpdateSchema.clean(data);
			stockUpdateSchema.validate(data);

			Stocks.update(stock_id, {
				$set: {
					fertility: data.fertility,
				}
			}, function(error, result) {
				if(error) {
					myFuture.throw(error);
					console.log("ERROR", error);
				}
				if(result) {
					myFuture.return(result);
					// return {status: "success"};
				}
			});

			return myFuture.wait();
		},
		updateStatus: function(stock_id, data) {
			Future = Npm.require('fibers/future');
			var mirai = new Future;

			var stock = Stocks.findOne(stock_id);
			if(stock.user_id !== Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			stockUpdateSchema.clean(data);
			stockUpdateSchema.validate(data);

			Stocks.update(stock_id, {
				$set: {
					status: data.status,
				}
			}, function(error, result) {
				if(error) {
					mirai.throw(error);
					console.log("ERROR", error);
				}
				if(result) {
					mirai.return(result);
				}
			});

			return mirai.wait();
		},
		fetchSample: function(stock_id) {
			Future = Npm.require('fibers/future');
			var mirai = new Future;

			var stock = Stocks.findOne(stock_id);
			if(stock.user_id !== Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			// fetch google images
			// for asynchronous call
			this.unblock();

			var search_params = {
				q: stock.name,
				key: "AIzaSyCCB_noAIr7nVpUhOYSsyhZmMS_z6E_tIw ",
				cx: "015746608515890873103:n_gwt5bhm2o",
				searchType: "image",
				googlehost: "google.co.jp",
				num: 10,
				safe: "off",
			};
			result = HTTP.call("GET", "https://www.googleapis.com/customsearch/v1", {params: search_params}, function(error, result) {
				if(error) {
					console.log("ERROR", error);
					mirai.throw(error);
				}
				if(result) {
					// mirai.return(result);
					var links = [];
					for(var i = 0; i < 4; i++) {
						links.push(result.data.items[i].link);
					}
					var data = {
						sample_images:  links,
					};

					stockUpdateSchema.clean(data);
					stockUpdateSchema.validate(data);

					Stocks.update(stock_id, {
						$set: {
							sample_images: data.sample_images,
							updated_at: data.updated_at,
						}
					}, function(error, result) {
						if(error) {
							console.log("ERROR", error);
						}
						if(result) {
							mirai.return("sample images updated success");
						}
					});
				}
			});

			return mirai.wait();
		},
		updateVndb: function(stock_id, data) {
			Future = Npm.require('fibers/future');
			var mirai = new Future;

			var stock = Stocks.findOne(stock_id);
			if(stock.user_id !== Meteor.userId()) {
				throw new Meteor.Error("not-authorized");
			}

			stockUpdateSchema.clean(data);
			stockUpdateSchema.validate(data);

			Stocks.update(stock_id, {
				$set: {
					vndb: {
						vn_id: data.vndb.vn_id,
					}
				}
			}, function(error, result) {
				if(error) {
					mirai.throw(error);
					console.log("ERROR"< error);
				}
				if(result) {
					mirai.return(result);
				}
			});

			return mirai.wait();
		}
	});

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
	Session.setDefault("slaves_selection", "");
	Tracker.autorun(function() {
		Meteor.subscribe('stocks', Session.get('slaves_limit'), Session.get('slaves_selection'));
	});

	Template.body.helpers({
		// helper for body
	});
	Template.body.events({
		"change .stock-search-input": function(event) {
			// reset limit to default when search query changes
			Session.set("slaves_limit", slaves_expansion);
			// apply value of search query into session, of which tracker automatically fetch search results
			Session.set("slaves_selection", event.target.value);
		},
	});

	Template.anal.helpers({
		slaves: function() {
			return Stocks.find();
		},
		moreResults: function() {
			return !(Stocks.find().count() < Session.get("slaves_limit"));
		},
		virginity_check: function() {
			if(this.virgin == 1) {
				return "checked";
			}
			else {
				return "";
			}
			return this;
		},
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
	});

	$(window).on('beforeunload', function() {
		$(window).scrollTop(0);
	});

	Meteor.startup(function () {
		// code to run on client at startup
		$(window).scroll(loadMore);
	});


	// Template.anal.onRendered(function() {
	// 	this.$(".fertility-dropdown").dropdown();
	// });

	Template.anal.events({
		"mousedown .stock-item": function(event) {
			var target_element = $("#"+this._id._str).find(".stock-control");
			if(target_element.hasClass("visible")) {
				return;
			}
			var stock_id = $("#"+this._id._str).find("input[name=stockid]").val();
			target_element.transition({
				animation: 'drop',
				duration: '100ms',
				queue: true,
			});
			if(this.virgin == 1) {
				$("#"+this._id._str).find(".virginity-checkbox").checkbox("set checked");
			}
			else {
				$("#"+this._id._str).find(".virginity-checkbox").checkbox();
			}
			$("#"+this._id._str).find(".fertility-dropdown").dropdown();
			$("#"+this._id._str).find(".status-dropdown").dropdown();
		},
		"mouseenter .virginity-checkbox": function(event) {
		},
		"change .virginity-checkbox": function(event) {
			var virginity = $(event.target).prop('checked') ? '1' : '0';
			// prevent update request happens despite same value, this occurs due to on position switch being applied when clicking-to-expand item
			if(virginity == this.virgin) {
				return;
			}
			data = {
				virgin: virginity,
			};
			Meteor.call("updateVirginity", this._id, data, function(error, response) {
				if(error) {
					console.log(error);
				}
				else {
					showNotification("Virginity lost", "none");
				}
			});
		},
		// "mouseenter .fertility-dropdown": function(event) {
		// 	$(event.target).dropdown();
		// },
		"change .fertility-input": function(event) {
			data = {
				fertility: event.target.value,
			};
			Meteor.call("updateFertility", this._id, data, function(error, response) {
				if(error) {
					console.log(error);
				}
				else {
					showNotification("Womb fertilized", "none");
				}
			});
		},
		// "mouseenter .status-dropdown": function(event) {
		// 	$(event.target).dropdown();
		// },
		"change .status-input": function(event) {
			data = {
				status: event.target.value,
			}
			Meteor.call("updateStatus", this._id, data, function(error, response) {
				if(error) {
					console.log(error);
				}
				else {
					showNotification("Status updated", "none");
				}
			});
		},
		"change .vndb-id-input": function(event) {
			data = {
				vndb: {
					vn_id: event.target.value,
				},
			};
			Meteor.call("updateVndb", this._id, data, function(error, response) {
				if(error) {
					console.log(error);
				}
				else {
					showNotification("VNDB ID updated", "none");
				}
			});
		},
		"click .anal-plug": function(event) {
			var target_element = $("#"+this._id._str).find(".stock-control");
			if(target_element.hasClass("visible")) {
				target_element.transition({
					animation: 'scale',
					duration: '200ms',
					queue: true,
				});
			}
		}
	});

	function showNotification(header_message, content_message) {
		var message = {
			header: header_message,
			content: new Date(),
		};
		Session.set("notification", message);
		$(".notification")
			.transition({
				animation: 'scale',
				duration: '0.3s',
			})
			.transition({
				allowRepeats: true,
				animation: 'pulse',
				duration: '2s',
			})
			.transition({
				animation: 'scale',
				duration: '1.5s',
			})
		;
	}

	Template.notification.helpers({
		header: function() {
			Session.setDefault("notification", {header: "idle", content: "no content"});
			return Session.get("notification").header;
		},
		content: function() {
			Session.setDefault("notification", {header: "idle", content: "no content"});
			return Session.get("notification").content;
		},
	});

	// Tracker.autorun(function() {
	// 	var notification = Session.get("notification");
	// 	console.log("CHANGE", notification);
	// });

	Template.sample.helpers({
		images: function() {
			return this.sample_images;
		},
	});

	Template.sample.events({
		"click .sample-fetch-button": function(event) {
			Meteor.call("fetchSample", this._id, function(error, response) {
				if(error) {
					console.log(error);
				}
				else {
					console.log(response);
					showNotification("Sample supposedly refreshed with new images", "none");
				}
			})
		},
	})

}
