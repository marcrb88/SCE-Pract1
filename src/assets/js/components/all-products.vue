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

        <div class="form-group mb-3" style="position: relative;">
            <input type="search" class="form-control-edited" placeholder="Search cryptocoins" v-model="searchQuery"
                @input="onInput" @focus="onInput" ref="myInput" @focusout="onFocusOut">
            <div class="autosuggest__results-container" v-if="showSearchedCryptos">
                <div class="autosuggest__dropdown-item" v-for="(product, index) in searchedCryptos"
                    @mousedown.prevent="onSelect(index)">{{ product.name }}</div>
            </div>
            <button class="btn btn-secondary" style="margin-left: 20px;" @click="search">Search</button>
        </div>

        <!-- Product List -->
        <button class="btn btn-secondary" style="margin-bottom: 20px;" @click="canviarOdre">Canviar ordre ({{ this.sort }})</button>
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
            <p v-if="paymentData">Payer email: {{ paymentData.payerEmail }}</p>
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
import Swal from 'sweetalert2'

export default {
    data() {
        return {
            products: [],
            sort: 'DESC',
            cartCryptos: [],
            paymentData: null,
            searchQuery: "",
            searchedCryptos: [],
            showSearchedCryptos: false,
        }
    },
    components: {
        PaymentSummary
    },

    mounted() {
        const queryParams = new URLSearchParams(window.location.search);
        const paymentDataString = queryParams.get('paymentData');
        console.log(paymentDataString)
        if (paymentDataString) {
            this.paymentData = JSON.parse(paymentDataString);
        }

        setInterval(() => {
            this.newCotization();
        }, 300000);
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

        canviarOdre: function () {
            if (this.sort == 'DESC') {
                this.sort = 'ASC'
            } else {
                this.sort = 'DESC'
            }
            this.cryptoSort();
        },

        cryptoSort: function () {
            console.log(' a vere sort de cryptoSort' + this.sort)
            if (this.sort == 'ASC') {
                this.products.sort((a, b) => a.lastQuote - b.lastQuote)
            } else {
                this.products.sort((a, b) => b.lastQuote - a.lastQuote)
            }
        },

        fetchProductData: function () {
            this.$http.get('http://localhost:3000/api/products')
                .then((response) => {
                    this.products = response.body;
                    this.cryptoSort();
                })
                .catch(error => console.error(error));
        },

        newCotization: function () {
            fetch(`http://localhost:3000/api/newCotization`)
                .then(response => response.json())
                .then(data => {
                    this.products = data;
                })
                .catch(error => console.error(error));
        },

        onInput() {
            fetch(`http://localhost:3000/api/searchCrypto?searchQuery=${this.searchQuery}`)
                .then(response => response.json())
                .then(data => {
                    this.searchedCryptos = data;
                    if (data.length > 0) {
                        this.showSearchedCryptos = true
                    } else {
                        this.showSearchedCryptos = false
                    }
                })
                .catch(error => console.error(error));
        },
        search() {
            fetch(`http://localhost:3000/api/searchCrypto?searchQuery=${this.searchQuery}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        this.products = data;
                        console.log(' a vere sort ' + this.sort)
                        this.cryptoSort()
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: "No s'ha trobat cap criptomoneda",
                            showConfirmButton: true,
                        });
                    }
                })
                .catch(error => console.error(error));
        },
        onSelect(index) {
            this.searchQuery = this.searchedCryptos[index].name
            this.showSearchedCryptos = false
        },
        onFocusOut() {
            this.showSearchedCryptos = false
        },

        addToCart: function (cryptoToAdd) {
            let cryptoInCart = this.cartCryptos.filter(product => product.name === cryptoToAdd.name);
            if (cryptoInCart.length == 0) {
                this.cartCryptos.push(cryptoToAdd);
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: "Moneda ja afegida",
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        },

        removeItem: function (index) {
            this.cartCryptos.splice(index, 1);
        },

        payMethod: function () {
            this.$http.get(`http://localhost:3000/api/createPayment?price=${this.totalPriceCart}`)
                .then((response) => {
                    window.location.href = response.data.redirectUrl;
                })
                .catch(error => {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'error',
                        title: error.data,
                        showConfirmButton: false,
                        timer: 3000
                    });
                });
        }
    }
}

</script>