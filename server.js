var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const cors = require('cors');
const axios = require('axios');
app.use(cors());

var CRYPTOCURRENCIES_FILE = path.join(__dirname, 'src/assets/js/components/cryptocurrency-data.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Additional middleware which will set headers that we need on each request.
app.use(function (req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});


const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AVi6atpIdc8eTHpjntEJ0iME42OOwC6LUiXaHgqPnUTntMx4rEy4QZEsq8cWybvql7HB-BS2y6yw_taK',
    'client_secret': 'EFH3PFmNWVD09SAVN5GXOiSl6EsizYnSE0IdHgEBs76gDsfvGaX0UCqPHlwEn__DvmE7uBfnIKYRgjuZ'
});



app.get('/api/createPayment', function (req, res) {
    const price = req.query.price;

    const paymentData = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "transactions": [{
            "amount": {
                "total": price,
                "currency": "USD"
            },
            "description": "Compra en línea"
        }],
        "redirect_urls": {
            "return_url": "http://localhost:3000/process",
            "cancel_url": "http://localhost:3000/cancel"
        }
    };

    paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error al crear el pagament');
        } else {
            const redirectUrl = payment.links.find((link) => link.rel === 'approval_url').href;
            res.send({ redirectUrl });
        }
    });
});


app.get('/process', function (req, res) {
    const paymentId = req.query.paymentId;
    
    paypal.payment.get(paymentId, function (error, payment) {
        if (error) {
            console.log(error);
        } else {
            console.log(payment);

            const paymentData = {
                id: payment.id,
                payerEmail: payment.payer.payer_info.email,
                payerFirstName: payment.payer.payer_info.first_name,
                payerLastName: payment.payer.payer_info.last_name,
                payerId: payment.payer.payer_info.payer_id,
                amount: payment.transactions[0].amount.total,
                currency: payment.transactions[0].amount.currency,
                createTime: payment.create_time

            };
            console.log(paymentData);
            console.log("hola");
            res.redirect(`http://localhost:8080/payment-summary?order=${JSON.stringify(paymentData)}`);

        }
    });
});

app.get('/cancel', function (req, res) {
    res.redirect(`http://localhost:8080`);
});


app.get('/api/searchCrypto', function (req, res) {
    fs.readFile(CRYPTOCURRENCIES_FILE, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        var cryptocurrencies = JSON.parse(data);
        const searchQuery = req.query.searchQuery;

        if (searchQuery == "")
            res.json(cryptocurrencies)
        else {
            res.json(cryptocurrencies.filter(x => x.name.toLowerCase().startsWith(searchQuery)))
        }
    });
});


app.post('/api/cryptocurrencies', function (req, res) {
    fs.readFile(CRYPTOCURRENCIES_FILE, function (err, data) {
        if (err) {
            console.error(err);
            console.exit(1);
        }
        var cryptos = JSON.parse(data);
        var cryptosShowedIds = req.body.cryptosShowedIds;

        res.json(cryptos.filter(x => cryptosShowedIds.includes(x.id)));
    })
});


app.get('/api/cryptocurrencies', function (req, res) {

    fs.readFile(CRYPTOCURRENCIES_FILE, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(JSON.parse(data));
    });
});


app.get('/api/cryptocurrency/:id', function (req, res) {

    fs.readFile(CRYPTOCURRENCIES_FILE, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        var json = JSON.parse(data);

        for (var i = 0; i <= json.length; i++) {
            if (json[i]['id'] == req.params.id) {
                res.json(json[i]);
                break;
            }
        }
    });
});


app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});

setInterval(() => {
    fs.readFile(CRYPTOCURRENCIES_FILE, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        var json = JSON.parse(data);
        json.forEach(x => {
            x.lastQuote = parseFloat((x.lastQuote + (Math.random() * 100 - 50)).toFixed(2));
            if (parseFloat(x.lastQuote) < 0.0)
                x.lastQuote = 0.0;
            x.lastQuoteTime = new Date(Date.now()).toUTCString();
        });
        fs.writeFile(CRYPTOCURRENCIES_FILE, JSON.stringify(json), function (err) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });
}, 5000);