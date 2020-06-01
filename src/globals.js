import {computedFrom} from 'aurelia-framework';

export class Globals {
  constructor() {
    // let s = new HttpClient();
    this.allVisible = true;
    this.showOnly = [
      'Warframes', 'Primary', 'Secondary', 'Melee', 'Amps', 'Sentinels', 'Pets', 'Moas', 'Zaws', 'Archwing', 'K-Drive'
    ];
    this.textSearch = '';
    this.complete = {};
    this.owned = {};
    this.hideComplete = false;
    this.included = ['Mastered', 'Unmastered'];
    this.allItems = [];
    this.cols = 4;

    this.usefulCategories = [
      'Warframes', 'Primary', 'Secondary', 'Melee', 'Amps', 'Sentinels',
      'Pets', 'Moas', 'Zaws', 'Archwing', 'K-Drive'
    ];
    var sec = new RegExp('^/Lotus/Weapons/.*?/Secondary/.*?ModularSecondarySet.*?/Barrel/.*?ModularSecondaryBarrel[A-Z]+?Part$');
    var notsec = new RegExp('^/Lotus/Weapons/.*?/Secondary/.*?ModularSecondarySet.*?/(Clip|Handle)/.*?$');
    var moa = new RegExp('/Lotus/Types/Friendly/Pets/MoaPets/MoaPetParts/MoaPetHead');
    var zaw = new RegExp('/Lotus/Weapons/Ostron/Melee/ModularMelee.*?/Tips?/');
    var notzaw = new RegExp('/Lotus/Weapons/Ostron/Melee/ModularMelee.*?/Balance/');
    var amp = new RegExp('/Lotus/Weapons/.*?/OperatorAmplifiers/.*?Barrel');
    var sw = new RegExp('/Lotus/Types/Sentinels/SentinelWeapons/');
    var kd = new RegExp('^/Lotus/Types/Vehicles/Hoverboard/.*?Deck$');
    this.categoryOverrides = [
      [sec, 'Secondary'], [moa, 'Moas'], [zaw, 'Zaws'], [amp, 'Amps'], [sw, 'Sentinels'], [kd, 'K-Drive'],
      [notsec, 'Ignoreme'], [notzaw, 'Ignoreme']
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

    fetch('https://unpkg.com/warframe-items/data/json/All.json')
      .then(response => response.json())
      .then(data => this.loadItems(data));
  }

  @computedFrom('showOnly.length')
  get showOnlyLen() {
    return this.showOnly.length;
  }

  @computedFrom('included.length')
  get includedLen() {
    return this.included.length;
  }

  // @computedFrom('owned.length', 'complete.length', 'showOnly.length', 'cols')
  // get state() {
  //   var tmp = {};
  //   tmp['owned'] = this.owned;
  //   tmp['complete'] = this.complete;
  //   tmp['showOnly'] = this.showOnly;
  //   tmp['cols'] = this['cols'];
  //   // Any time anything feeding this changes, save the changes.
  //   this.saveState();
  //   return JSON.stringify(tmp);
  // }

  // set state(data) {
  //   try {
  //     var newVal = JSON.parse(data);
  //   }
  //   catch(e) {
  //     return false;
  //   }
  //   console.log(newVal.cols);
  // }

  loadState() {
    if(localStorage.stateSaved == 'true') {
      this.showOnly = JSON.parse(localStorage.showOnly);
      this.owned = JSON.parse(localStorage.owned);
      this.complete = JSON.parse(localStorage.complete);
      if(localStorage.hasOwnProperty('cols')) {
        this.cols = JSON.parse(localStorage.cols);
      }
      if(localStorage.hasOwnProperty('included')) {
        this.included = JSON.parse(localStorage.included);
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
    localStorage.included = JSON.stringify(this.included);
    console.log('state saved')
  }

  loadItems(data) {
    for(var item of data) {
      this.checkForOverride(item);
      if(item['category'] == 'Pets' && !item.hasOwnProperty('health')){
        continue;
      }
      if(item['name'] == 'Oloro Moa') {
        console.log('Encountered Oloro Moa. Why is it fucked?');
        console.log(item);
      }
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