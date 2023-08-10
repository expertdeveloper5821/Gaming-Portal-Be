import express ,{ Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { generatePDF } from '../middlewares/report';
import { Transaction } from '../models/qrCodeModel';

const router = express.Router();
router.use(express.static('public'));

// download report
export const downloadReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ error: 'Payment history not found' });
        }

        const templatePath = path.join(__dirname, '../public/report-template/template.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        htmlTemplate = htmlTemplate.replace('{{upiId}}', transaction.upiId)
                                   .replace('{{matchAmount}}', transaction.matchAmount)
                                   .replace('{{name}}', transaction.name);

        const pdf = await generatePDF(htmlTemplate);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="payment_details.pdf"`);

        res.status(200).send(pdf);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to fetch Payment history' });
    }
};

// export const downloadReport = async (req: Request, res: Response) => {
//     try {
//         const { upiId, matchAmount, name } = req.query;

//         const templatePath = path.join(process.cwd(), 'src/public/report-template/template.html');
//         let templateContent = fs.readFileSync(templatePath, 'utf-8');

//         // Convert query parameters to strings before using them in replace
//         const upiIdStr = upiId?.toString() || '';
//         const matchAmountStr = matchAmount?.toString() || '';
//         const nameStr = name?.toString() || '';

//         // Replace placeholders in the template with dynamic data
//         templateContent = templateContent.replace('{{upiId}}', upiIdStr);
//         templateContent = templateContent.replace('{{matchAmount}}', matchAmountStr);
//         templateContent = templateContent.replace('{{date}}', nameStr);

//         const pdf = await generatePDF(templateContent);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="payment_details.pdf"`);
//         res.status(200).send(pdf);
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Failed to fetch Payment history' });
//     }
// };