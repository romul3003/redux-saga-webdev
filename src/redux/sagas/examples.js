/*
https://github.com/redux-saga/redux-saga/blob/master/examples/counter/src/sagas/index.js
https://github.com/redux-saga/redux-saga/blob/master/examples/async/src/sagas/index.js
https://github.com/redux-saga/redux-saga/blob/master/examples/error-demo/src/sagas/index.js
https://github.com/redux-saga/redux-saga/blob/master/examples/real-world/sagas/index.js
*/

import { delay, takeEvery, put, fork, all, spawn, call } from 'redux-saga/effects';

// Abstract Sagas for example
export function* saga1() {
  yield delay(1000);
  yield put({ type: 'CALL_SAGA_1' });
}
export function* saga2() {
  yield delay(1000);
  yield put({ type: 'CALL_SAGA_2' });
}
export function* saga3() {
  yield delay(1000);
  yield put({ type: 'CALL_SAGA_3' });
}

// #1 takeEvery
/* данный неблокирующий эффект может быть один, либо их может быть несколько и идти они будут друг за другом */
export function* rootSaga1() {
  yield takeEvery('SAGA_1', saga1);
}

// #2 array
/* объединение саг с помощью массива, корневая сага блокируется до тех пор, пока не происходит выполнение всех саг
* сами же саги внутри массива запускаются параллельно, если одна из саг является блокирующей, то переход к дальнейшему
* коду будет возможен только по завершении всех трех саг, но если одна из саг упадет, то все последующие процессы будут
* отменены, корневая сага больше выполняться не будет
*/
export function* rootSaga2() {
  yield [
    saga1(),
    saga2(),
    saga3(),
  ];
}

// #3 fork
/* создание неблокирующего потока, параллельные процессы выполняясь ничего не знают друг о друге, они полностью
* независимые и не используют какие-то смежные данные, однако, если одна из саг падают, то все последующие будут
* отменены
*/
export function* rootSaga3() {
  yield fork(saga1);
  yield fork(saga2);
  yield fork(saga3);
}

// #4 array + fork
/* создается неблокирующий вызов и весь код, который будет идти после массива, вызовется немедленно после запуска
* yield с массивом fork, если одна из саг падают, то все последующие будут отменены и корневая сага так же не будет
* больше выполняться
*/
export function* rootSaga4() {
  yield [
    fork(saga1),
    fork(saga2),
    fork(saga3),
  ];
}

// #5 all + takeEvery
/*
* вернет результат только после выполнения всех входящих в него дочерних саг, сама корневая сага представляет из себя
* коллекцию вотчеров, в этом случае получается неблокирующий поток, если одна из саг падает, все последующие будут
* отменены
*/
export function* rootSaga5() {
  yield all([
    takeEvery('SAGA_1', saga1),
    takeEvery('SAGA_2', saga2),
    takeEvery('SAGA_3', saga3),
  ]);
}

// #6 all + fork
/*
* ожидается завершение всех процессов и только потом возврат результата, каждая из саг внутри массива вызывается с
* помощью неблокирующего fork, следовательно, код написанный после будет выполнен после запуска all,
* если одна из саг падает, все последующие будут отменены
* если внутри all используется блокирующий эффект, то сам all становится блокирующим
*/
export default function* rootSaga6() {
  yield all([
    fork(saga1),
    fork(saga2),
    fork(saga3),
  ]);
}

// #7 spawn
/*
* spawn создает параллельную задачу в корне саги и ее исполнение не привязано к родителю - получаем полностью
* независиміе потоки для доменов
*/
export function* rootSaga7() {
  yield spawn(saga1); // authoring
  yield spawn(saga2); // news
  yield spawn(saga3); // users
}

// #8 keeping everything alive
// https://redux-saga.js.org/docs/advanced/RootSaga
export function* rootSaga8() {
  const sagas = [saga1, saga2, saga3];

  yield all(sagas.map(saga =>
    spawn(function* () {
      while (true) {
        try {
          yield call(saga);
          break;
        } catch (e) {
          console.log(e);
        }
      }
    }))
  );
}
