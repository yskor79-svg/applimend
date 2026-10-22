'use strict';
// Generated city directory. Every result is an availability request, never confirmed coverage.
const AppliMendRegion = (() => {
  const cities = Object.freeze([{"slug": "boise", "name": "Boise", "status": "primary", "description": "A primary request city for appliance requests. Include the appliance and symptoms; an independent provider and availability must be confirmed."}, {"slug": "nampa", "name": "Nampa", "status": "primary", "description": "A primary request city for kitchen and laundry appliance requests. Equipment suitability and an available provider are checked before a visit."}, {"slug": "caldwell", "name": "Caldwell", "status": "primary", "description": "A primary request city for appliance requests. Confirm the city spelling and local ZIP, then describe the problem. No visit is reserved by this preview."}, {"slug": "meridian", "name": "Meridian", "status": "proposed", "description": "A proposed neighboring request area. Ask for an availability check; no local technician, covered ZIP or appointment is implied."}, {"slug": "eagle", "name": "Eagle", "status": "proposed", "description": "A proposed neighboring request area. Provider availability and appliance suitability need confirmation before a visit can be arranged."}, {"slug": "star", "name": "Star", "status": "proposed", "description": "A proposed neighboring request area. The initial request checks availability and does not promise travel or reserve a service window."}, {"slug": "kuna", "name": "Kuna", "status": "proposed", "description": "A proposed neighboring request area. Share the appliance, symptoms and city or local ZIP for an availability check."}, {"slug": "middleton", "name": "Middleton", "status": "proposed", "description": "A proposed neighboring request area. An independent provider must confirm availability and the visit location before service is arranged."}]);
  const areas = Object.freeze(Object.fromEntries(cities.map(city => [city.slug, city.name])));
  const timeZone = 'America/Boise';
  function classify(input) {
    const value = String(input || '').trim().replace(/\s+/g, ' ');
    if (!value) return {canReview:false,kind:'empty',message:'Enter a Treasure Valley city or a local 5-digit ZIP.'};
    const cityName = value.replace(/,?\s+(?:ID|Idaho)$/i, '').trim().toLowerCase();
    const city = cities.find(item => item.name.toLowerCase() === cityName);
    if (city) return {canReview:true,kind:'city',slug:city.slug,display:city.name,message:'Availability check for '+city.name+'. No technician coverage, visit or appointment is confirmed.'};
    if (/^\d{5}$/.test(value)) {
      // Prefix is only a routing hint, not a ZIP coverage list or proof of an address.
      if (/^(836|837)/.test(value)) return {canReview:true,kind:'zip_check',display:value,message:'ZIP '+value+' requires an availability check. The prefix does not confirm a valid address, provider coverage or appointment.'};
      return {canReview:false,kind:'outside_region',message:'This ZIP is outside the regional request prefixes. Use a Treasure Valley city or local ZIP; this preview does not offer travel outside the request region.'};
    }
    return {canReview:false,kind:'unrecognized',message:'Choose Boise, Nampa, Caldwell, Meridian, Eagle, Star, Kuna or Middleton, or enter a local ZIP. Other cities are outside this regional preview.'};
  }
  return Object.freeze({cities,areas,timeZone,classify});
})();
