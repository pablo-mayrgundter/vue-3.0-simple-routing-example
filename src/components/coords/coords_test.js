import Testing from '@pablo-mayrgundter/testing.js/testing.js';
import {
  deg2rad,
  deg2sec,
  deg2dms,
  distanceHaversine,
  dms2deg,
  ellipsoidToLV95,
  lv952wgs,
  wgs2lv95,
  BernBesselEllipsoid,
  LV95ToEllipsoid
} from './coords.js';


const π = Math.PI, τ = 2 * π;
const tests = new Testing();


function assertNear(expected, actual, margin = 0, msg) {
  const diff = Math.abs(expected - actual);
  if (diff <= margin) {
    return actual;
  }
  throw new Error(msg || `${expected} - ${actual} = ${diff} > ${margin}`);
}


// https://www.swisstopo.admin.ch/en/maps-data-online/calculation-services/navref.html
tests.add('dms2deg', () => {
    const latDeg = dms2deg(46, 2, 38.87), lngDeg = dms2deg(8, 43, 49.79);
    assertNear(46.044130556, latDeg, .000000001);
    assertNear(8.730497222, lngDeg, .000000001);
  });


// 4.1 Approximate formulas for the transformation between Swiss
// projection coordinates and WGS84.
tests.add('wgs2lv95', () => {
    const latDeg = dms2deg(46, 2, 38.87), lngDeg = dms2deg(8, 43, 49.79);
    const [N, E] = wgs2lv95(latDeg, lngDeg);
    tests.assertEquals(1099999.95, N);
    tests.assertEquals(2699999.78, E);
  });


// 4.2 Approximate formulas for the direct transformation of Swiss
// projection coordinates to ellipsoidal WGS84 coordinates.
tests.add('lv952wgs', () => {
    const N = 1100000, E = 2700000;
    const [lat, lng] = lv952wgs(N, E);
    const expLat = dms2deg(46, 2, 38.86);
    const expLng = dms2deg(8, 43, 49.80);
    assertNear(expLat, lat, 0.000001);
    assertNear(expLng, lng, 0.000001);
  });


tests.add('deg2rad', () => {
    tests.assertEquals(0, deg2rad(0));
    tests.assertEquals(π/2, deg2rad(90));
    tests.assertEquals(π, deg2rad(180));
    tests.assertEquals(τ, deg2rad(360));
  });


tests.add('deg2sec', () => {
    const latDeg = 46.951082773, lngDeg = 7.438632421;
    const latSec = deg2sec(latDeg), lngSec = deg2sec(lngDeg);
    tests.assertEquals(169023.8979828, latSec);
    tests.assertEquals(26779.0767156, lngSec);
  });


tests.add('deg2dms', () => {
  const latDegIn = 46.951082773, lonDegIn = 7.438632421;
  const {deg: latDeg, min: latMin, sec: latSec} = deg2dms(latDegIn),
        {deg: lonDeg, min: lonMin, sec: lonSec} = deg2dms(lonDegIn);
  tests.assertEquals(46, latDeg);
  tests.assertEquals(57, latMin);
  tests.assertEquals(3.897982800011164, latSec);
  tests.assertEquals(7, lonDeg);
  tests.assertEquals(26, lonMin);
  tests.assertEquals(19.07671560000118, lonSec);
  const lat = dms2deg(latDeg, latMin, latSec);
  const lon = dms2deg(lonDeg, lonMin, lonSec);
  tests.assertEquals(latDegIn, lat);
  tests.assertEquals(lonDegIn, lon);
});


tests.add('distanceHaversine', () => {
    // These are the round-trip coords, starting with WGS for Bern
    // observatory (2600000, 1200000) in LVS95.  The second is the
    // result of my wgs2lv95 -> lv952wgs.  So, about 20cm error.
    const lat1 = 46.951082773, lon1 = 7.438632421;
    const lat2 = 46.951082953, lon2 = 7.438632158;
    const d = distanceHaversine(lat1, lon1, lat2, lon2);
    tests.assertEquals(0.028268654470189586, d);
  })


// From 3.1 Notation, constants, auxiliary values
tests.add('BernBesselEllipsoid', () => {
    const el = BernBesselEllipsoid;
    tests.assertEquals(6377397.155, el.semiMajor);
    tests.assertEquals(6356078.962822, el.semiMinor);
    assertNear(299.15281285, el.flatteningInverse, .00000001);
    assertNear(0.006674372230614, el.E2, .00000000000001);
    assertNear(6378815.90365, el.R, 0.00001);
    assertNear(1.00072913843038, el.α, .00000000000001);
  })


// From 3.2 Ellipsoidal coordinates (λ, φ on the Bessel ellipsoid)
// to Swiss projection coordinates (y, x)
tests.add('ellipsoidToLV95', () => {
    // The station at Rigi.
    const φ = deg2rad(47, 3, 28.95659233);
    const λ = deg2rad(8, 29, 11.11127154);
    const [E, N] = ellipsoidToLV95(φ, λ);
    assertNear(2679520.05, E, 0.00001);
    assertNear(1212273.44, N, 0.00001);
  });


tests.add('ellipsoidToLV95: Bern', () => {
    // Ellipsoidal latitude of the projection centre in Bern.
    const φ = deg2rad(46, 57, 8.66);
    // Ellipsoidal longitude of the projection centre in Bern.
    const λ = deg2rad(7, 26, 22.5);
    const [E, N] = ellipsoidToLV95(φ, λ);
    assertNear(2600000, E);
    // TODO
    assertNear(1200000, N, 0.000001);
  });


// 3.3 Swiss projection coordinates (y, x) to
// ellipsoidal coordinates (λ, φ on the Bessel ellipsoid)
/*
tests.add('LV95ToEllipsoid', () => {
    const E = 2679520.05;
    const N = 1212273.44;
    const [φ, λ] = LV95ToEllipsoid(E, N);
    assertNear(deg2rad(47, 3, 28.95659233), φ);
    assertNear(deg2rad(8, 29, 11.11127154), λ);
  });
*/

tests.run();
