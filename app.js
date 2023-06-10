import express from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Template Engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.post('/', async (request, response) => {
  try {
    const data = request.body;

    const html = await ejs.renderFile(
      path.join(__dirname, 'views', 'template.ejs'),
      { data }
    );

    const fileName = `${uuidv4()}.pdf`;
    const filePath = path.join(__dirname, 'temp', fileName);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: filePath,
      format: 'A4',
    });

    await browser.close();

    const fileURL = `http://${request.hostname}:${port}/files/${fileName}`;
    response.json({ pdfURL: fileURL });
  } catch (error) {
    console.error('Erro ao gerar o PDF:', error);
    response.status(500).json({ error: 'Erro ao gerar o PDF' });
  }
});

app.use('/files', express.static('temp'));

// Testar segundo argumento de localhost
app.listen(port, () => {
  console.log(`API escutando na porta ${port}`);
});
