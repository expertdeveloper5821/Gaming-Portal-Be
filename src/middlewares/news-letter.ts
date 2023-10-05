import express, { Request, Response } from 'express';
import { environmentConfig } from '../config/environmentConfig';
import cron from 'node-cron';
import { user } from '../models/passportModels';
import { transporter } from './email';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
const router = express.Router();
router.use(express.static('public'));



// Read the mail template HTML from the file
const mailTemplatePath = path.join(__dirname, '../public/mail-template/mails.html');
const mailTemplate = fs.readFileSync(mailTemplatePath, 'utf-8');


// testing mode targeting only perticuler mail
const targetEmails = [
  "vishal.singh@technogetic.com",
];


export const sendMailToUser = () => {
  try {
    cron.schedule('33 15 * * 3', async () => {
      try {
        // Fetch upcoming events data from API
        const eventsResponse = await axios.get(environmentConfig.GET_ROOM);
        const upcomingEvents = eventsResponse.data;

        // Get the last event from the array
        const lastEvent = upcomingEvents.pop();

        if (lastEvent) {
          const { gameType, mapType } = lastEvent
          const formattedDateAndTime = moment(lastEvent.dateAndTime).format("DD-MM-YYYY h:mm A");

          // splite date and time formate
          const dateTimeFormate = formattedDateAndTime.split(" ");
          const date = dateTimeFormate[0];
          const time = dateTimeFormate[1];
          const dayTime = dateTimeFormate[2];
          for (const email of targetEmails) {
            const userData = await user.findOne({ email });
            if (userData) {
              // Replacing placeholders with actual values
              const emailContent = mailTemplate
                .replace('{{gameType}}', gameType)
                .replace('{{mapType}}', mapType)
                .replace('{{date}}', date)
                .replace('{{time}}', `${time} ${dayTime}`)

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


// send mail
// export const sendMailToUser = () => {
//   try {
//     cron.schedule('23 16 * * 2', async () => {
//       try {
//         // Fetch upcoming events data from API
//         const eventsResponse = await axios.get(environmentConfig.GET_ROOM);
//         const upcomingEvents = eventsResponse.data;

//         // Get the last event from the array
//         const lastEvent = upcomingEvents.pop();

//         if (lastEvent) {
//           const { gameType, mapType } = lastEvent;
//           const formattedDateAndTime = moment(lastEvent.dateAndTime).format("DD-MM-YYYY h:mm A");

//           // Split date and time format
//           const dateTimeFormat = formattedDateAndTime.split(" ");
//           const date = dateTimeFormat[0];
//           const time = dateTimeFormat[1];
//           const dayTime =  dateTimeFormat[2];

//           // Fetch all user emails from the database
//           const allUsers = await user.find({}, { email: 1 }); 

//           for (const userData of allUsers) {
//             const email = userData.email;

//             // Replacing placeholders with actual values
//             const emailContent = mailTemplate
//               .replace('{{gameType}}', gameType)
//               .replace('{{mapType}}', mapType)
//               .replace('{{date}}', date)
//               .replace('{{time}}', `${time} ${dayTime}`)

//             const emailToSend = {
//               from: environmentConfig.EMAIL_FROM,
//               subject: 'PattseHeadshot Newsletter: Join Us for a BGMI Match',
//               to: email,
//               html: emailContent,
//             };

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
// };




