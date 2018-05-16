import {DB} from '../model/db';
import * as q from 'q';
import * as UUID from 'uuid';

/**
 * Created by fabio on 14/07/2017.
 */

const BASE_INDEX = 'edi-catalogue';
const EDIML = 'ediml';
const TEMPLATE = 'template';
const GENERATED = 'generated';

export class BO {
    db;

    constructor() {
        let db = new DB();
        db.open().then((db) => {
            this.db = db;
        });
    }


    getTemplates() {
        var deferred = q.defer();
        this.db.search({
            index: BASE_INDEX,
            type: TEMPLATE,
            body: {
                query: {
                    match_all: {}
                }
            }
        }, (err, res, status) => {
            if (err) {
                console.log('getTemplates error', err);
                deferred.reject(err);
            } else {
                console.log('getTemplates', res.hits.hits);
                deferred.resolve(res.hits.hits);
            }
        })
        return deferred.promise;
    }

    getTemplate(id: string) {

        var deferred = q.defer();
        let collection = TEMPLATE;

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
        }, (err, res, status) => {
            if (err) {
                console.log('getTemplate error', err);
                deferred.reject(err);
            } else {
                console.log('getTemplate', JSON.stringify(res));
                if (res.hits.total > 0) {
                    deferred.resolve(res.hits.hits[0]._source);
                } else {
                    deferred.resolve({});
                }
            }
        })
        return deferred.promise;
    }

    searchTemplates(query: string) {
        var deferred = q.defer();
        let collection = 'ediml';
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
        }, (err, res, status) => {
            if (err) {
                console.log('searchTemplates error', err);
                deferred.reject(err);
            } else {
                deferred.resolve(res.hits.hits);
            }
        })
        return deferred.promise;
    }

    saveTemplate(object: any) {
        var deferred = q.defer();
        /*
                console.log('ediml', object.ediml);
                console.log('ediml.fileUri', object.ediml.fileUri);
        */
        let id = object.metadata.id;
        // console.log('object', object);

        this.db.index({
            index: BASE_INDEX,
            type: TEMPLATE,
            /*id: id,*/
            body: object
        }, (err, res, status) => {
            if (err) {
                console.log('saveTemplate error', err);
                deferred.reject(err);
            } else {
                console.log('inserted', res);
                deferred.resolve(res);
            }
        })

        return deferred.promise;
    }


    getMetadata() {
        var deferred = q.defer();
        this.db.search({
            index: BASE_INDEX,
            type: EDIML,
            body: {
                query: {
                    match_all: {}
                }
            }
        }, (err, res, status) => {
            if (err) {
                console.log('getMetadata error', err);
                deferred.reject(err);
            } else {
                console.log('getMetadata', res.hits.hits);
                deferred.resolve(res.hits.hits);
            }
        })
        return deferred.promise;
    }

    getMetadatum(id: string, xml = false) {

        var deferred = q.defer();
        let collection = xml ? GENERATED : EDIML;

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
        }, (err, res, status) => {
            if (err) {
                console.log('getMetadatum error', err);
                deferred.reject(err);
            } else {
                console.log('getMetadatum', JSON.stringify(res));
                if (res.hits.total > 0) {
                    deferred.resolve(res.hits.hits[0]._source);
                } else {
                    deferred.resolve({});
                }
            }
        })
        return deferred.promise;
    }

    searchMetadata(query: string) {
        var deferred = q.defer();
        let collection = 'ediml';
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
        }, (err, res, status) => {
            if (err) {
                console.log('getMetadatum error', err);
                deferred.reject(err);
            } else {
                deferred.resolve(res.hits.hits);
            }
        })
        return deferred.promise;
    }

    saveEDIML(id: string, object: any) {
        var deferred = q.defer();
        this.db.index({
            index: BASE_INDEX,
            type: EDIML,
            id: id,
            body: object
        }, (err, res, status) => {
            if (err) {
                console.log('saveEDIML error', err);
                deferred.reject(err);
            } else {
                console.log('saveEDIML', res);
                deferred.resolve(res);
            }
        })
        return deferred.promise;
    }

    saveMetadata(object: any) {
        var deferred = q.defer();

        /*
                console.log('ediml', object.ediml);
                console.log('ediml.fileUri', object.ediml.fileUri);
        */
        let id = object.ediml.fileUri.substring(object.ediml.fileUri.lastIndexOf('/') + 1);
        // console.log('object', object);

        this.db.index({
            index: BASE_INDEX,
            type: EDIML,
            id: id,
            body: object.ediml
        }, (err, res, status) => {
            if (err) {
                console.log('saveMetadata error', err);
                deferred.reject(err);
            } else {
                console.log('inserting generated', object.generatedXml);
                this.db.index({
                    index: BASE_INDEX,
                    type: GENERATED,
                    id: id,
                    body: {
                        xml: object.generatedXml
                    }
                }, (err, object, status) => {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(object);
                    }
                })
            }
        })

        return deferred.promise;
    }
}

