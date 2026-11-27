import assert from 'node:assert/strict';
import test from 'node:test';
import worker, { RelayTopic } from './relay.mjs';

function createEnv() {
  const topics = new Map();
  return {
    RELAY_TOPIC: {
      idFromName: (name) => name,
      get: (name) => {
        if (!topics.has(name)) {
          const events = new Map();
          const state = {
            storage: {
              get: (key) => events.get(key),
              put: (key, value) => events.set(key, value)
            }
          };
          const instance = new RelayTopic(state);
          topics.set(name, {
            fetch: (input, init) => instance.fetch(new Request(input, init))
          });
        }
        return topics.get(name);
      }
    }
  };
}

test('publishes and polls JSON relay messages with CORS headers', async () => {
  const env = createEnv();
  const packet = JSON.stringify({ kind: 'ROOM_ACTION', roomId: 'room_test' });
  const published = await worker.fetch(new Request('https://relay.test/test-room', {
    method: 'POST',
    body: packet
  }), env);

  assert.equal(published.status, 200);

  const polled = await worker.fetch(new Request('https://relay.test/test-room/json?poll=1&since=30s'), env);
  assert.equal(polled.status, 200);
  assert.equal(polled.headers.get('Access-Control-Allow-Origin'), '*');
  const [event] = (await polled.text()).split('\n').map((line) => JSON.parse(line));
  assert.equal(event.event, 'message');
  assert.equal(event.message, packet);
});

test('rejects invalid topic names and oversized packets', async () => {
  const env = createEnv();
  const invalidTopic = await worker.fetch(new Request('https://relay.test/topic%20name'), env);
  assert.equal(invalidTopic.status, 404);

  const oversized = await worker.fetch(new Request('https://relay.test/valid-topic', {
    method: 'POST',
    body: 'x'.repeat(24_001)
  }), env);
  assert.equal(oversized.status, 413);
});
