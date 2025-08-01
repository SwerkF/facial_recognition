import { UAParser } from 'ua-parser-js';

export interface ParsedUserAgent {
    browser: {
        name: string;
        version: string;
    };
    os: {
        name: string;
        version: string;
    };
    device: {
        model: string;
        type: string;
        vendor: string;
    };
    raw: string;
}

export const parseUserAgent = (userAgent: string): ParsedUserAgent => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
        browser: {
            name: result.browser.name || 'Unknown',
            version: result.browser.version || 'Unknown',
        },
        os: {
            name: result.os.name || 'Unknown',
            version: result.os.version || 'Unknown',
        },
        device: {
            model: result.device.model || 'Unknown',
            type: result.device.type || 'Unknown',
            vendor: result.device.vendor || 'Unknown',
        },
        raw: userAgent,
    };
};
