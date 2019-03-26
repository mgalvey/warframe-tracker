import {App} from './app';
import {inject} from 'aurelia-framework';

@inject(App)
export class Advanced {
  constructor(app) {
    this.app = app;
    console.log('Advanced loaded.');
  }
}