import { NextResponse } from "next/server";
import { Resend } from "resend";

// Resend API key from .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Send Email
    const data = await resend.emails.send({
      // Sender name = Rahat Hossain, email = verified Resend email
      from: "Rahat Hossain <onboarding@resend.dev>",
      to: "vscoderbd@gmail.com",        
      subject: `New Message from ${name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
