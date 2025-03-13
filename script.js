import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 10,  // Virtual Users
  duration: '30s',  // Test Duration
};

export default function () {
  let res = http.get('https://test-api.k6.io');
  console.log('Response time: ' + res.timings.duration + 'ms');
  sleep(1);
}
