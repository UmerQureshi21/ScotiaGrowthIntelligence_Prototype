const API_KEY = import.meta.env.VITE_RESEND_API_KEY as string;
const RECIPIENT = import.meta.env.VITE_DEMO_RECIPIENT_EMAIL as string;

export async function sendMarcusTriggerEmail(): Promise<void> {
  if (!API_KEY || API_KEY === 're_your_key_here') {
    throw new Error('VITE_RESEND_API_KEY not set in .env.local');
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body { margin:0; padding:0; background:#f4f4f4; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; }
  .outer { background:#f4f4f4; padding:32px 16px; }
  .card { background:#ffffff; max-width:520px; margin:0 auto; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .header { background:#ec111a; padding:24px 32px; }
  .header-logo { color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.5px; margin:0; }
  .header-tag { color:rgba(255,255,255,0.75); font-size:12px; margin:4px 0 0; }
  .body { padding:32px; }
  .greeting { font-size:20px; font-weight:700; color:#111111; margin:0 0 6px; line-height:1.3; }
  .trigger-line { font-size:13px; color:#888888; margin:0 0 28px; }
  .divider { height:1px; background:#eeeeee; margin:0 0 24px; }
  .row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f0f0f0; }
  .row:last-child { border-bottom:none; }
  .row-label { font-size:13px; color:#666666; }
  .row-val { font-size:14px; font-weight:600; color:#111111; }
  .row-val.green { color:#1a9e3f; }
  .row-val.red { color:#ec111a; }
  .insight-box { background:#fff8f8; border-left:3px solid #ec111a; border-radius:0 8px 8px 0; padding:14px 16px; margin:24px 0; }
  .insight-text { font-size:14px; color:#333333; line-height:1.6; margin:0; }
  .btn-primary { display:block; background:#ec111a; color:#ffffff; text-decoration:none; text-align:center; padding:14px 20px; border-radius:8px; font-size:15px; font-weight:700; margin:24px 0 10px; }
  .btn-secondary { display:block; background:#ffffff; color:#333333; text-decoration:none; text-align:center; padding:13px 20px; border-radius:8px; font-size:14px; font-weight:600; border:1.5px solid #dddddd; margin-bottom:28px; }
  .footer { padding:0 32px 28px; }
  .footer-text { font-size:11px; color:#aaaaaa; line-height:1.7; border-top:1px solid #eeeeee; padding-top:16px; margin:0; }
  .footer-text a { color:#888888; text-decoration:underline; }
</style>
</head>
<body>
<div class="outer">
  <div class="card">

    <div class="header">
      <p class="header-logo">Scotiabank</p>
      <p class="header-tag">Scotia Growth Intelligence · Personalized Insight</p>
    </div>

    <div class="body">
      <p class="greeting">Marcus, your salary growth unlocks a real tax advantage.</p>
      <p class="trigger-line">Trigger detected: Salary growth pattern · May 24, 2026</p>

      <div class="divider"></div>

      <div class="row">
        <span class="row-label">Salary growth (last 3 months)</span>
        <span class="row-val green">+15%</span>
      </div>
      <div class="row">
        <span class="row-label">Idle cash in chequing</span>
        <span class="row-val">$11,310.44</span>
      </div>
      <div class="row">
        <span class="row-label">Recommended product</span>
        <span class="row-val red">RRSP</span>
      </div>
      <div class="row">
        <span class="row-label">Conversion likelihood</span>
        <span class="row-val">0.67</span>
      </div>

      <div class="insight-box">
        <p class="insight-text">
          An RRSP contribution reduces your taxable income dollar-for-dollar. At your income level,
          starting at $50/month could mean a meaningful refund next tax season — while your savings
          compound over time. A Scotia advisor can walk you through your contribution room at no cost.
        </p>
      </div>

      <a href="#" class="btn-primary">Open Smart Investor — Start Your RRSP</a>
      <a href="#" class="btn-secondary">Book a Scotia Advisor Call</a>
    </div>

    <div class="footer">
      <p class="footer-text">
        You received this because investment insights are enabled in your Scotia app.<br/>
        Scotia Growth Intelligence &nbsp;·&nbsp; PIPEDA compliant &nbsp;·&nbsp; Opt-in service<br/>
        <a href="#">Manage preferences</a> &nbsp;·&nbsp; <a href="#">Unsubscribe</a>
      </p>
    </div>

  </div>
</div>
</body>
</html>`;

  const res = await fetch('/api/resend/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Scotia Growth Intelligence <onboarding@resend.dev>',
      to: [RECIPIENT],
      subject: "Marcus, your salary growth unlocks a real tax advantage",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
}
