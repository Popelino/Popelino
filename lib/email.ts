import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendFlaggedReviewEmail(data: {
  reviewId: string;
  placeName: string;
  placeType: string;
  reviewerName: string;
  reviewContent: string;
  rating: number;
  flagReason: string;
  aiAnalysis: string;
  confidence: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const html = `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F7F8FA; padding: 24px; border-radius: 12px;">
    <div style="background: #4ECDC4; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">TrustTaste</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0;">Flagged Review Alert</p>
    </div>

    <div style="background: white; padding: 24px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 16px;">
      <h2 style="color: #1e293b; margin: 0 0 12px;">Review Flagged by AI Moderation</h2>
      <p style="color: #64748b; margin: 0;"><strong>Confidence:</strong> ${data.confidence.toUpperCase()}</p>
    </div>

    <div style="background: white; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
      <h3 style="color: #334155; margin: 0 0 16px;">Establishment</h3>
      <p style="margin: 4px 0;"><strong>Name:</strong> ${data.placeName}</p>
      <p style="margin: 4px 0;"><strong>Type:</strong> ${data.placeType}</p>
    </div>

    <div style="background: white; padding: 24px; border-radius: 8px; margin-bottom: 16px;">
      <h3 style="color: #334155; margin: 0 0 16px;">Review Details</h3>
      <p style="margin: 4px 0;"><strong>Reviewer:</strong> ${data.reviewerName}</p>
      <p style="margin: 4px 0;"><strong>Rating:</strong> ${"★".repeat(data.rating)}${"☆".repeat(5 - data.rating)} (${data.rating}/5)</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin-top: 12px; border: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #475569; font-style: italic;">"${data.reviewContent}"</p>
      </div>
    </div>

    <div style="background: #fff7ed; padding: 24px; border-radius: 8px; border: 1px solid #fed7aa; margin-bottom: 16px;">
      <h3 style="color: #9a3412; margin: 0 0 8px;">Flag Reason</h3>
      <p style="color: #c2410c; margin: 0;">${data.flagReason}</p>
    </div>

    <div style="background: #f0fdf4; padding: 24px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 24px;">
      <h3 style="color: #15803d; margin: 0 0 8px;">AI Analysis</h3>
      <p style="color: #166534; margin: 0;">${data.aiAnalysis}</p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXTAUTH_URL}/admin/reviews/${data.reviewId}"
         style="background: #4ECDC4; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Review in Admin Panel
      </a>
    </div>

    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
      TrustTaste Admin System — ${new Date().toLocaleDateString("en-GB")}
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: `"TrustTaste System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `[TrustTaste] Flagged Review — ${data.placeName} (Confidence: ${data.confidence})`,
    html,
  });
}
