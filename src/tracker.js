import {App} from './app';
import {inject} from 'aurelia-framework';

@inject(App)
export class Tracker {
  constructor(app) {
    this.app = app;
  }
}
