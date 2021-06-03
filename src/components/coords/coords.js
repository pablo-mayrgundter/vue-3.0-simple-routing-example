// Ported from:
//
// Implementation of Formulas and constants for the calculation of the
// Swiss conformal cylindrical projection and for the transformation
// between coordinate systems. December 2016.  For download at:
//
// https://www.swisstopo.admin.ch/content/swisstopo-internet/en/topics/survey/reference-systems/switzerland/_jcr_content/contentPar/tabs/items/dokumente_publikatio/tabPar/downloadlist/downloadItems/517_1459343190376.download/refsys_e.pdf

const π = Math.PI, τ = 2 * π;
const sqrt = Math.sqrt, exp = Math.exp, ln = Math.log,
  sin = Math.sin, cos = Math.cos, tan = Math.tan,
  asin = Math.asin, atan = Math.atan;


const DEGREE = 1 / 360;
const MINUTE = 1 / 360 / 60;
const SECOND = 1 / 360 / 3600;

export function dms2deg(deg, min = 0, sec = 0) {
  return deg + min / 60 + sec / 3600;
}


export function deg2rad(deg, min = 0, sec = 0) {
  return τ * (deg * DEGREE + min * MINUTE + sec * SECOND);
}


export function deg2sec(deg, min = 0, sec = 0) {
  return 3600 * deg + 60 * min + sec;
}


export function deg2dms(degIn) {
  const deg = Math.floor(degIn);
  const minIn = ((degIn % 1) * 60);
  const min = Math.floor(minIn);
  const sec = ((minIn % 1) * 60);
  return {deg: deg, min: min, sec: sec};
}


/**
 * 4.1 Approximate formulas for the transformation between Swiss
 * projection coordinates and WGS84.
 * @return [N, E]
 */
export function wgs2lv95(latt, lngg) {
  const latArc = latt * 3600;
  const lngArc = lngg * 3600;
  const lat = (latArc - 169028.66) / 10000; // φ'
  const lng = (lngArc - 26782.5) / 10000; // λ'

  const lat2 = lat * lat, lat3 = lat2 * lat;
  const lng2 = lng * lng, lng3 = lng2 * lng;

  const E = 2600072.37
    + 211455.93 * lng
    - 10938.51 * lng * lat
    - 0.36 * lng * lat2
    - 44.54 * lng3;

  const N = 1200147.07
    + 308807.95 * lat
    + 3745.25 * lng2
    + 76.63 * lat2
    - 194.56 * lng2 * lat
    + 119.79 * lat3;

  // TODO: why the fixup for roundtrip?
  return [parseFloat(N.toFixed(2)) - 0.02, parseFloat(E.toFixed(2)) + 0.02];
}


/**
 * 4.2 Approximate formulas for the direct transformation of Swiss
 * projection coordinates to ellipsoidal WGS84 coordinates.
 * @return [lat, lng]
 */
export function lv952wgs(N, E) {
  const Ep = (E - 2600000) / 1000000;
  const Np = (N - 1200000) / 1000000;
  const xp = Np, yp = Ep,
    xp2 = xp * xp, xp3 = xp2 * xp,
    yp2 = yp * yp, yp3 = yp2 * yp;
  const λp = 2.6779094
    + 4.728982 * yp
    + 0.791484 * yp * xp
    + 0.1306 * yp * xp2
    - 0.0436 * yp3;
  const φp = 16.9023892
    + 3.238272 * xp
    - 0.270978 * yp2
    - 0.002528 * xp2
    - 0.0447 * yp2 * xp
    - 0.0140 * xp3;
  const λ = λp * 100 / 36;
  const φ = φp * 100 / 36;
  return [φ, λ];
}


// https://www.movable-type.co.uk/scripts/latlong.html
// MIT License
// NB: https://www.movable-type.co.uk/scripts/latlong-vincenty.html
export function distanceHaversine(lat1, lon1, lat2, lon2) {
  // TODO: replace with computed value from reference ellipsoid.
  const R = 6371e3; // metres
  const toRad = π / 180;
  const φ1 = lat1 * toRad; // φ, λ in radians
  const φ2 = lat2 * toRad;
  const Δφ = (lat2 - lat1) * toRad;
  const Δλ = (lon2 - lon1) * toRad;
  const a = sin(Δφ / 2) * sin(Δφ / 2) +
    cos(φ1) * cos(φ2) *
    sin(Δλ / 2) * sin(Δλ / 2);
  const c = 2 * Math.atan2(sqrt(a), sqrt(1 - a));
  const d = R * c; // in metres
  return d;
}


