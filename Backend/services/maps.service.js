const axios = require('axios');
const captainModel = require('../models/captain.model');

// ---------------------------------------------------------------------------
// Free maps stack: Nominatim (OpenStreetMap) for geocoding/search, OSRM for routing.
// No API key needed. Nominatim's public server allows ~1 request/second and
// requires a User-Agent header, so requests are queued and cached below.
// ---------------------------------------------------------------------------
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OSRM_URL = 'https://router.project-osrm.org';
const HEADERS = { 'User-Agent': 'uber-clone-learning-project/1.0 (student project)' };
// Restrict map searches to India.
const COUNTRY_CODES = process.env.COUNTRY_CODES || 'in';

const cache = new Map();
let lastCall = Promise.resolve();

// Runs Nominatim calls one at a time, at least 1.1s apart.
function nominatim(path, params) {
    const key = path + JSON.stringify(params);
    if (cache.has(key)) return Promise.resolve(cache.get(key));

    const run = lastCall.then(async () => {
        const response = await axios.get(`${NOMINATIM_URL}${path}`, {
            params: { format: 'jsonv2', ...(COUNTRY_CODES && { countrycodes: COUNTRY_CODES }), ...params },
            headers: HEADERS,
            timeout: 10000
        });
        cache.set(key, response.data);
        if (cache.size > 500) cache.delete(cache.keys().next().value);
        return response.data;
    });
    lastCall = run.catch(() => { }).then(() => new Promise(r => setTimeout(r, 1100)));
    return run;
}

module.exports.getAddressCoordinate = async (address) => {
    try {
        const results = await nominatim('/search', { q: address, limit: 1 });
        if (!results.length) {
            throw new Error('Unable to fetch coordinates');
        }
        return {
            ltd: parseFloat(results[ 0 ].lat),
            lng: parseFloat(results[ 0 ].lon)
        };
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        const from = await module.exports.getAddressCoordinate(origin);
        const to = await module.exports.getAddressCoordinate(destination);

        // OSRM expects longitude,latitude
        const url = `${OSRM_URL}/route/v1/driving/${from.lng},${from.ltd};${to.lng},${to.ltd}?overview=false`;
        const response = await axios.get(url, { headers: HEADERS, timeout: 10000 });

        if (response.data.code !== 'Ok' || !response.data.routes.length) {
            throw new Error('No routes found');
        }

        const route = response.data.routes[ 0 ];
        // Same shape Google's Distance Matrix returned, so ride.service.js needs no change
        return {
            distance: { value: route.distance, text: `${(route.distance / 1000).toFixed(1)} km` },
            duration: { value: route.duration, text: `${Math.round(route.duration / 60)} mins` },
            status: 'OK'
        };
    } catch (err) {
        console.error(err.message);
        throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    try {
        const results = await nominatim('/search', { q: input, limit: 5 });
        return results.map(place => place.display_name).filter(value => value);
    } catch (err) {
        console.error(err.message);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    // Captain locations are stored as { ltd, lng } rather than GeoJSON,
    // so use haversine filtering instead of MongoDB geoWithin.
    const captains = await captainModel.find({
        'location.ltd': { $exists: true },
        'location.lng': { $exists: true }
    });

    const toRadians = (degrees) => degrees * Math.PI / 180;

    return captains.filter((captain) => {
        const captainLat = captain.location?.ltd;
        const captainLng = captain.location?.lng;
        if (!Number.isFinite(captainLat) || !Number.isFinite(captainLng)) return false;

        const latDistance = toRadians(captainLat - ltd);
        const lngDistance = toRadians(captainLng - lng);
        const latitude1 = toRadians(ltd);
        const latitude2 = toRadians(captainLat);

        const a = Math.sin(latDistance / 2) ** 2
            + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(lngDistance / 2) ** 2;
        const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return distance <= radius;
    });


}