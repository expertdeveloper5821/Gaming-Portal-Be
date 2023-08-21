import express ,{ Request, Response } from 'express';
import cron from 'node-cron';
import { user } from '../models/passportModels';
import { transporter } from '../middlewares/email';
import { environmentConfig } from '../config/environmentConfig';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
const router = express.Router();
router.use(express.static('public'));


// Read the mail template HTML from the file
const mailTemplatePath = path.join(__dirname, '../public/mail-template/mail.html');
const mailTemplate = fs.readFileSync(mailTemplatePath, 'utf-8');


const targetEmails = [
  'vishal.singh@technogetic.com',
];


export const sendMailToUser = () => {
  try {
    cron.schedule('06 17 * * 1', async () => {
      try {
        // Fetch upcoming events data from API
        const eventsResponse = await axios.get('https://gaming-portal-be-dev.vercel.app/api/v1/room/rooms');
        const upcomingEvents = eventsResponse.data;

        // Get the last event from the array
        const lastEvent = upcomingEvents.pop();

        if (lastEvent && lastEvent.rooms.length > 0) {
          const lastRoom = lastEvent.rooms[0];

          for (const email of targetEmails) {
            const userData = await user.findOne({ email });
            if (userData) {
              // Replace placeholders with actual values
              const emailContent = mailTemplate
                .replace('{{fullName}}', userData.fullName)
                .replace('{{gameName}}', lastRoom.gameName)
                .replace('{{gameType}}', lastRoom.gameType)
                .replace('{{version}}', lastRoom.version)
                .replace('{{mapType}}', lastRoom.mapType)
                .replace('{{date}}', lastRoom.date)
                .replace('{{time}}', lastRoom.time)
                .replace('{{mapImg}}', lastRoom.mapImg);

              const emailToSend = {
                from: environmentConfig.EMAIL_FROM,
                subject: 'PattseHeadshot Newsletter: Join Us for a BGMI Match',
                to: email,
                html: emailContent,
              };

              await transporter.sendMail(emailToSend);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });
  } catch (error) {
    console.error("Cron job scheduling error:", error);
  }
};





// export const sendMailToUser = () => {
//   try {
//     cron.schedule('* * * * *', async () => { 
//       try {
//         var userData = await user.find({});
//         if (userData.length > 0) {
//           for (const userEntry of userData) {
//             const email = userEntry.email;
//             const emailToSend = { ...emailContent, to: email }; 
//             await transporter.sendMail(emailToSend);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     });
//   } catch (error) {
//     console.error("Cron job scheduling error:", error);
//   }
// }





