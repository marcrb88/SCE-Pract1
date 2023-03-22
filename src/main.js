import Vue from 'vue'


import VueRouter from 'vue-router'
Vue.use(VueRouter)

import VueResource from 'vue-resource';
Vue.use(VueResource);


import App from './App.vue'

const AllCryptocurrencies = require('./assets/js/components/all-cryptocurrencies.vue');
const paymentSummary = require('./assets/js/components/payment-summary.vue');

const routes = [
    {
        name: 'all_cryptocurrencies',
        path: '/',
        component: AllCryptocurrencies
    }
];
var router = new VueRouter({ routes: routes, mode: 'history' });
new Vue(Vue.util.extend({ router }, App)).$mount('#app');