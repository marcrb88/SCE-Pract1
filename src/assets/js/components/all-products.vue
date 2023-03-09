<template>
    <div id="all-products">
        <div>
            <h1>All Products</h1>
        </div>
        <div class="flex">
            <button style="margin-bottom: 20px;" @click="cryptoSort">Canviar ordre</button>
            <div>
                <div>
                    <button @click="showModal = true" type="button" class="btn btn-primary">
                        Cart
                    </button>
                    <div v-if="showModal == true" id="exampleModal" tabindex="-1" role="dialog"
                        aria-labelledby="exampleModalLabel" style="display:block">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                                    <button @click="showModal = false" type="button" class="close" data-dismiss="modal"
                                        aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <li v-for="(product, index) in cartCryptos">
                                        <h3>{{ product.name }}</h3>
                                        <p>{{ product.description }}</p>
                                        <button @click="removeItem(index)"><span
                                                class="glyphicon glyphicon-trash"></span></button>
                                        <p>Total price shopping cart:{{ totalPriceCart }} </p>
                                    </li>
                                </div>
                                <div class="modal-footer">
                                    <button @click="showModal = false" type="button" class="btn btn-secondary"
                                        data-dismiss="modal">Close</button>
                                    <button @click="payMethod" type="button" class="btn btn-primary">Save changes</button>

                                    <!---<div ref="paypal"></div>
                                            <div v-if="this.paid == true">PAYMENT DONE!!!</div>
                                            <div v-if="this.noCryptos == true">THERE AREN'T CRYPTOS IN THE SHOPPING CART!!!</div> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>


        <div class="form-group">
            <div>
                <input type="text" class="form-control-edited" v-model="searchQuery" v-on:keyup="search">
                <button style="margin-left: 20px;" @click="search">Search</button>
            </div>

        </div>

        <div>
            <h1 v-if="paymentData">Successful transaction</h1>
            <p v-if="paymentData"> Payment id: {{ paymentData.id }}</p>
            <p v-if="paymentData">Payer email: {{ paymentData.email }}</p>
            <p v-if="paymentData"> Payer first name: {{ paymentData.payerFirstName }}</p>
            <p v-if="paymentData"> Payer last name: {{ paymentData.payerLastName }}</p>
            <p v-if="paymentData">Payer id: {{ paymentData.payerId }}</p>
            <p v-if="paymentData">Amount: {{ paymentData.amount }}</p>
            <p v-if="paymentData">Currency: {{ paymentData.currency }}</p>
            <p v-if="paymentData">Create time: {{ paymentData.createTime}}</p>
        </div>

        <table class="table table-hover">
            <tbody>
                <tr v-for="product in products">
                    {{ product.name }}
                    <br>
                    {{ product.description }}

                    <div>
                        Preu historic:<br>
                        {{ product.lastCotization }}
                        <button @click="addToCart(product)" id="cart" class="btn btn-primary">Add to Cart</button>
                    </div>
                    <br>
                    <br>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import PaymentSummary from './payment-summary.vue';

export default {
    data() {
        return {
            products: [],
            originalProducts: [],
            sort: 'ASC',
            searchResults: [],
            cartCryptos: [],
            total: 0,
            paid: 'true',
            noCryptos: false,
            showModal: false,
            paymentData: null
        }
    },
    components: {
        PaymentSummary
    },
    mounted() {
        setInterval(() => {
            this.newCotization();
        }, 300000);

    },

    mounted() {
    const queryParams = new URLSearchParams(window.location.search);
    const paymentDataString = queryParams.get('paymentData');
    console.log(paymentDataString)
    if (paymentDataString) {
      this.paymentData = JSON.parse(paymentDataString);
    }
  },

    computed: {
        totalPriceCart() {
            this.total = 0;
            this.cartCryptos.forEach(item => {
                let parsedCotization = parseInt(item.lastCotization)
                this.total += parsedCotization;
            });
            return this.total;
        },
    },
    created: function () {
        this.fetchProductData();
    },

    methods: {

        cryptoSort: function () {
            if (this.sort == 'ASC') {
                this.products.sort((a, b) => a.lastCotization - b.lastCotization)
                this.sort = 'DESC'

            } else {
                this.products.sort((a, b) => b.lastCotization - a.lastCotization)
                this.sort = 'ASC'
            }

            this.$router.replace('/')

        },

        fetchProductData: function () {
            this.$http.get('http://localhost:3000/api/products').then((response) => {
                this.products = response.body;
                this.originalProducts = this.products;
                this.cryptoSort();
            }, (response) => {
            });
        },

        newCotization: function () {
            this.$http.post('http://localhost:3000/api/newCotization', {
                products: this.products
            })
                .then((response) => {
                    this.products = response.body;

                }, (response) => {
                });

        },

        search: function () {
            this.$http.post('http://localhost:3000/api/searchCrypto', {
                searchQuery: this.searchQuery,
                originalProducts: this.originalProducts

            }).then((response) => {
                this.products = response.body;

            }, (response) => {
            });

        },

        addToCart: function (cryptoToAdd) {
            // Add the item
            let cryptoInCart = this.cartCryptos.filter(product => product.name === cryptoToAdd.name);

            let isCryptoInCart = cryptoInCart.length > 0;

            if (isCryptoInCart === false) {
                this.cartCryptos.push(cryptoToAdd);
            }

        },

        removeItem: function (index) {
            this.cartCryptos.splice(index, 1);
        },

        payMethod: function () {

            this.$http.get(`http://localhost:3000/api/createPayment?price=${this.totalPriceCart}`)
                .then((response) => {
                    console.log("payment done")
                    window.location.href = response.data.redirectUrl;

                }, (response) => {
                });
        }


        /*payMethod: function () {
            const script = document.createElement("script");
            script.src =
                "https://www.paypal.com/sdk/js?client-id=AVi6atpIdc8eTHpjntEJ0iME42OOwC6LUiXaHgqPnUTntMx4rEy4QZEsq8cWybvql7HB-BS2y6yw_taK";
            script.addEventListener("load", this.setLoaded);
            document.body.appendChild(script);

        },

        setLoaded: function () {

            if (this.cartCryptos.length == 0) {
                this.noCryptos = true;
            } else {
                window.paypal
                    .Buttons({
                        fundingSource: paypal.FUNDING.PAYPAL,
                        createOrder: (data, actions) => {

                            return actions.order.create
                                ({
                                    purchase_units:
                                        [
                                            {
                                                description: "Pagament PayPal Marc's exchange",
                                                amount: {
                                                    currency_code: "USD",
                                                    value: this.totalPriceCart
                                                }
                                            }
                                        ]
                                });
                        },

                        onApprove: async (data, actions) => {
                            const order = await actions.order.capture();
                            this.paid = true;
                            //console.log(order);

                            this.$router.push({
                                name: 'payment_summary',
                                params: { order: JSON.stringify(order) }
                            })

                        },

                        onCancel: function () {

                        },

                        onError: function () {

                        }
                    })
                    .render(this.$refs.paypal);

            }
        }*/
    }
}

</script>
