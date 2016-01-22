Stocks = new Mongo.Collection("stocks");

stock_schema = new SimpleSchema({
	name: {type: String},
	virgin: {type: Boolean, defaultValue: true},
	seed: {type: String, optional: true},
	fertility: {type: String, optional: true, defaultValue: "unknown", allowedValues: {"unknown", "none", "low", "medium", "high"}},
	status: {type: String, defaultValue: "queue", allowedValues: {"queue", "target", "abort"}},
	vndb_id: {type: Number, optional: true},
	user_id: {type: String, regEx: SimpleSchema.RegEx.Id},
	created_at: {type: Date, defaultValue: new Date()},
	modified_at: {type: Date, defaultValue: new Date()},
});


if (Meteor.isClient) {
	// counter starts at 0
	Session.setDefault('counter', 0);

	Template.hello.helpers({
		counter: function () {
			return Session.get('counter');
		}
	});

	Template.hello.events({
		'click button': function () {
			// increment the counter when button is clicked
			Session.set('counter', Session.get('counter') + 1);
		}
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}
