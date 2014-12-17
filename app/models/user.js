var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	facebookId: String
});

module.exports = mongoose.model('User', UserSchema);