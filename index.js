"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Fabio Pavesi <fabio@adamassoft.it>
 *
 */
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var UUID = require("uuid");
var BO_1 = require("./businessLogic/BO");
var fs = require("fs");
var path = require("path");
var q = require("q");
var MD_TOPIC = 'receivedMetadata';
var REDIS_HOST = process.env.REDIS_HOST || 'redis';
var redis = require("redis");
var sub = redis.createClient({
    host: REDIS_HOST
});
var pub = redis.createClient({
    host: REDIS_HOST
});
var msg_count = 0;
sub.subscribe(MD_TOPIC);
sub.on("message", function (channel, message) {
    console.log("sub channel " + channel + ": " + message);
    if (channel === MD_TOPIC) {
        bo.saveMetadata(JSON.parse(message))
            .then(function (result) {
            console.log('MD saved');
        })
            .catch(function (err) {
            console.log('error saving MD', err);
        });
    }
    msg_count += 1;
    if (msg_count === 3) {
        /*
                sub.unsubscribe();
                sub.quit();
                pub.quit();
        */
    }
});
var config;
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.json')).toString());
    console.log('config', config);
}
catch (err) {
    console.log('config/config.json NOT FOUND');
    process.exit(1);
}
var app = express();
var bo = new BO_1.BO();
/*
setTimeout( () => {
    bo = new BO();
}, 10000);

*/
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
app.get('/metadata/:id\.:ext', function (req, res, next) {
    var getXML = function () {
        bo.getMetadatum(req.params.id, true)
            .then(function (result) {
            console.log('returning', result.xml);
            res.status(200).type("application/xml").send(result.xml);
        });
    };
    var getJSON = function () {
        bo.getMetadatum(req.params.id, false)
            .then(function (result) {
            res.type('json').status(200).json(result);
        });
    };
    if (req.params.ext == 'xml') {
        getXML();
    }
    else if (req.params.ext == 'json') {
        getJSON();
    }
    else {
        res.status(500).json({
            status: 500,
            message: 'Unsupported output format \'' + req.params.ext + '\''
        });
    }
    /*
        res.status(200).send(getXML());
    */
});
app.get('/metadata/:id', function (req, res, next) {
    var getXML = function () {
        bo.getMetadatum(req.params.id, true)
            .then(function (result) {
            res.status(200).send(result.xml);
        });
    };
    var getJSON = function () {
        bo.getMetadatum(req.params.id, false)
            .then(function (result) {
            res.type('json').status(200).json(result);
        });
    };
    res.format({
        xml: getXML,
        json: getJSON,
        html: getJSON,
        default: getJSON
    });
});
app.get('/metadata', function (req, res, next) {
    bo.getMetadata()
        .then(function (result) {
        res.status(200).json(result);
    });
});
app.get('/discover/:query', function (req, res, next) {
    bo.searchMetadata(req.params.query)
        .then(function (result) {
        res.status(200).json(result);
    });
});
app.post('/metadata', function (req, res, next) {
    // console.log('POST metadata', req.body);
    setTimeout(function () {
        pub.publish(MD_TOPIC, JSON.stringify(req.body));
    }, 100);
    res.status(202).json({
        status: 202,
        message: 'Ok'
    });
});
app.get('/correctUrls', function (req, res, next) {
    bo.getMetadata()
        .then(function (result) {
        var promises = [];
        for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
            var r = result_1[_i];
            console.log('prima', r._source.fileUri);
            r._source.fileUri = r._source.fileUri.replace(/http:\/\/localhost:3001/, 'https://enygma.it/edi-catalogue');
            console.log('dopo', r._source.fileUri);
            promises.push(bo.saveEDIML(r._id, r._source));
        }
        q.all(promises)
            .then(function (result3) {
            res.status(200).json(result);
        });
    });
});
app.get('/requestId', function (req, res, next) {
    res.status(200).send(config.url + 'metadata/' + UUID());
});
app.get('/templates/:id', function (req, res, next) {
    var getJSON = function () {
        bo.getTemplate(req.params.id)
            .then(function (result) {
            res.type('json').status(200).json(result);
        });
    };
    res.format({
        json: getJSON,
        html: getJSON,
        default: getJSON
    });
});
app.get('/templates', function (req, res, next) {
    bo.getTemplates()
        .then(function (result) {
        res.status(200).json(result);
    });
});
app.get('/templates/discover/:query', function (req, res, next) {
    bo.searchTemplates(req.params.query)
        .then(function (result) {
        res.status(200).json(result);
    });
});
app.post('/templates', function (req, res, next) {
    // console.log('POST metadata', req.body);
    bo.saveTemplate(req.body)
        .then(function (result) {
        res.status(200).json(result);
    })
        .catch(function (err) {
        res.status(500).json(err);
    });
});
app.get('/', function (req, res, next) {
    var manifest = {
        server: 'EDI Catalogue',
        version: '1.00',
        url: config.url
    };
    res.status(200).json(manifest);
});
var server = app.listen(config.port, function () {
    console.log('Server listening on port ' + config.port);
});
//# sourceMappingURL=index.js.map