import { user } from "../models/passportModels";
import { Request, Response } from "express";
import { environmentConfig } from "../config/environmentConfig";
import { transporter } from "../middlewares/email";

// add players
export const addTeammates = async (req: Request, res: Response) => {
  try {
    const { emails }: { emails: string[] } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: "Invalid input format" });
    }

    // Fetch registered emails from the database
    const allUsers = await user.find();
    const allEmails = allUsers.map((obj) => {
      return obj.email;
    });

    // Filter unregistered email addresses
    const unregisteredEmails = emails.filter(
      (email: any) => !allEmails.includes(email)
    );
    const registeredEmails = emails.filter((email: any) =>
      allEmails.includes(email)
    );
    // frontend registrration URL
    const registrationUrl = `${environmentConfig.CLIENT_URL}signup`;
    // Send emails to unregistered email addresses
    for (const email of unregisteredEmails) {
      await transporter.sendMail({
        from: environmentConfig.EMAIL_USER,
        to: email,
        subject: "Registration Link",
        html: `Welcome to our website! Thank you for joining us. <a href=${registrationUrl}>Click Here</a>`,
      });
    }
    if (unregisteredEmails.length === 0) {
      res.status(200).json({
        code: 200,
        message: `Teammates added Successfully`,
        registeredEmails,
      });
    } else {
      res.status(422).json({
        code: 422,
        message: `All your Teammates are not registered with us. Registration emails sent successfully to unregistered teammates please register first and continue`,
        unregisteredEmails,
        registeredEmails,
      });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: `Internal Server Error ` });
  }
};
