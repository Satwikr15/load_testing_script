import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50,
  duration: '30s',
};

export default function () {
  let res = http.get('https://jsonplaceholder.typicode.com/posts/1');

  check(res, {
    'Status is 200': (r) => r.status === 200,
  });

  console.log(`Response time: ${res.timings.duration}ms | Status: ${res.status}`);

  sleep(0.5);
}
