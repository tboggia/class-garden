import Vue from 'nativescript-vue';
import Home from './components/Home.vue';

declare let __DEV__: boolean;

Vue.config.silent = !__DEV__;

new Vue({
  render: (h) => h('frame', [h(Home)]),
}).$start();