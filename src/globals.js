import {computedFrom} from 'aurelia-framework';

export class Globals {
  constructor() {
    // let s = new HttpClient();
    this.allVisible = true;
    this.showOnly = [
      'Warframe', 'Primary', 'Secondary', 'Melee', 'Robotic', 'Companions',
      'Vehicles', 'Archgun', 'Archmelee', 'Amps'
    ];
    this.textSearch = '';
    this.complete = {};
    this.owned = {};
    this.hideComplete = false;
    this.included = ['Mastered', 'Unmastered', 'Founder'];
    this.allItems = [];
    this.cols = 4;

    // list(object)
    // Keys are field names, values are a string or RegExp to match.
    this.excludes = [
      {
        'type': new Set([
          'arcade minigame unlock','arcane','archwing mod','aura',
          'ayatan sculpture','ayatan star','color palette','companion mod',
          'conservation tag','eidolon shard','emotes','extractor','fish',
          'fish part','focus lens','fur color','fur pattern','gear','gem',
          'glyph','grineer settlement node','k-drive mod','key','misc',
          'parazon','pet collar','pet resource','plant','relic','secondary mod',
          'ship decoration','ship segment','shotgun mod','sigil','skin',
          'stance','syandana','warframe mod'])
      },
      {
        'uniqueName': new RegExp('/Lotus/Weapons/.*?Amplifiers/.*?/(Grip|Chassis).*')
      },
      {
        'uniqueName': new RegExp('/Lotus/Weapons/.*?Secondary/.*?Modular.*?/(Clip|Handle).*')
      }
    ];
    // list(list(category, object))
    this.mappings = [
      ['Warframe', {'productCategory': 'Suits'}],
      ['Archgun', {
        'productCategory': 'SpaceGuns'
      }],
      ['Primary', {'category': 'Primary', 'sentinel': null}],
      ['Secondary', {
        'category': 'Secondary',
        'type': new Set([
          'dual pistols', 'gunblade', 'pistol', 'secondary', 'shotgun sidearm',
          'thrown', 'kitgun component', 'crossbow', 'shotgun', 'dual shotguns'
        ]),
        'sentinel': null
      }],
      ['Melee', {'category': 'Melee'}],
      ['Melee', {
        'uniqueName': new RegExp('/Lotus/Weapons/.*?Melee/.*?Modular.*?/Tip.*')
      }],
      ['Robotic', {
        'productCategory': new Set(['sentinels', 'sentinelweapons'])
      }],
      ['Robotic', {
        'uniqueName': new RegExp('/Lotus/Types/Friendly/Pets/MoaPets/.*?/MoaPetHead')
      }],
      ['Companions', {
        'productCategory': 'KubrowPets'
      }],
      ['Vehicles', {
        'uniqueName': new RegExp('Hoverboard.*Deck')
      }],
      ['Vehicles', {
        'productCategory': 'SpaceSuits'
      }],
      ['Archmelee', {
        'productCategory': 'SpaceMelee'
      }],
      ['Amps', {
        'type': 'Amp'
      }],
    ];

    this.usefulCategories = [
      'Warframe', 'Primary', 'Secondary', 'Melee', 'Robotic', 'Companions',
      'Vehicles', 'Archgun', 'Archmelee', 'Amps'
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
      if(this.excluded(item)) {
        // console.log(`Item with name ${item['name']} excluded. (${item['uniqueName']})`)
        continue;
      }
      // Of course, the dataset we're pulling has founder tags for everything but the frame.
      // This is simpler.
      if(['Excalibur Prime', 'Skana Prime', 'Lato Prime'].includes(item['name'])) {
        item['Founder'] = true;
      }
      else {
        item['Founder'] = false;
      }
      this.mapItem(item);
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

  mapItem(item) {
    for(var m of this.mappings) {
      var count = Object.keys(m[1]).length;
      var matches = 0;
      for(let [k, v] of Object.entries(m[1])) {
        if(item.hasOwnProperty(k)) {
          if(v instanceof RegExp) {
            matches += v.test(item[k]) ? 1 : 0;
          }
          else if(typeof(v) == "string") {
            if(v.includes('inarr:')) {
              tmp = v.substr(6);
              if(item[k].includes(tmp)) {
                matches++;
              }
              else {
                break;
              }
            }
            else {
              if(v.toLowerCase() == item[k].toLowerCase()) {
                matches++;
              }
              else {
                break;
              }
            }
          }
          else if(v instanceof Set) {
            if(v.has(item[k].toLowerCase())) {
              matches++;
            }
            else {
              break;
            }
          }
        }
        // Null value triggers when key doesn't exist.
        else if(v == null) {
          matches++;
        }
        else {
          break;
        }
      }
      if(matches == count) {
        item['category'] = m[0];
        return;
      }
    }
    // If we get to this point without matching, ignore.
    item['category'] = 'ignoreme';
  }

  excluded(item) {
    var excluded = false;
    for(var e of this.excludes) {
      var count = Object.keys(e).length;
      var matches = 0;
      for(let [k, v] of Object.entries(e)) {
        if(item.hasOwnProperty(k)) {
          if(v instanceof RegExp) {
            excluded = v.test(item[k]) ? true : false;
            if(excluded) {
              matches++;
            }
          }
          else if(v instanceof String) {
            if(v.toLowerCase() == item[k].toLowerCase()) {
              matches++;
            }
            else {
              break;
            }
          }
          else if(v instanceof Set) {
            if(v.has(item[k].toLowerCase())) {
              matches++;
            }
            else {
              break;
            }
          }
        }
        else {
          break;
        }
      }
      if(count == matches) {
        return true;
      }
    }
    return false;
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