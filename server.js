var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const cors = require('cors');
app.use(cors());

var PRODUCTS_FILE = path.join(__dirname, 'src/assets/js/components/product-data.json');

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
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        }
    };

    paypal.payment.create(paymentData, (error, payment) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error al crear el pago');
        } else {
            const redirectUrl = payment.links.find((link) => link.rel === 'approval_url').href;
            res.send({ redirectUrl });
        }
    });
});


app.get('/success', function (req, res) {
    const paymentId = req.query.paymentId;

    paypal.payment.get(paymentId, function (error, payment) {
        if (error) {
            console.log(error);
        } else {
            console.log(payment);

            const paymentData = {
                id : payment.id,
                payerEmail : payment.payer.payer_info.email,
                payerFirstName : payment.payer.payer_info.first_name,
                payerLastName : payment.payer.payer_info.last_name,
                payerId : payment.payer.payer_info.payer_id,
                amount : payment.transactions[0].amount.total,
                currency : payment.transactions[0].amount.currency,
                createTime : payment.create_time

              };

            res.redirect(`http://localhost:8080?paymentData=${JSON.stringify(paymentData)}`);
        }
    });
});



app.post('/api/searchCrypto', function (req, res) {

    const searchQuery = req.body.searchQuery;
    const originalProducts = req.body.originalProducts;

    var returnProducts = false;

    if (searchQuery == '')
        returnProducts = true;

    else {
        var searchedCryptos = [];
        for (var i = 0; i < originalProducts.length; i++) {
            var productName = originalProducts[i]['name'].toLowerCase();

            if (productName.indexOf(searchQuery.toLowerCase()) >= 0) {
                searchedCryptos.push(originalProducts[i]);
            }
        }

    }

    returnProducts ? res.json(originalProducts) : res.json(searchedCryptos);

});


app.post('/api/newCotization', function (req, res) {

    const products = req.body.products

    for (var i = 0; i < products.length; i++)
        products[i].lastCotization = Math.floor(Math.random() * 256);

    res.json(products);


});

app.get('/api/products', function (req, res) {

    fs.readFile(PRODUCTS_FILE, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(JSON.parse(data));
    });
});


app.get('/api/product/:id', function (req, res) {

    fs.readFile(PRODUCTS_FILE, function (err, data) {
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

app.post('/api/product/create', function (req, res) {

    fs.readFile(PRODUCTS_FILE, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        var products = JSON.parse(data);

        var newProduct = {
            id: Date.now(),
            name: req.body.name,
            price: req.body.price,
        };
        products.push(newProduct);
        fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 4), function (err) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            res.json(products);
        });
    });
});

app.patch('/api/product/edit/:id', function (req, res) {
    fs.readFile(PRODUCTS_FILE, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        var products = JSON.parse(data);

        for (var i = 0; i <= products.length; i++) {
            if (products[i]['id'] == req.params.id) {
                var product = products[i];
                product.name = req.body.name;
                product.price = req.body.price;

                products.splice(i, 1);
                products.push(product);

                fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 4), function (err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(products);
                });
                break;
            }
        }
    });
});

app.delete('/api/product/delete/:id', function (req, res) {
    fs.readFile(PRODUCTS_FILE, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        var products = JSON.parse(data);

        for (var i = 0; i <= products.length; i++) {
            if (products[i]['id'] == req.params.id) {
                products.splice(i, 1);

                fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 4), function (err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(products);
                });
                break;
            }
        }
    });
});


app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});

