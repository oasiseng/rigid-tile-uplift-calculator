/**
 * Rigid tile uplift moment calculator.
 *
 * Basis:
 * - FBC 2023 Section 1609.6.3, Equation 16-18: Ma = qh * GCp * CL * Kd * b * L * La
 * - ASCE 7-22 Eq. 26.10-1 style velocity pressure form: qh = 0.00256 * Kz * Kzt * Ke * V^2
 *
 * Notes:
 * - This implementation keeps Kzt and Ke as 1.0 unless explicitly supplied.
 * - Exposure handling is limited to C and D for this project scope.
 */

const DEFAULT_GCP_BY_ZONE = {
  1: -0.9,
  2: -1.3,
  3: -2.0,
};

const EXPOSURE_PARAMS = {
  // ASCE 7-22 Table 26.11-1 power law parameters
  B: { alpha: 7.0, zg: 1200 },
  C: { alpha: 9.5, zg: 900 },
  D: { alpha: 11.5, zg: 700 },
};

function assertFiniteNumber(name, value) {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number.`);
  }
}

function assertPositive(name, value) {
  if (value <= 0) {
    throw new Error(`${name} must be greater than 0.`);
  }
}

/**
 * Calculate Kz with power law exposure expression.
 * z is clamped to minimum 15 ft for this calculation path.
 */
export function calculateKz(h, exposure) {
  assertFiniteNumber('Mean roof height (h)', h);
  const exposureParams = EXPOSURE_PARAMS[exposure];

  if (!exposureParams) {
    throw new Error('Exposure must be B, C, or D.');
  }

  const z = Math.max(h, 15);
  const { alpha, zg } = exposureParams;
  return 2.01 * Math.pow(z / zg, 2 / alpha);
}

/**
 * Calculate velocity pressure qh in psf.
 */
export function calculateVelocityPressure({ Vult, Kz, Kzt = 1.0, Ke = 1.0 }) {
  assertFiniteNumber('Wind speed (Vult)', Vult);
  assertFiniteNumber('Kz', Kz);
  assertFiniteNumber('Kzt', Kzt);
  assertFiniteNumber('Ke', Ke);

  assertPositive('Wind speed (Vult)', Vult);
  assertPositive('Kz', Kz);
  assertPositive('Kzt', Kzt);
  assertPositive('Ke', Ke);

  return 0.00256 * Kz * Kzt * Ke * Math.pow(Vult, 2);
}

/**
 * Main rigid tile uplift moment calculator.
 */
export function calculateTileUpliftMoment({
  Vult,
  h,
  exposure,
  roofZone,
  tileLengthInches,
  tileWidthInches,
  liftCoefficientCL,
  providedResistanceMf = null,
  gcpOverride = null,
  kdOverride = null,
  kztOverride = 1.0,
  keOverride = 1.0,
}) {
  assertFiniteNumber('Wind speed (Vult)', Vult);
  assertFiniteNumber('Mean roof height (h)', h);
  assertFiniteNumber('Tile length', tileLengthInches);
  assertFiniteNumber('Tile width', tileWidthInches);
  assertFiniteNumber('Lift coefficient (CL)', liftCoefficientCL);

  assertPositive('Wind speed (Vult)', Vult);
  assertPositive('Mean roof height (h)', h);
  assertPositive('Tile length', tileLengthInches);
  assertPositive('Tile width', tileWidthInches);

  if (!DEFAULT_GCP_BY_ZONE[roofZone]) {
    throw new Error('Roof zone must be 1, 2, or 3.');
  }

  const GCp = Number.isFinite(gcpOverride) ? gcpOverride : DEFAULT_GCP_BY_ZONE[roofZone];
  const Kd = Number.isFinite(kdOverride) ? kdOverride : 0.85;

  assertFiniteNumber('GCp', GCp);
  assertFiniteNumber('Kd', Kd);
  assertFiniteNumber('Kzt', kztOverride);
  assertFiniteNumber('Ke', keOverride);

  if (Kd <= 0) {
    throw new Error('Kd must be greater than 0.');
  }

  const Kz = calculateKz(h, exposure);
  const qh = calculateVelocityPressure({
    Vult,
    Kz,
    Kzt: kztOverride,
    Ke: keOverride,
  });

  // Convert inches to feet.
  const L = tileLengthInches / 12;
  const b = tileWidthInches / 12;

  // Moment arm from the axis of rotation (head lap) to the point
  // of aerodynamic uplift application. 0.76·L is the standard
  // approximation per FBC 2023 rigid tile methodology.
  const La = 0.76 * L;

  const MaSigned = qh * GCp * liftCoefficientCL * Kd * b * L * La;
  const Ma = Math.abs(MaSigned);

  const result = Number.isFinite(providedResistanceMf)
    ? providedResistanceMf >= Ma
      ? 'Pass'
      : 'Fail'
    : null;

  return {
    Ma,
    MaSigned,
    qh,
    Kz,
    GCp,
    Kd,
    CL: liftCoefficientCL,
    b,
    L,
    La,
    Mf: Number.isFinite(providedResistanceMf) ? providedResistanceMf : null,
    result,
  };
}

export default calculateTileUpliftMoment;
