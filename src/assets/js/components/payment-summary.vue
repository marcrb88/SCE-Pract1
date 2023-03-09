<template>
    <div>
      <h1>Resum de la compra</h1>
        Informació de l'ordre  {{this.order.id }} <br>
        Status: {{ this.order.status }} <br>
        Descripcio: {{ this.order.purchase_units[0].description }} <br>
        Moneda: {{ this.order.purchase_units[0].amount.currency_code }} <br>
        Valor:{{ this.order.purchase_units[0].amount.value }} <br>
        Data de realització: {{ this.order.create_time }} <br><br>
        Informacio del comprador:
            Email: {{ this.order.payer.email_address }} <br>
            Nom: {{ this.order.payer.name.given_name }} <br>
            Cognom: {{ this.order.payer.name.surname }} <br>
    </div>
</template>
  
<script>
    export default {
        data(){
            return{
                order:''
            }
        },
        props: {
            order: {
                type: JSON,
                required: true
            }
        }
}

</script>
