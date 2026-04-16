import nodemailer from "nodemailer";
import { logger } from "./logger";

const NOTIFICATION_EMAIL = "balejasandra@gmail.com";

function createTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

export async function sendApplicationNotification(application: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pesel: string;
  birthDate: string;
  gender: string;
  education: string;
  street: string;
  city: string;
  postalCode: string;
  voivodeship: string;
  employmentStatus: string;
  employer?: string | null;
  programType: string;
  courseDescription?: string | null;
  fundingAmount?: string | null;
  nip?: string | null;
  disabilityStatus?: boolean | null;
  submittedAt: Date;
}) {
  const transporter = createTransporter();

  if (!transporter) {
    logger.warn("Email not configured (GMAIL_USER/GMAIL_APP_PASSWORD missing) — skipping notification");
    return;
  }

  const educationLabels: Record<string, string> = {
    podstawowe: "Podstawowe",
    gimnazjalne: "Gimnazjalne",
    zasadnicze_zawodowe: "Zasadnicze zawodowe",
    srednie: "Średnie",
    wyzsze_licencjat: "Wyższe (licencjat)",
    wyzsze_magister: "Wyższe (magister)",
    doktorat: "Doktorat",
  };

  const employmentLabels: Record<string, string> = {
    pracujacy: "Pracujący",
    bezrobotny: "Bezrobotny",
    nieaktywny: "Nieaktywny zawodowo",
    samozatrudniony: "Samozatrudniony",
    uczen_student: "Uczeń/Student",
  };

  const programLabels: Record<string, string> = {
    nabycie_kwalifikacji: "Nabycie kwalifikacji",
    rozwijanie_kompetencji: "Rozwijanie kompetencji",
    bilans_kompetencji: "Bilans kompetencji",
    doradztwo_zawodowe: "Doradztwo zawodowe",
    inne: "Inne",
  };

  const genderLabels: Record<string, string> = {
    kobieta: "Kobieta",
    mezczyzna: "Mężczyzna",
    inne: "Inne",
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; background: #f9f6f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #b8860b, #d4a017); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; }
    .body { padding: 30px; }
    .section { margin-bottom: 24px; border-bottom: 1px solid #f0e8d8; padding-bottom: 20px; }
    .section:last-child { border-bottom: none; }
    .section h2 { color: #b8860b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px; }
    .row { display: flex; margin-bottom: 8px; }
    .label { width: 200px; font-weight: bold; color: #666; font-size: 13px; flex-shrink: 0; }
    .value { color: #333; font-size: 13px; }
    .footer { background: #f9f6f0; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .badge { display: inline-block; background: #b8860b; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nowy wniosek #${application.id}</h1>
      <p>OLA MII Sp. z o.o. — System zgłoszeń</p>
    </div>
    <div class="body">
      <div class="section">
        <h2>Dane osobowe</h2>
        <div class="row"><span class="label">Imię i nazwisko:</span><span class="value"><strong>${application.firstName} ${application.lastName}</strong></span></div>
        <div class="row"><span class="label">PESEL:</span><span class="value">${application.pesel}</span></div>
        <div class="row"><span class="label">Data urodzenia:</span><span class="value">${application.birthDate}</span></div>
        <div class="row"><span class="label">Płeć:</span><span class="value">${genderLabels[application.gender] ?? application.gender}</span></div>
        <div class="row"><span class="label">Wykształcenie:</span><span class="value">${educationLabels[application.education] ?? application.education}</span></div>
        <div class="row"><span class="label">Niepełnosprawność:</span><span class="value">${application.disabilityStatus ? "Tak" : "Nie"}</span></div>
      </div>
      <div class="section">
        <h2>Dane kontaktowe</h2>
        <div class="row"><span class="label">Email:</span><span class="value">${application.email}</span></div>
        <div class="row"><span class="label">Telefon:</span><span class="value">${application.phone}</span></div>
        <div class="row"><span class="label">Adres:</span><span class="value">${application.street}, ${application.postalCode} ${application.city}</span></div>
        <div class="row"><span class="label">Województwo:</span><span class="value">${application.voivodeship}</span></div>
      </div>
      <div class="section">
        <h2>Zatrudnienie</h2>
        <div class="row"><span class="label">Status zatrudnienia:</span><span class="value">${employmentLabels[application.employmentStatus] ?? application.employmentStatus}</span></div>
        ${application.employer ? `<div class="row"><span class="label">Pracodawca:</span><span class="value">${application.employer}</span></div>` : ""}
        ${application.nip ? `<div class="row"><span class="label">NIP:</span><span class="value">${application.nip}</span></div>` : ""}
      </div>
      <div class="section">
        <h2>Program wsparcia</h2>
        <div class="row"><span class="label">Rodzaj wsparcia:</span><span class="value"><span class="badge">${programLabels[application.programType] ?? application.programType}</span></span></div>
        ${application.courseDescription ? `<div class="row"><span class="label">Opis kursu:</span><span class="value">${application.courseDescription}</span></div>` : ""}
        ${application.fundingAmount ? `<div class="row"><span class="label">Kwota dofinansowania:</span><span class="value">${application.fundingAmount} zł</span></div>` : ""}
      </div>
    </div>
    <div class="footer">
      Wniosek złożony: ${application.submittedAt.toLocaleString("pl-PL")} | OLA MII Sp. z o.o.
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"OLA MII - System zgłoszeń" <${process.env.GMAIL_USER}>`,
      to: NOTIFICATION_EMAIL,
      subject: `Nowy wniosek #${application.id} — ${application.firstName} ${application.lastName}`,
      html: htmlContent,
      replyTo: application.email,
    });
    logger.info({ applicationId: application.id }, "Application notification email sent");
  } catch (err) {
    logger.error({ err, applicationId: application.id }, "Failed to send application notification email");
  }
}
