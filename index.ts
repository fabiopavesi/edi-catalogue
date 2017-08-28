/**
 * @author Fabio Pavesi <fabio@adamassoft.it>
 *
 */
import * as express from "express";
import * as bodyParser from "body-parser"
import * as cors from "cors";
import * as UUID from 'uuid';
import {DB} from './model/db';
import {BO} from './businessLogic/BO';
import * as fs from 'fs';
import * as path from 'path';

let config;
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.json')).toString());
    console.log('config', config);
} catch (err) {
    console.log('config/config.json NOT FOUND');
    process.exit(1);
}

var app = express();
var bo = new BO();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());

app.get('/metadata/:id\.:ext', (req, res, next) => {
    let getXML = () => {
        bo.getMetadatum(req.params.id, true)
            .then((result) => {
                console.log('returning', result.xml);
                res.status(200).type("application/xml").send(result.xml)
            })
    };
    let getJSON = () => {
        bo.getMetadatum(req.params.id, false)
            .then((result) => {
                res.type('json').status(200).json(result)
            })
    }
    if ( req.params.ext == 'xml') {
        getXML();
    } else if ( req.params.ext == 'json' ) {
        getJSON();
    } else {
        res.status(500).json({
            status: 500,
            message: 'Unsupported output format \'' + req.params.ext + '\''
        })
    }
/*
    res.status(200).send(getXML());
*/
});

app.get('/metadata/:id', (req, res, next) => {
    let getXML = () => {
        bo.getMetadatum(req.params.id, true)
            .then((result) => {
                res.status(200).send(result.xml)
            })
    };
    let getJSON = () => {
        bo.getMetadatum(req.params.id, false)
            .then((result) => {
                res.type('json').status(200).json(result)
            })
    }
    res.format({
        xml: getXML,
        json: getJSON,
        html: getJSON,
        default: getJSON
    });
});

app.get('/metadata', (req, res, next) => {
    bo.getMetadata()
        .then((result) => {
            res.status(200).json(result)
        })
});

app.get('/discover/:query', (req, res, next) => {
    bo.searchMetadata(req.params.query)
        .then((result) => {
            res.status(200).json(result)
        })
});

app.post('/metadata', (req, res, next) => {
    // console.log('POST metadata', req.body);
    bo.saveMetadata(req.body)
        .then((result) => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json(err);
        })
})

app.get('/requestId', (req, res, next) => {
    res.status(200).send(config.url + 'metadata/' + UUID());
})

app.get('/templates/:id', (req, res, next) => {
    let getJSON = () => {
        bo.getTemplate(req.params.id)
            .then((result) => {
                res.type('json').status(200).json(result)
            })
    }
    res.format({
        json: getJSON,
        html: getJSON,
        default: getJSON
    });
});

app.get('/templates', (req, res, next) => {
    bo.getTemplates()
        .then((result) => {
            res.status(200).json(result)
        })
});

app.get('/templates/discover/:query', (req, res, next) => {
    bo.searchTemplates(req.params.query)
        .then((result) => {
            res.status(200).json(result)
        })
});

app.post('/templates', (req, res, next) => {
    // console.log('POST metadata', req.body);
    bo.saveTemplate(req.body)
        .then((result) => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json(err);
        })
})


app.get('/', (req, res, next) => {
    let manifest = {
        server: 'EDI Catalogue',
        version: '1.00',
        url: config.url
    };

    res.status(200).json(manifest)
})

var server = app.listen(config.port, function () {
    console.log('Server listening on port ' + config.port);
});
