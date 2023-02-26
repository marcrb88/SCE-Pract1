import Vue from 'vue'

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import VueResource from 'vue-resource';
Vue.use(VueResource);


import App from './App.vue'

const AllProducts = require('./assets/js/components/all-products.vue');
const paymentSummary = require('./assets/js/components/payment-summary.vue');

const routes = [
    {
        name: 'all_products',
        path: '/',
        component: AllProducts
    },
    {
        name: 'payment_summary',
        path: '/payment-summary',
        component: paymentSummary
    }
];
var router = new VueRouter({ routes: routes, mode: 'history' });
new Vue(Vue.util.extend({ router }, App)).$mount('#app');