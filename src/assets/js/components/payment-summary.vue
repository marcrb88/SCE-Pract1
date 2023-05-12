<template>
    <div>
      <h1>Resum de la compra</h1>
        Informacio de l'ordre:<br>
        ID: {{ this.order.id }} <br>
        Payer Email: {{ this.order.payerEmail }}<br>
        First Name: {{ this.order.payerFirstName }}<br>
        Last Name: {{ this.order.payerLastName }}<br>
        Payer ID: {{ this.order.payerId }}<br>
        Amount: {{ this.order.amount }}<br>
        Currency: {{ this.order.currency }}<br>
        Create Time: {{ this.order.createTime }}<br><br>

        <router-link to="/" class="btn btn-primary">Tornar a la pàgina principal</router-link>
    </div>
</template>
  
<script>
    export default {
        data(){
            return{
                order:''
            }
        },
        mounted() {
            const order= this.$route.query.order;
            this.order = JSON.parse(order);
        }
}

</script>