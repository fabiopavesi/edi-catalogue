"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("../model/db");
var q = require("q");
/**
 * Created by fabio on 14/07/2017.
 */
var BASE_INDEX = 'edi-catalogue';
var EDIML = 'ediml';
var TEMPLATE = 'template';
var GENERATED = 'generated';
var BO = /** @class */ (function () {
    function BO() {
        var _this = this;
        var db = new db_1.DB();
        db.open().then(function (db) {
            _this.db = db;
        });
    }
    BO.prototype.getTemplates = function () {
        var deferred = q.defer();
        this.db.search({
            index: BASE_INDEX,
            type: TEMPLATE,
            body: {
                query: {
                    match_all: {}
                }
            }
        }, function (err, res, status) {
            if (err) {
                console.log('getTemplates error', err);
                deferred.reject(err);
            }
            else {
                console.log('getTemplates', res.hits.hits);
                deferred.resolve(res.hits.hits);
            }
        });
        return deferred.promise;
    };
    BO.prototype.getTemplate = function (id) {
        var deferred = q.defer();
        var collection = TEMPLATE;
        this.db.search({
            index: BASE_INDEX,
            type: collection,
            body: {
                "query": {
                    "ids": {
                        "values": [id]
                    }
                }
            }
        }, function (err, res, status) {
            if (err) {
                console.log('getTemplate error', err);
                deferred.reject(err);
            }
            else {
                console.log('getTemplate', JSON.stringify(res));
                if (res.hits.total > 0) {
                    deferred.resolve(res.hits.hits[0]._source);
                }
                else {
                    deferred.resolve({});
                }
            }
        });
        return deferred.promise;
    };
    BO.prototype.searchTemplates = function (query) {
        var deferred = q.defer();
        var collection = 'ediml';
        this.db.search({
            index: BASE_INDEX,
            type: TEMPLATE,
            body: {
                query: {
                    nested: {
                        path: 'metadata',
                        query: {
                            match: {
                                'metadata._all': query
                            }
                        }
                    }
                }
            }
        }, function (err, res, status) {
            if (err) {
                console.log('searchTemplates error', err);
                deferred.reject(err);
            }
            else {
                deferred.resolve(res.hits.hits);
            }
        });
        return deferred.promise;
    };
    BO.prototype.saveTemplate = function (object) {
        var deferred = q.defer();
        /*
                console.log('ediml', object.ediml);
                console.log('ediml.fileUri', object.ediml.fileUri);
        */
        var id = object.metadata.id;
        // console.log('object', object);
        this.db.index({
            index: BASE_INDEX,
            type: TEMPLATE,
            /*id: id,*/
            body: object
        }, function (err, res, status) {
            if (err) {
                console.log('saveTemplate error', err);
                deferred.reject(err);
            }
            else {
                console.log('inserted', res);
                deferred.resolve(res);
            }
        });
        return deferred.promise;
    };
    BO.prototype.getMetadata = function () {
        var deferred = q.defer();
        this.db.search({
            index: BASE_INDEX,
            type: EDIML,
            body: {
                query: {
                    match_all: {}
                }
            }
        }, function (err, res, status) {
            if (err) {
                console.log('getMetadata error', err);
                deferred.reject(err);
            }
            else {
                console.log('getMetadata', res.hits.hits);
                deferred.resolve(res.hits.hits);
            }
        });
        return deferred.promise;
    };
    BO.prototype.getMetadatum = function (id, xml) {
        if (xml === void 0) { xml = false; }
        var deferred = q.defer();
        var collection = xml ? GENERATED : EDIML;
        this.db.search({
            index: BASE_INDEX,
            type: collection,
            body: {
                "query": {
                    "ids": {
                        "values": [id]
                    }
                }
            }
        }, function (err, res, status) {
            if (err) {
                console.log('getMetadatum error', err);
                deferred.reject(err);
            }
            else {
                console.log('getMetadatum', JSON.stringify(res));
                if (res.hits.total > 0) {
                    deferred.resolve(res.hits.hits[0]._source);
                }
                else {
                    deferred.resolve({});
                }
            }
        });
        return deferred.promise;
    };
    BO.prototype.searchMetadata = function (query) {
        var deferred = q.defer();
        var collection = 'ediml';
        this.db.search({
            index: BASE_INDEX,
            type: EDIML,
            body: {
                query: {
                    match: {
                        _all: query
                    }
                }
            }
        }, function (err, res, status) {
            if (err) {
                console.log('getMetadatum error', err);
                deferred.reject(err);
            }
            else {
                deferred.resolve(res.hits.hits);
            }
        });
        return deferred.promise;
    };
    BO.prototype.saveEDIML = function (id, object) {
        var deferred = q.defer();
        this.db.index({
            index: BASE_INDEX,
            type: EDIML,
            id: id,
            body: object
        }, function (err, res, status) {
            if (err) {
                console.log('saveEDIML error', err);
                deferred.reject(err);
            }
            else {
                console.log('saveEDIML', res);
                deferred.resolve(res);
            }
        });
        return deferred.promise;
    };
    BO.prototype.saveMetadata = function (object) {
        var _this = this;
        var deferred = q.defer();
        /*
                console.log('ediml', object.ediml);
                console.log('ediml.fileUri', object.ediml.fileUri);
        */
        var id = object.ediml.fileUri.substring(object.ediml.fileUri.lastIndexOf('/') + 1);
        // console.log('object', object);
        this.db.index({
            index: BASE_INDEX,
            type: EDIML,
            id: id,
            body: object.ediml
        }, function (err, res, status) {
            if (err) {
                console.log('saveMetadata error', err);
                deferred.reject(err);
            }
            else {
                console.log('inserting generated', object.generatedXml);
                _this.db.index({
                    index: BASE_INDEX,
                    type: GENERATED,
                    id: id,
                    body: {
                        xml: object.generatedXml
                    }
                }, function (err, object, status) {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        deferred.resolve(object);
                    }
                });
            }
        });
        return deferred.promise;
    };
    return BO;
}());
exports.BO = BO;
//# sourceMappingURL=BO.js.map