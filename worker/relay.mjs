const MAX_EVENTS = 200;
const MAX_AGE_MS = 120_000;
const MAX_MESSAGE_BYTES = 24_000;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  };
}

function response(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: { ...corsHeaders(), ...headers }
  });
}

function parseDuration(value) {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value || '30s');
  if (!match) return 30_000;
  const amount = Number(match[1]);
  const units = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Math.min(amount * units[match[2]], MAX_AGE_MS);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return response(null, 204);

    const url = new URL(request.url);
    const segments = decodeURIComponent(url.pathname.slice(1)).split('/');
    const [topic, action] = segments;
    if (!topic || !/^[A-Za-z0-9_-]{1,64}$/.test(topic) || (action && action !== 'json') || segments.length > 2) {
      return response('Invalid topic path', 404);
    }

    if (request.method === 'POST' && !action) {
      const body = await request.text();
      if (new TextEncoder().encode(body).byteLength > MAX_MESSAGE_BYTES) {
        return response('Message too large', 413);
      }
      const id = env.RELAY_TOPIC.idFromName(topic);
      return env.RELAY_TOPIC.get(id).fetch('https://relay-topic/publish', {
        method: 'POST',
        body
      });
    }

    if (request.method === 'GET' && action === 'json') {
      const id = env.RELAY_TOPIC.idFromName(topic);
      const internalUrl = new URL('https://relay-topic/events');
      internalUrl.searchParams.set('since', url.searchParams.get('since') || '30s');
      return env.RELAY_TOPIC.get(id).fetch(internalUrl);
    }

    return response('Method not allowed', 405, { Allow: 'GET, POST, OPTIONS' });
  }
};

export class RelayTopic {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method === 'POST' && new URL(request.url).pathname === '/publish') {
      const message = await request.text();
      const now = Date.now();
      const events = (await this.state.storage.get('events') || [])
        .filter((event) => now - event.time <= MAX_AGE_MS);
      events.push({
        id: `${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        time: now,
        event: 'message',
        message
      });
      await this.state.storage.put('events', events.slice(-MAX_EVENTS));
      return response('Published', 200, { 'Content-Type': 'text/plain; charset=utf-8' });
    }

    if (request.method === 'GET' && new URL(request.url).pathname === '/events') {
      const url = new URL(request.url);
      const cutoff = Date.now() - parseDuration(url.searchParams.get('since'));
      const events = (await this.state.storage.get('events') || [])
        .filter((event) => event.time >= cutoff);
      const body = events.map((event) => JSON.stringify(event)).join('\n');
      return response(body, 200, { 'Content-Type': 'application/x-ndjson; charset=utf-8' });
    }

    return response('Not found', 404);
  }
}
