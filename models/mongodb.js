/**
 * Created by Sirius on 14-3-1.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodejs');
exports.mongoose = mongoose;