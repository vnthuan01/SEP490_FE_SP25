import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const helperModulePath = path.resolve(
  __dirname,
  '../.tmp-tests/lib/disasterAnalysisPoints.js',
);

const {
  buildStationAnalysisPoints,
  buildStationFallbackBoundary,
  getStationFallbackRadiusKm,
  isPointInBoundaryPolygon,
  isVietnamLandCoordinate,
} = await import(pathToFileURL(helperModulePath).href);

const toCoordKey = (point) => `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`;
const distanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const fromLat = (from.latitude * Math.PI) / 180;
  const toLat = (to.latitude * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

test('buildStationAnalysisPoints returns two unique inland points', () => {
  const point = { latitude: 16.0544, longitude: 108.2022 };
  const results = buildStationAnalysisPoints(point, 12);

  assert.equal(results.length, 2);
  assert.equal(new Set(results.map(toCoordKey)).size, 2);
  results.forEach((result) => {
    assert.equal(isVietnamLandCoordinate(result.latitude, result.longitude), true);
  });
});

test('buildStationAnalysisPoints keeps generated points safely near the station', () => {
  const point = { latitude: 13.782, longitude: 109.219 };
  const results = buildStationAnalysisPoints(point, 15);

  assert.equal(results.length, 2);
  results.forEach((result) => {
    assert.ok(
      distanceKm(result, point) <= 28,
      `Expected point to stay within 28km of station, got ${distanceKm(result, point).toFixed(2)}km`,
    );
    assert.equal(isVietnamLandCoordinate(result.latitude, result.longitude), true);
  });
});

test('buildStationAnalysisPoints clamps coastal stations back onto Vietnam land', () => {
  const point = { latitude: 9.1769, longitude: 105.1524 };
  const results = buildStationAnalysisPoints(point, 12);

  results.forEach((result) => {
    assert.equal(isVietnamLandCoordinate(result.latitude, result.longitude), true);
  });
});

test('buildStationAnalysisPoints includes a near-station comparison point', () => {
  const point = { latitude: 16.0544, longitude: 108.2022 };
  const results = buildStationAnalysisPoints(point, 12);

  const nearPoint = results.find(
    (result) =>
      Math.abs(result.latitude - point.latitude) < 0.06 &&
      Math.abs(result.longitude - point.longitude) < 0.06,
  );
  assert.ok(nearPoint, 'Expected one point very close to the station');
});

test('buildStationAnalysisPoints keeps Hue-like points meaningfully separated', () => {
  const hueStation = { latitude: 16.4637, longitude: 107.5909 };
  const results = buildStationAnalysisPoints(hueStation, 12);

  const pairDistances = results.flatMap((point, index) => results.slice(index + 1).map((other) => distanceKm(point, other)));
  assert.ok(
    Math.min(...pairDistances) >= 2.5,
    `Expected Hue-like generated points to be at least 2.5km apart, got ${Math.min(...pairDistances).toFixed(2)}km`,
  );
});

test('buildStationAnalysisPoints spreads Hue-like points across distinct directions', () => {
  const hueStation = { latitude: 16.4637, longitude: 107.5909 };
  const results = buildStationAnalysisPoints(hueStation, 12);

  const hasSouth = results.some((point) => point.latitude < hueStation.latitude - 0.06);
  const hasNear = results.some((point) => distanceKm(point, hueStation) < 7);

  assert.equal(hasSouth, true);
  assert.equal(hasNear, true);
});

test('buildStationAnalysisPoints keeps Hue-like points inside fallback range and off ocean', () => {
  const hueStation = { id: 'hue', name: 'Hue Station', latitude: 16.4637, longitude: 107.5909, coverageRadiusKm: 12 };
  const results = buildStationAnalysisPoints(hueStation, hueStation.coverageRadiusKm);
  const fallbackRadiusKm = getStationFallbackRadiusKm(hueStation);

  results.forEach((point) => {
    assert.ok(
      distanceKm(point, hueStation) <= fallbackRadiusKm,
      `Expected point within fallback radius ${fallbackRadiusKm}km, got ${distanceKm(point, hueStation).toFixed(2)}km`,
    );
    assert.equal(isVietnamLandCoordinate(point.latitude, point.longitude), true);
  });
});

test('isPointInBoundaryPolygon accepts interior points and rejects exterior points', () => {
  const polygon = [[[105, 10], [106, 10], [106, 11], [105, 11], [105, 10]]];

  assert.equal(isPointInBoundaryPolygon({ latitude: 10.5, longitude: 105.5 }, polygon), true);
  assert.equal(isPointInBoundaryPolygon({ latitude: 11.5, longitude: 105.5 }, polygon), false);
});

test('buildStationFallbackBoundary creates a usable fallback analysis area', () => {
  const station = { id: 'station-a', name: 'Station A', latitude: 16.0544, longitude: 108.2022, coverageRadiusKm: 12 };
  const boundary = buildStationFallbackBoundary(station);

  assert.equal(isPointInBoundaryPolygon(station, boundary), true);
  assert.equal(isPointInBoundaryPolygon({ latitude: 16.5, longitude: 108.8 }, boundary), false);
});
