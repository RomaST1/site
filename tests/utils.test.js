import { describe, it, expect } from 'vitest';
import { getStatusColor } from '../js/utils.js'; 

describe('SmartHome Utils Test', () => {
    it('returns green for "on"', () => { expect(getStatusColor("on")).toBe("#22c55e"); });
    it('returns blue for "off"', () => { expect(getStatusColor("off")).toBe("#3b82f6"); });
    it('returns yellow for "offline"', () => { expect(getStatusColor("offline")).toBe("#f59e0b"); });
});
