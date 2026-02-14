
import * as satellite from 'satellite.js';
import axios from 'axios';

interface SatelliteData {
    id: number;
    satrec: satellite.SatRec;
}

export class SatelliteService {
    satellites: SatelliteData[] = [];
    lastFetch: number = 0;

    constructor() {
        this.fetchTLEs();
        // Refresh TLEs every 1 hour
        setInterval(() => this.fetchTLEs(), 60 * 60 * 1000);
    }

    private async fetchTLEs() {
        try {
            console.log('Fetching fresh TLEs from CelesTrak...');
            // Fetch Starlink TLEs
            const response = await axios.get('https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle');
            const data = response.data.split('\n');

            const newSats: SatelliteData[] = [];

            // TLE usually comes in 3 lines (Name, Line1, Line2)
            for (let i = 0; i < data.length; i += 3) {
                const name = data[i]?.trim();
                const line1 = data[i + 1]?.trim();
                const line2 = data[i + 2]?.trim();

                if (line1 && line2) {
                    try {
                        const satrec = satellite.twoline2satrec(line1, line2);
                        newSats.push({ id: i / 3, satrec });
                    } catch (e) {
                        // Ignore bad TLEs
                    }
                }
            }

            this.satellites = newSats;
            console.log(`Loaded ${this.satellites.length} satellites.`);
        } catch (err) {
            console.error('Failed to fetch TLEs:', err);
        }
    }

    public update(deltaTime: number): Float32Array {
        if (this.satellites.length === 0) return new Float32Array(0);

        // 4 floats per sat: [id, lat, lon, alt]
        const data = new Float32Array(this.satellites.length * 4);
        const now = new Date();
        const gmst = satellite.gstime(now);

        this.satellites.forEach((sat, i) => {
            const positionAndVelocity = satellite.propagate(sat.satrec, now);
            const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;

            if (positionEci) {
                // Convert to Geodetic (Lat, Lon, Alt)
                const positionGd = satellite.eciToGeodetic(positionEci, gmst);

                // Lon: -PI to PI
                // Lat: -PI/2 to PI/2
                // Alt: km

                const idx = i * 4;
                data[idx] = sat.id;
                data[idx + 1] = positionGd.latitude;
                data[idx + 2] = positionGd.longitude;
                data[idx + 3] = positionGd.height;
            }
        });

        return data;
    }
}
