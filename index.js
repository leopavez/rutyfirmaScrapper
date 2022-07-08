import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import * as puppeteer from 'puppeteer';



const app = express();

const port = process.env.PORT || 3000;

app.set('port', port);

app.use(compression());
app.use(bodyParser.urlencoded({extended: false, limit: '1000mb'}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

process.on('uncaughtException', (err) => {
    console.log(err);
    console.log('Node NOT Exiting...');
});

const server = createServer(app);


server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
  res.send({message: 'Scrap Api is running'});
});



app.get('/v1/rut/get', (req, res) => {
  try {
    let { nombre } = req.body;
    
    let nombreConcat = nombre.replace(/\ /g, '+');
    const url = `https://www.rutyfirma.com/buscar/?f=${nombreConcat}`;

    (async () => {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36');
      await page.goto(url);
      const table = await page.evaluate(() => document.querySelector('tbody.rs').innerText);
      await browser.close();
      return res.send({status: 'success', message: 'Scrap is done', data: { nombre:table.split('\t')[0], rut:table.split('\t')[1] }});
    })();
  } catch (error) {
    return res.send({message: error});
  }
});