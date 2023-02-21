<template>
    <div id="all-products">
        <div>
            <h1>All Products</h1>
        </div>
        <div class="flex">
            <button style="margin-bottom: 20px;" @click="cryptoSort">Canviar ordre</button>
            <div>
                <div><button class="btn btn-primary" data-toggle="modal" data-target="#cartModal">Cart ({{totalItems}})</button></div>
                    <ul>
                        <h4>productes del carrito: (//TODO marcbb un bon frontend)</h4>
                        <li v-for="(product,index) in cartCryptos">
                        <h3>{{ product.name }}</h3>
                        <p>{{ product.description }}</p>
                        <button @click="removeItem(index)"><span class="glyphicon glyphicon-trash"></span></button>
                        </li>
                        <p>Total price shopping cart:{{ totalPriceCart }} </p>
                        <button v-on:click="payMethod">PAY</button>
                        <div ref="paypal"></div>
                        <div v-if="this.paid == true">PAYMENT DONE!!!</div>
                        <div v-if="this.noCryptos == true">THERE AREN'T CRYPTOS IN THE SHOPPING CART!!!</div>
                        
                        
                    </ul>
            </div>
            
        </div>
        

        <div class="form-group">
            <div>
                <input type="text" class ="form-control-edited" v-model="searchQuery" v-on:keyup="search">
                <button style="margin-left: 20px;" @click="search">Search</button>
            </div>

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

    export default{  
        data(){
            return{
                products: [],
                originalProducts: [],
                sort: 'ASC',
                searchResults: [],
                cartCryptos: [],
                total: 0,
                paid: 'true',
                noCryptos: false
            }
        },
        mounted() {
            console.log("hola")
            setInterval(() => {
                this.newCotization();
            }, 300000);
            
        },

        computed: {
            totalPriceCart() {
                this.total = 0;
                this.cartCryptos.forEach(item => 
                {
                    let parsedCotization = parseInt(item.lastCotization)
                    this.total += parsedCotization;
                });
                return this.total;
            },
        },
            created: function()
        {
            this.fetchProductData();
        },

        methods: {
          
            cryptoSort: function() 
            {   
                if (this.sort == 'ASC') {
                    this.products.sort((a, b) => a.lastCotization - b.lastCotization)
                    this.sort = 'DESC'
                
                } else {
                    this.products.sort((a, b) => b.lastCotization - a.lastCotization)
                    this.sort = 'ASC'
                }
    
                this.$router.replace('/')
            
            },

            fetchProductData: function()
            {
                this.$http.get('http://localhost:3000/api/products').then((response) => {
                    this.products = response.body;
                    this.originalProducts = this.products;
                    this.cryptoSort();
                }, (response) => {
                });
            },

            newCotization: function()
            {   
                this.$http.post('http://localhost:3000/api/newCotization', {
                    products: this.products
                })
                .then((response) => {
                    this.products = response.body;

                }, (response) => {
                });

            },

            search: function()
            {
                this.$http.post('http://localhost:3000/api/searchCrypto' , {
                    searchQuery: this.searchQuery,
                    originalProducts: this.originalProducts 

                }).then((response) => {
                    this.products = response.body;

                }, (response) => {
                });

            },

            addToCart: function(cryptoToAdd)
            {
                // Add the item
			    let cryptoInCart = this.cartCryptos.filter(product => product.name === cryptoToAdd.name);
                
			    let isCryptoInCart = cryptoInCart.length > 0;

                if (isCryptoInCart === false) {
                    this.cartCryptos.push(cryptoToAdd);
                }
                
            },

            removeItem: function(index)
            {
                this.cartCryptos.splice(index, 1);
            },

            payMethod: function()
            {
                const script = document.createElement("script");
                script.src =
                "https://www.paypal.com/sdk/js?client-id=AVi6atpIdc8eTHpjntEJ0iME42OOwC6LUiXaHgqPnUTntMx4rEy4QZEsq8cWybvql7HB-BS2y6yw_taK";
                script.addEventListener("load", this.setLoaded);
                document.body.appendChild(script);
            },

            setLoaded: function() 
            {

                if (this.cartCryptos.length == 0) {
                            this.noCryptos = true;      
                } else {
                    window.paypal
                    .Buttons({
                        fundingSource: paypal.FUNDING.PAYPAL,
                        createOrder: (data, actions) => 
                        {
                    
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
            
                        onApprove: async (data, actions) => 
                        {
                            const order = await actions.order.capture();
                            this.paid = true;
                            console.log(order);
                        },

                        onCancel: function() 
                        {
                    
                        },

                        onError: function()  
                        {                                
                        
                        }
                    })
        
                    .render(this.$refs.paypal);
                }
            }
        }
    }

    
</script>
