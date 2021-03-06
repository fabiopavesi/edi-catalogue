"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var ES_HOST = process.env.ES_HOST || 'elasticsearch';
var ES_PORT = process.env.ES_PORT || '9200';
/**
 * Created by fabio on 14/07/2017.
 */
var elasticsearch = require('elasticsearch');
var assert = require('assert');
var q = require("q");
var config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/config.json')).toString());
console.log('config', config);
var DB = /** @class */ (function () {
    function DB() {
        this.db = null;
    }
    // Open the MongoDB connection.
    DB.prototype.open = function () {
        var deferred = q.defer();
        this.db = new elasticsearch.Client({
            host: ES_HOST + ":" + ES_PORT,
            log: 'trace'
        });
        deferred.resolve(this.db);
        return deferred.promise;
    };
    // Close the existing connection.
    DB.prototype.close = function () {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    };
    DB.dbUrl = config.mongoUrl;
    return DB;
}());
exports.DB = DB;
//# sourceMappingURL=db.js.map