<template>
    <div style="display: flex; justify-content: center; align-items: center;">
        <div class="col-12 col-md-8" style="text-align: center;">
            <h1>Resum de la compra</h1>
            <b>
                <div style="text-align: left;">
                    <p>Informacio de l'ordre</p>
                    <hr>
                    <div style="display: flex; justify-content: space-between;">
                        <div>Nº ORDRE</div>
                        <div style="text-align: right;">{{ this.order.id }}</div>
                    </div>
                    <hr>
                    <div style="display: flex; justify-content: space-between;">
                        <div>DATA</div>
                        <div style="text-align: right;">{{ this.order.createTime.replace("T", " ").replace("Z", "") }}</div>
                    </div>
                    <br><br>

                    <p>Dades d'enviament</p>
                    <hr>
                    <div style="display: flex; justify-content: space-between;">
                        <div>NOM</div>
                        <div style="text-align: right;">{{ this.order.payerFirstName }} {{ this.order.payerLastName }}</div>
                    </div>
                    <hr>
                    <div style="display: flex; justify-content: space-between;">
                        <div>EMAIL</div>
                        <div style="text-align: right;">{{ this.order.payerEmail }}</div>
                    </div>
                    <br><br>


                    <p>Detall del pagament</p>
                    <hr>
                    <div style="display: flex; justify-content: space-between;">
                        <div>METODE DE PAGAMENT</div>
                        <div style="text-align: right;">{{ this.order.payment_method }}</div>
                    </div>
                    <hr>
                    <div style="display: flex; justify-content: space-between;">
                        <div>TOTAL</div>
                        <div style="text-align: right;">{{ this.order.amount }} {{ this.order.currency }}</div>
                    </div>
                </div>
            </b>
            <br>

            <div style="text-align: right;">
                <router-link to="/" class="btn btn-primary">Tornar a la pàgina principal</router-link>
            </div>
        </div>
    </div>
</template>
  
<script>
export default {
    data() {
        return {
            order: ''
        }
    },
    mounted() {
        document.title = "Marc's Exchange - Payment Summary";
        this.order = JSON.parse(this.$route.query.order);
    }
}

</script>