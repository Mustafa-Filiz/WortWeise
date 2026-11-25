import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(() => {
    healthController = new HealthController();
  });

  describe('check', () => {
    it('should return a healthy status', () => {
      const result = healthController.check();

      expect(result.status).toBe('ok');
    });

    it('should return a valid ISO timestamp', () => {
      const result = healthController.check();

      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should return a non-negative uptime', () => {
      const result = healthController.check();

      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
