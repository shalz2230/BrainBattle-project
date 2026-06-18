import http from 'k6/http';
import { sleep, check } from 'k6';

// 100 virtual users running continuously for 1 minute
export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'], // Fail rate must be under 5%
    http_req_duration: ['p(95)<1500'], // 95% of requests must complete under 1.5s
  },
};

export default function () {
  const url = __ENV.BACKEND_URL || 'https://brainbattlewebbackend.onrender.com/';
  const res = http.get(url);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
