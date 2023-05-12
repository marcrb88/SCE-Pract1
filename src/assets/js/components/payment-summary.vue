<template>
    <div>
      <h1>Resum de la compra</h1>
        InformaciÃ³ de l'ordre  {{this.order }} <br>
        
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
            console.log(this.order);
        }
}

</script>