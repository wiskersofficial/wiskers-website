/* wiskers-website Worker. The site is static assets (dist/) and the assets are served without
 * running this code. Only /api/* reaches it (run_worker_first in wrangler.jsonc).
 *
 *   POST /api/events-enquiry   the booking form on /events: two answers, emailed to hello@wiskers.click
 *
 * Email goes out through the send_email binding (Cloudflare Email Service). Docs:
 * https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
 */
const TO = 'hello@wiskers.click';
const FROM = { email: 'events@wiskers.click', name: 'Wiskers events page' };
const LIMITS = { who: 400, want: 1500 };

const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const back = (url, flag) => new Response(null, { status: 303, headers: { Location: `${new URL('/events/', url).pathname}?${flag}=1#book`, 'Cache-Control': 'no-store' } });
const oneLine = (text) => text.replace(/[\r\n\u2028\u2029]+/g, ' ').trim();

export async function handleEnquiry(request, env) {
  const url = new URL(request.url);
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const fail = (status, message) => (wantsJson ? json({ ok: false, error: message }, status) : back(url, 'error'));

  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== url.host) return json({ ok: false, error: 'forbidden' }, 403);

  let form;
  try { form = await request.formData(); } catch { return fail(400, 'bad request'); }
  const field = (name) => String(form.get(name) ?? '').trim();

  // A hidden field that people never see. A bot fills it in, so pretend it worked.
  if (field('website')) return wantsJson ? json({ ok: true }) : back(url, 'sent');

  const who = field('who');
  const want = field('want');
  if (!who || !want) return fail(400, 'missing answers');
  if (who.length > LIMITS.who || want.length > LIMITS.want) return fail(400, 'too long');

  const found = who.match(/[^\s<>(),;:"']+@[^\s<>(),;:"']+\.[^\s<>(),;:"']+/);
  const message = {
    to: TO,
    from: FROM,
    subject: `Events enquiry: ${oneLine(who).slice(0, 70)}`,
    text: `New enquiry from the /events page.\n\nWho they are:\n${who}\n\nWhat they'd like to do with Wiskers:\n${want}\n`,
  };
  if (found) message.replyTo = found[0];

  try {
    await env.EMAIL.send(message);
  } catch (error) {
    // Keep the reason in the Worker logs (never the visitor's words).
    console.error('events-enquiry send failed', error?.code, error?.message);
    return fail(502, 'send failed');
  }
  return wantsJson ? json({ ok: true }) : back(url, 'sent');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/events-enquiry') {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
      return handleEnquiry(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
