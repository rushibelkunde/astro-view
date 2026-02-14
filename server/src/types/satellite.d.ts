declare module 'satellite.js' {
    export interface SatRec {
        satnum: string;
        epochyr: number;
        epochdays: number;
        ndot: number;
        nddot: number;
        bstar: number;
        inclo: number;
        nodeo: number;
        ecco: number;
        argpo: number;
        mo: number;
        no: number;
    }

    export interface EciVec3<T> {
        x: T;
        y: T;
        z: T;
    }

    export interface PositionAndVelocity {
        position: EciVec3<number> | boolean;
        velocity: EciVec3<number> | boolean;
    }

    export function twoline2satrec(line1: string, line2: string): SatRec;
    export function propagate(satrec: SatRec, date: Date): PositionAndVelocity;
    export function gstime(date: Date): number;
    export function eciToGeodetic(eci: EciVec3<number>, gmst: number): { longitude: number; latitude: number; height: number };
}
