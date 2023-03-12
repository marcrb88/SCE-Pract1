<template>
    <div id="all-products">
        <div>
            <h1>All Products</h1>
        </div>

        <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#exampleModal">
            Cart ({{ cartCryptos.length }})
        </button>

        <!-- Modal -->
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Shopping Cart</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-sm-8">
                                <table class="table table-hover">
                                    <tbody>
                                        <tr v-for="(product, index) in cartCryptos">
                                            <td>
                                                <img :src="product.image" width='32' height='32'>
                                            </td>
                                            <td>
                                                <p>{{ product.name }}</p>
                                                <p style="font-size: small;">{{ product.description }}</p>
                                            </td>
                                            <td>
                                                <p>€{{ product.lastQuote }}</p>
                                            </td>
                                            <td>
                                                <button @click="removeItem(index)" style="border: 0;">
                                                    <i class="fa fa-trash" aria-hidden="true"></i>
                                                </button>
                                            </td>
                                        </tr>
                                        <tr v-show="cartCryptos.length === 0">
                                            <td colspan="4" class="text-center">Cart is empty</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="col-sm-4">
                                <div class="row">
                                    <div class="col-sm-6">Total ({{ cartCryptos.length }})</div>
                                    <div class="col-sm-6">€{{ totalPriceCart }}</div>
                                </div>
                                <br>
                                <button type="button" class="btn btn-primary w-100 btn-block"
                                    @click="payMethod">Checkout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="form-group mb-3">
            <input type="text" class="form-control-edited" placeholder="Search cryptocoins" v-model="searchQuery">
            <button class="btn btn-secondary" style="margin-left: 20px;" @click="search">Search</button>
        </div>

        <!-- Product List -->
        <button class="btn btn-secondary" style="margin-bottom: 20px;" @click="cryptoSort">Canviar ordre</button>
        <div class="grid-container">
            <div v-for="(product, index) in products" :key="index" class="grid-item">
                <div style="height: 60%;">
                    <div>
                        <img :src="product.image" width='64' height='64'><b><span
                                style="font-size: 24px; padding-left:15px;">{{ product.name }}</span></b>
                    </div><br>
                    <p>{{ product.description }}</p>
                </div>
                <hr>
                <h3><b>Price History</b></h3>
                <div class="row">
                    <div class="col-sm-8">
                        <p>€{{ product.lastQuote }} <span style="font-size: 12px; vertical-align: middle;">{{
                            product.lastQuoteTime }}</span></p>
                    </div>
                    <div class="col-sm-4">
                        <button @click="addToCart(product)" class="btn btn-primary">Add to Cart</button>
                    </div>
                </div>
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
            <p v-if="paymentData">Create time: {{ paymentData.createTime }}</p>
        </div>
    </div>
</template>

<script>
import PaymentSummary from './payment-summary.vue';

export default {
    data() {
        return {
            products: [],
            originalProducts: [],
            sort: 'DESC',
            cartCryptos: [],
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
            let total = 0;
            this.cartCryptos.forEach(item => {
                total += item.lastQuote;
            });
            return total.toFixed(2);
        },
    },
    created: function () {
        this.fetchProductData();
    },

    methods: {

        cryptoSort: function () {
            if (this.sort == 'ASC') {
                this.products.sort((a, b) => a.lastQuote - b.lastQuote)
                this.sort = 'DESC'

            } else {
                this.products.sort((a, b) => b.lastQuote - a.lastQuote)
                this.sort = 'ASC'
            }
        },

        fetchProductData: function () {
            this.$http.get('http://localhost:3000/api/products').then((response) => {
                this.products = response.body;
                this.originalProducts = this.products;
                this.cryptoSort();
            });
        },

        newCotization: function () {
            this.$http.post('http://localhost:3000/api/newCotization', {
                products: this.products
            }).then((response) => {
                this.products = response.body;
            });
        },

        search: function () {
            this.$http.post('http://localhost:3000/api/searchCrypto', {
                searchQuery: this.searchQuery,
                originalProducts: this.originalProducts

            }).then((response) => {
                this.products = response.body;
            });
        },

        addToCart: function (cryptoToAdd) {
            let cryptoInCart = this.cartCryptos.filter(product => product.name === cryptoToAdd.name);
            if (cryptoInCart.length == 0) {
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
