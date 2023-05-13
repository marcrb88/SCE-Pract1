<template>
    <div id="all-cryptocurrencies">
        <div class="sticky-top card mb-3">
            <div class="card-header">
                <div class="text-end mt-2 mb-3">
                    <button class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#exampleModal">
                        <i class="bi bi-cart4"></i>({{ cartCryptos.length }})
                    </button>
                </div>
                <div class="d-flex justify-content-between">
                    <div class="input-group">
                        <div class="form-group" style="position: relative; width: 60%;">
                            <input type="search" class="form-control" placeholder="Search cryptocoins" v-model="searchQuery"
                                @input="onInput" @focus="onInput" ref="myInput" @focusout="onFocusOut">
                            <div class="autosuggest__results-container" v-if="showSearchedCryptos">
                                <div class="autosuggest__dropdown-item" v-for="(cryptocurrency, index) in searchedCryptos"
                                    @mousedown.prevent="onSelect(index)">{{ cryptocurrency.name }}</div>
                            </div>
                        </div>
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary bi bi-search" type="button" @click="search"></button>
                        </div>
                    </div>
                    <button class="btn btn-outline-secondary col-auto"
                        :class="this.sort === 'ASC' ? 'bi-arrow-up' : 'bi-arrow-down'" @click="canviarOdre">Price</button>

                </div>
            </div>
        </div>

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
                                        <tr v-for="(cryptocurrency, index) in cartCryptos">
                                            <td>
                                                <img :src="cryptocurrency.image" width='32' height='32'>
                                            </td>
                                            <td>
                                                <p>{{ cryptocurrency.name }}</p>
                                                <p style="font-size: small;">{{ cryptocurrency.description }}</p>
                                            </td>
                                            <td>
                                                <p>€{{ cryptocurrency.lastQuote }}</p>
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



        <div class="grid-container">
            <div v-for="(cryptocurrency, index) in cryptocurrencies" :key="index" class="grid-item">
                <div style="height: 60%;">
                    <div>
                        <img :src="cryptocurrency.image" width='64' height='64'><b><span
                                style="font-size: 24px; padding-left:15px;">{{ cryptocurrency.name }}</span></b>
                    </div><br>
                    <p>{{ cryptocurrency.description }}</p>
                </div>
                <hr>
                <h4><b>Price History</b></h4>
                <div class="row">
                    <div class="col-8">
                        <h3>€{{ cryptocurrency.lastQuote }} <span style="font-size: 12px; vertical-align: middle;">{{
                            new Date(cryptocurrency.lastQuoteTime).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                            }) }}</span></h3>
                    </div>
                    <div class="col-4">
                        <button @click="addToCart(cryptocurrency)" class="btn btn-primary btn-lg"><i
                                class="bi bi-cart-plus"></i></button>
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
            cryptocurrencies: [],
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
        setInterval(() => {
            this.fetchCryptosShowed();
        }, 5000);
    },

    computed: {
        totalPriceCart() {
            let total = 0;
            this.cartCryptos.forEach(x => {
                total += x.lastQuote;
            });
            return total.toFixed(2);
        },
    },

    created: function () {
        this.fetchCryptocurrencies();
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
            if (this.sort == 'ASC') {
                this.cryptocurrencies.sort((a, b) => a.lastQuote - b.lastQuote)
            } else {
                this.cryptocurrencies.sort((a, b) => b.lastQuote - a.lastQuote)
            }
        },

        fetchCryptocurrencies: function () {
            this.$http.get('http://localhost:3000/api/cryptocurrencies')
                .then((response) => {
                    this.cryptocurrencies = response.body;
                    this.cryptoSort();
                })
                .catch(error => console.error(error));
        },

        fetchCryptosShowed: function () {
            fetch(`http://localhost:3000/api/cryptocurrencies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cryptosShowedIds: this.cryptocurrencies.map(x => x.id) })
            })
                .then(response => response.json())
                .then(data => {
                    this.cryptocurrencies = data;
                    this.cryptoSort();
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
                        this.cryptocurrencies = data;
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
            if (!this.cartCryptos.map(x => x.id).includes(cryptoToAdd.id)) {
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