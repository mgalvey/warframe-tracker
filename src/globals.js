import { computedFrom } from 'aurelia-framework';

export class Globals {
  constructor() {
    // let s = new HttpClient();
    this.allVisible = true;
    this.showOnly = [
      'Warframes', 'Primary', 'Secondary', 'Melee', 'Amps', 'Sentinels', 'Pets', 'Moas', 'Zaws', 'Archwing'
    ];
    this.textSearch = '';
    this.complete = {};
    this.owned = {};
    this.hideComplete = false;
    this.allItems = [];
    this.cols = 4;

    this.usefulCategories = [
      'Warframes', 'Primary', 'Secondary', 'Melee', 'Amps', 'Sentinels', 'Pets', 'Moas', 'Zaws', 'Archwing'
    ];

    var sec = new RegExp('^/Lotus/Weapons.*?/Secondary/');
    var moa = new RegExp('/Lotus/Types/Friendly/Pets/MoaPets/MoaPetParts/MoaPetHead');
    var zaw = new RegExp('/Lotus/Weapons/Ostron/Melee/ModularMelee.*?/Tip/');
    var zaw2 = new RegExp('/Lotus/Weapons/Ostron/Melee/ModularMeleeInfested/Tips/');
    var amp = new RegExp('/Lotus/Weapons/.*?/OperatorAmplifiers/Set.*?/Barrel/');
    var amp2 = new RegExp('/Lotus/Weapons/Sentients/OperatorAmplifiers/SentTrainingAmplifier/SentAmpTrainingBarrel');
    var sw = new RegExp('/Lotus/Types/Sentinels/SentinelWeapons/');
    this.categoryOverrides = [
      [sec, 'Secondary'], [moa, 'Moas'], [zaw, 'Zaws'], [amp, 'Amps'], [amp2, 'Amps'],
      [sw, 'Sentinels'], [zaw2, 'Zaws']
    ];

    this.loadState();

    // Allow for new categories to be added without killing everything else.
    for(var cat of this.usefulCategories) {
      if(typeof(this.owned[cat]) == 'undefined'){
        this.owned[cat] = [];
      }
      if(typeof(this.complete[cat]) == 'undefined'){
        this.complete[cat] = [];
      }
    }

    fetch('https://cdn.jsdelivr.net/gh/WFCD/warframe-items/data/json/All.json')
      .then(response => response.json())
      .then(data => this.loadItems(data));
  }

  @computedFrom('showOnly.length')
  get showOnlyLen() {
    return this.showOnly.length;
  }

  loadState() {
    if(localStorage.stateSaved == 'true') {
      this.showOnly = JSON.parse(localStorage.showOnly);
      this.owned = JSON.parse(localStorage.owned);
      this.complete = JSON.parse(localStorage.complete);
      if(localStorage.hasOwnProperty('cols')) {
        this.cols = JSON.parse(localStorage.cols);
      }
      console.log('State loaded!');
    }
  }

  saveState() {
    localStorage.stateSaved = JSON.stringify(true);
    localStorage.owned = JSON.stringify(this.owned);
    localStorage.complete = JSON.stringify(this.complete);
    localStorage.showOnly = JSON.stringify(this.showOnly);
    localStorage.cols = JSON.stringify(this.cols);
  }

  loadItems(data) {
    for(var item of data) {
      if(item['category'] == 'Pets' && !item.hasOwnProperty('health')){
        continue;
      }
      this.checkForOverride(item);
      if(this.usefulCategories.includes(item['category'])) {
        item['searchName'] = item['name'].toLowerCase();
        this.allItems.push(item);
        if(typeof(this[item.category + 'Total']) == 'undefined') {
          this[item.category + 'Total'] = 0;
        }
        this[item.category + 'Total'] += 1;
      }
    }
  }

  checkForOverride(item) {
    for(var o of this.categoryOverrides) {
      if(o[0].test(item['uniqueName']) != false) {
        item['category'] = o[1];
      }
    }
  }

  completeChanged(n, o){
    console.log('Value changed!')
  }
}