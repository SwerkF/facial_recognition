import axios from 'axios';

export type Location = {
    ip: string;
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    isp: string;
};

export async function getLocationFromIp(ip: string): Promise<Location | null> {
    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        const { country, regionName, city, lat, lon, isp } = response.data;

        console.log('\n\n response.data', response.data);

        return {
            ip,
            country,
            region: regionName,
            city,
            latitude: lat,
            longitude: lon,
            isp,
        };
    } catch (error) {
        console.error('Failed to fetch location', error);
        return null;
    }
}
