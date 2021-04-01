import { fakeAsync, flush, flushMicrotasks, tick } from "@angular/core/testing";
import { of } from "rxjs";
import { delay } from "rxjs/operators";

describe("Async Testing Examples", () => {
  it("should do an asynchronous test example with Jasmine done()", (done: DoneFn) => {
    let test = false;
    setTimeout(() => {
      console.log("running assertions");

      test = true;

      expect(test).toBeTruthy();

      done();
    }, 1000);
  });

  it("should do an asynchronous test example - setTimeout()", fakeAsync(() => {
    const delayInMilliseconds = 1000;
    let test = false;

    setTimeout(() => {
      console.log("running assertions");

      test = true;
    }, delayInMilliseconds);

    tick(delayInMilliseconds);

    expect(test).toBeTruthy();
  }));

  it("should do an asynchronous test example - setTimeout() with Microtasks", fakeAsync(() => {
    const delayInMilliseconds = 1000;
    let test = false;

    setTimeout(() => {});

    setTimeout(() => {
      console.log("running assertions");

      test = true;
    }, delayInMilliseconds);

    flush(); // flushes all macrotasks from the queue

    expect(test).toBeTruthy();
  }));

  it("should do an asynchronous test example - plain Promise", fakeAsync(() => {
    let test = false;

    console.log("Creating promise");

    Promise.resolve()
      .then(() => {
        console.log("Promise first then() evaluated successfully");

        return Promise.resolve();
      })
      .then(() => {
        console.log("Promise second then() evaluated successfully");

        test = true;
      });

    flushMicrotasks(); // flushes all microtasks from the queue

    console.log("Running test assetions");

    expect(test).toBeTruthy();
  }));

  it("should do an asyncronous test example - Promises + setTimeout()", fakeAsync(() => {
    let counter = 0;

    Promise.resolve().then(() => {
      counter += 10;

      setTimeout(() => {
        counter += 1;
      }, 1000);
    });

    expect(counter).toBe(0);

    flushMicrotasks();

    expect(counter).toBe(10);

    flush();

    expect(counter).toBe(11);
  }));

  it("should do an asyncronous test example - Observables", fakeAsync(() => {
    let test = false;
    const totalDelayInMilliseconds = 1000;

    console.log("Creating Observable");

    const test$ = of(test).pipe(delay(totalDelayInMilliseconds));

    test$.subscribe(() => {
      test = true;
    });

    tick(totalDelayInMilliseconds);
    console.log("Running test assertions");

    expect(test).toBe(true);
  }));
});
