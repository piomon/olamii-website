import { Router } from "express";
import { db } from "@workspace/db";
import { applicationsTable } from "@workspace/db";
import { SubmitApplicationBody } from "@workspace/api-zod";
import { sendApplicationNotification } from "../lib/email";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const parsed = SubmitApplicationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Błąd walidacji danych", details: parsed.error.flatten() });
      return;
    }

    const data = parsed.data;

    const [inserted] = await db.insert(applicationsTable).values({
      firstName: data.firstName,
      lastName: data.lastName,
      pesel: data.pesel,
      birthDate: data.birthDate,
      gender: data.gender,
      education: data.education,
      email: data.email,
      phone: data.phone,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      voivodeship: data.voivodeship,
      employmentStatus: data.employmentStatus,
      employer: data.employer ?? null,
      programType: data.programType,
      courseDescription: data.courseDescription ?? null,
      fundingAmount: data.fundingAmount ? String(data.fundingAmount) : null,
      nip: data.nip ?? null,
      disabilityStatus: data.disabilityStatus ?? false,
      consent: data.consent,
      consentMarketing: data.consentMarketing ?? false,
      status: "pending",
    }).returning();

    req.log.info({ applicationId: inserted.id }, "Application submitted");

    // Send email notification (non-blocking)
    sendApplicationNotification({
      ...inserted,
      fundingAmount: inserted.fundingAmount ?? null,
      submittedAt: inserted.submittedAt,
    }).catch(() => {});

    res.status(201).json({
      id: inserted.id,
      message: "Wniosek został pomyślnie złożony. Skontaktujemy się z Tobą wkrótce.",
      status: inserted.status,
    });
  } catch (err) {
    req.log.error({ err }, "Error submitting application");
    res.status(500).json({ error: "Wystąpił błąd serwera. Spróbuj ponownie." });
  }
});

router.get("/", async (req, res) => {
  try {
    const applications = await db.select().from(applicationsTable).orderBy(applicationsTable.submittedAt);
    res.json(applications);
  } catch (err) {
    req.log.error({ err }, "Error fetching applications");
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
});

export default router;
