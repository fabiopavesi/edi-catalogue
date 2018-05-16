import * as fs from 'fs';
import * as path from 'path';

/**
 * Created by fabio on 14/07/2017.
 */
var elasticsearch = require('elasticsearch');

var assert = require('assert');
var q = require("q");

let config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/config.json')).toString());
console.log('config', config);

export class DB {
    static dbUrl: string = config.mongoUrl;
    db: any = null;

    // Open the MongoDB connection.
    public open() {
        let deferred = q.defer();
        this.db = new elasticsearch.Client({
            host: 'elasticsearch:9200',
            log: 'trace'
        });
        deferred.resolve(this.db);
        return deferred.promise;
    }

    // Close the existing connection.
    public close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}