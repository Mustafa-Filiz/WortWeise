import { Logger } from '@nestjs/common';
import { AppLogger } from './app-logger.service.js';

describe('AppLogger', () => {
  let appLogger: AppLogger;

  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    warnSpy = vi
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    logSpy = vi
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);

    debugSpy = vi
      .spyOn(Logger.prototype, 'debug')
      .mockImplementation(() => undefined);

    appLogger = new AppLogger();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should forward error messages', () => {
    appLogger.error('Something failed', 'stack trace', 'TestContext');

    expect(errorSpy).toHaveBeenCalledWith(
      'Something failed',
      'stack trace',
      'TestContext',
    );
  });

  it('should forward warning messages', () => {
    appLogger.warn('Warning message', 'TestContext');

    expect(warnSpy).toHaveBeenCalledWith('Warning message', 'TestContext');
  });

  it('should forward log messages', () => {
    appLogger.log('Information message', 'TestContext');

    expect(logSpy).toHaveBeenCalledWith('Information message', 'TestContext');
  });

  it('should forward debug messages', () => {
    appLogger.debug('Debug message', 'TestContext');

    expect(debugSpy).toHaveBeenCalledWith('Debug message', 'TestContext');
  });
});
