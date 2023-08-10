import pdf from 'html-pdf';

const generatePDF = async (html: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        pdf.create(html).toBuffer((error, buffer) => {
            if (error) {
                reject(error);
            } else {
                resolve(buffer);
            }
        });
    });
};

export { generatePDF };