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
<style>
  body{background:#0a0a0a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0}
  .wrap{max-width:480px;margin:0 auto;padding:32px 24px}
  .logo{font-size:26px;font-weight:800;color:#ec111a;letter-spacing:-0.5px;padding-bottom:16px;border-bottom:2px solid #ec111a;margin-bottom:24px}
  .badge{display:inline-block;background:rgba(236,17,26,.15);color:#ec111a;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-bottom:14px}
  .title{font-size:21px;font-weight:700;line-height:1.3;margin-bottom:6px}
  .sub{font-size:13px;color:rgba(255,255,255,.5);margin-bottom:24px}
  .box{background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 16px;margin-bottom:12px}
  .box-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.4);margin-bottom:4px}
  .box-val{font-size:15px;font-weight:600}
  .green{color:#34c759}
  .chips{display:flex;gap:10px;margin-bottom:20px}
  .chip{flex:1;background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 8px;text-align:center}
  .chip-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.4);margin-bottom:4px}
  .chip-val{font-size:14px;font-weight:700;color:#ec111a}
  .body-txt{font-size:14px;line-height:1.65;color:rgba(255,255,255,.75);margin-bottom:24px}
  .btn-primary{display:block;background:#ec111a;color:#fff;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:10px}
  .btn-sec{display:block;background:transparent;color:#fff;text-decoration:none;text-align:center;padding:13px;border-radius:10px;font-size:14px;font-weight:600;border:1.5px solid rgba(255,255,255,.2);margin-bottom:28px}
  .footer{font-size:11px;color:rgba(255,255,255,.3);line-height:1.6;border-top:1px solid rgba(255,255,255,.08);padding-top:14px}
  .footer a{color:rgba(255,255,255,.35);text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">Scotiabank</div>
  <span class="badge">Scotia Growth Intelligence</span>
  <div class="title">Marcus, we noticed a deposit — your next step is ready.</div>
  <div class="sub">Triggered: CRA Tax Refund detected · May 23, 2026</div>

  <div class="box">
    <div class="box-label">Deposit detected</div>
    <div class="box-val green">+$1,500.00 — CRA Tax Refund</div>
  </div>
  <div class="box" style="margin-bottom:20px">
    <div class="box-label">Idle cash in chequing</div>
    <div class="box-val">$11,310.44 sitting uninvested</div>
  </div>

  <div class="chips">
    <div class="chip"><div class="chip-lbl">Likelihood</div><div class="chip-val">0.67</div></div>
    <div class="chip"><div class="chip-lbl">Product</div><div class="chip-val">RRSP</div></div>
    <div class="chip"><div class="chip-lbl">Channel</div><div class="chip-val">Email</div></div>
  </div>

  <div class="body-txt">
    Your salary has grown 15% over the last 3 months — and now a tax refund just landed.
    An RRSP contribution reduces your taxable income dollar-for-dollar. Starting at $50/month
    could put money back in your pocket this spring, while your savings compound over time.
    Scotia advisors are available to walk you through it at no cost.
  </div>

  <a href="#" class="btn-primary">Open Smart Investor — Start Your RRSP</a>
  <a href="#" class="btn-sec">Book a Scotia Advisor Call</a>

  <div class="footer">
    This message was sent because you have investment insights enabled in your Scotia app.<br/>
    Scotia Growth Intelligence &nbsp;·&nbsp; PIPEDA compliant &nbsp;·&nbsp; Opt-in service<br/>
    <a href="#">Manage preferences</a> &nbsp;·&nbsp; <a href="#">Unsubscribe</a>
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
      subject: "Marcus, we noticed a deposit — your next step is ready",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
}
