<template>
    <div id="all-products">
        <div>
            <h1>All Products</h1>
        </div>
        <div>
            <button style="margin-bottom: 20px;" @click="cryptoSort">Canviar ordre</button>
        </div>
        

        <div class="form-group">
            <input type="text" name="search" v-model="productSearch" placeholder="Search cryptocoins" class="form-control-edited" >
            <button style="margin-left: 20px;" @click="searchCryptos">Search</button>
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
                        <button id="cart" class="btn btn-primary">Add to Cart</button>
                    </div>
                    <br>
                    <br>
                    <td>
                        <router-link :to="{name: 'edit_product', params: { id: product.id }}" class="btn btn-primary">Edit</router-link>
                        <router-link :to="{name: 'delete_product', params: { id: product.id }}" class="btn btn-danger">Delete</router-link>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import axios from 'axios';
    
    export default{
        data(){
            return{
                products: [],
                originalProducts: [],
                sort: 'ASC',
                searchResults: []
            }
        },

        created: function()
        {
            this.fetchProductData();
        },

        methods: {
          
            cryptoSort: function() 
            {   
                console.log("sort abans d'entrar als ifs"+ this.sort);
                if (this.sort == 'ASC') {
                    this.products.sort((a, b) => a.lastCotization - b.lastCotization)
                    this.sort = 'DESC'
                    console.log("sort a descendent"+ this.sort);
                
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

            searchCryptos: function()
            {
                axios.post('http://localhost:3000/api/searchCryptos', { params: { cryptoText: this.productSearch, originalProducts: JSON.stringify(this.originalProducts) } })
                .then(response => {
                    this.products = response.data;
                })
                .catch(error => {
                    console.error(error);
                });


                /*if(this.productSearch == '')
                {
                    this.products = this.originalProducts;
                    return;
                }

                var searchedProducts = [];
                for(var i = 0; i < this.originalProducts.length; i++)
                {
                    var productName = this.originalProducts[i]['name'].toLowerCase();
                    if(productName.indexOf(this.productSearch.toLowerCase()) >= 0)
                    {
                        searchedProducts.push(this.originalProducts[i]);
                    }
                }

                this.products = searchedProducts;
                */


            }
        }
    }
</script>