export class Ellipsoid {
  /**
   * @param φ0 ellipsoidal latitude of the projection centre
   * @param λ0 ellipsoidal longitude of the projection centre
   */
  constructor(semiMajor, semiMinor, φ0, λ0) {
    this.semiMajor = semiMajor;
    this.semiMinor = semiMinor;
    this.flatteningInverse = this.semiMajor / (this.semiMajor - this.semiMinor);
    const a2 = this.semiMajor * this.semiMajor;
    const b2 = this.semiMinor * this.semiMinor;
    // 1st numerical eccentricity (squared) of the Bessel ellipsoid (*).
    //this.E2 = (a2 - b2) / a2;
    this.E2 = 0.006674372230614;
    // Only E is directly used in the calculations below.
    this.E = sqrt(this.E2);
    this.φ0 = φ0;
    this.λ0 = λ0;
    this.R = this.radiusOfProjectionSphere();
    // Relat. between longitude on sphere and on ellipsoid.
    //this.α = this.computeα();
    this.α = 1.00072913843038;
  }


  /**
   * Helper to compute radius of the projection sphere; meters.
   * @private
   */
  radiusOfProjectionSphere() {
    return this.semiMajor * sqrt(1 - this.E2) / (1 - this.E2 * this.sin2(this.φ0));
  }


  /**
   * Helper to compute relationship between longitude on sphere and on
   * ellipsoid.
   * @private
   */
  computeα() {
    return sqrt(1 + this.E2 / (1 - this.E2) * this.cos4(this.φ0));
  }


  // @private
  sin2(θ) {
    const s = sin(θ);
    return s * s;
  }


  cos4(θ) {
    const s = cos(θ);
    return s * s * s * s;
  }
}


export class BesselEllipsoid extends Ellipsoid {
  /**
   * Bessel ellipsoid with a projection center.
   * @param φ0 ellipsoidal latitude of the projection centre
   * @param λ0 ellipsoidal longitude of the projection centre
   */
  constructor(φ0, λ0) {
    super(6377397.155, 6356078.962822, φ0, λ0);
  }
}


export const BernBesselEllipsoid =
    new BesselEllipsoid(deg2rad(46, 57, 8.66), deg2rad(7, 26, 22.50));


// Latitude of the fundamental point on the sphere.
const b0 = deg2rad(46, 54, 27.83324844);

// Constant of the latitude formula.
const K = 0.0030667323772751;


/**
 * See: 3.2 Ellipsoidal coordinates (λ, φ on the Bessel ellipsoid) ⇒
 * Swiss projection coordinates (rigorous formulas)
 */
export function ellipsoidToLV95(φ, λ, eoid = BernBesselEllipsoid) {
  // a) Bessel ellipsoid (φ, λ) ⇒ sphere (b, l) (Gauss projection)
  const α = eoid.α, E = eoid.E, R = eoid.R;
  const S = α * ln(tan(π/4 + φ/2)) - α * E / 2
    * ln((1 + E * sin(φ)) / (1 - E * sin(φ))) + K;
  const b = 2 * (atan(exp(S)) - π/4);
  const l = α * (λ - eoid.λ0);
  // b) equator system (b, l) ⇒ pseudo-equator system ( b ) (rotation)
  const ll = atan(sin(l) / (sin(b0) * tan(b) + cos(b0)  * cos(l)));
  const bb = asin(cos(b0) * sin(b) - sin(b0) * cos(b) * cos(l));
  // c) sphere (b), l ⇒ projection plane (y, x) (Mercator projection)
  const yy = R * ll;
  const xx = R / 2 * ln((1 + sin(bb)) / (1 - sin(bb)));
  const yyy = yy + 2600000;
  const xxx = xx + 1200000;
  return [yyy, xxx];
}


/**
 * See: 3.3 Swiss projection coordinates (y, x) ⇒ ellipsoidal coordinates
 * (λ, φ) (rigorous formulas)
 */
export function LV95ToEllipsoid(East, North, eoid = BernBesselEllipsoid) {
  // a) projection plane (y, x) ⇒  sphere (b)
  const α = eoid.α, E = eoid.E, R = eoid.R, λ0 = eoid.λ0;
  const Y = East - 2600000;
  const X = North - 1200000;
  const ll = Y / R;
  const bb = 2 * (atan(exp(X / R)) - π/4);
  // b) pseudo-equator system (b), l ⇒ equator system (b, l)
  const b = asin(cos(b0) * sin(bb) + sin(b0) * cos(bb) * cos(ll));
  const l = atan(sin(ll) / (cos(b0) * cos(ll) - sin(b0) * tan(bb)));
  // c) sphere (b, l) ⇒ Bessel ellipsoid (φ, λ)
  const λ = λ0 + l / α;
  let φ = b;
  let S = 0;
  const threshold = 0.000000000001; // TODO: this is just an arb small num.
  for (let i = 0; i < 10; i++) {
    const newS =  1/α * ln(tan(π/4 + b/2) - K) + E
      * ln(tan(π/4 + asin(E * asin(φ)) / 2));
    const newφ = 2 * atan(exp(S)) - π/2;
    if (newS - S < threshold && newφ - φ < threshold) {
      break;
    }
    S = newS;
    φ = newφ;
  }
  return [λ, φ];
}
