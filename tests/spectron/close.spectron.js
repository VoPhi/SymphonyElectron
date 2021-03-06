const Application = require('./spectronSetup');

let app = new Application({});

describe('Tests for Close', () => {

    let originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = Application.getTimeOut();

    beforeAll((done) => {
        return app.startApplication().then((startedApp) => {
            app = startedApp;
            done();
        }).catch((err) => {
            done.fail(new Error(`Unable to start application error: ${err}`));
        });
    });

    afterAll((done) => {
        if (app && app.isRunning()) {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
            app.stop().then(() => {
                done();
            }).catch((err) => {
                done();
            });
        } else {
            done();
        }
    });

    it('should check whether the app is running', async (done) => {
        await app.stop();
        let isRun  = await app.isRunning();
        await expect(isRun).toBe(false);
        await done();
    });

});
