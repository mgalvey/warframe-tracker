import {Globals} from './globals';

export class App {

  constructor() {
    this.globals = new Globals();
    this.window = window;
    console.log('App: ', this)
  }

  configureRouter(config, router) {
    config.title = 'Warframe Mastery Tracker';
    config.map([
      { route: ['', 'tracker'], name: 'tracker',      moduleId: 'tracker',      nav: true, title: 'Tracker' },
      { route: ['advanced'], name: 'advanced',      moduleId: 'advanced',      nav: true, title: 'Advanced' },
    ]);

    this.router = router;
  }
}
