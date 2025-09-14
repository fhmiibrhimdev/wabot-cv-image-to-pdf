require("./config.js")
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const fs = require("fs")


const {
    getGroupAdmins,
} = require("./lib/library.js");
const { getContentType, downloadMediaMessage } = require("@whiskeysockets/baileys");

let images = {}; // Array untuk menyimpan gambar sementara
let isWaitingForFilename = false; // Status menunggu nama file

// Fungsi untuk membuat PDF dari array gambar
async function convertImagesToPdf(images, senderPath, filename) {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    for (const imageFile of images) {
        // Load the image
        const imagePath = path.join(__dirname, `images/${senderPath}`, imageFile);
        const imageBytes = fs.readFileSync(imagePath);

        // Add the image to the PDF document
        const img = await pdfDoc.embedJpg(imageBytes);

        // Get the dimensions of the image
        const { width, height } = img.scale(1);

        // Add a page to the PDF and draw the image on it
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(img, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        });
    }

    // Menyimpan dokumen PDF ke dalam bytes
    const pdfBytes = await pdfDoc.save();

    const userFolder = `./documents/${senderPath}`; // Folder berdasarkan senderId
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
    }

    // Menyimpan PDF ke file output.pdf di folder documents
    const outputPath = path.join(__dirname, `documents/${senderPath}`, `${filename}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
}

function Str_Random(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Loop to generate characters for the specified length
    for (let i = 0; i < length; i++) {
        const randomInd = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomInd);
    }
    return result;
}

module.exports = async (fell, m) => {
    try {
        const body = (
            (m.mtype === 'conversation' && m.message.conversation) ||
            (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ||
            (m.mtype === 'documentMessage' && m.message.documentMessage.caption) ||
            (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ||
            (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ||
            (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ||
            (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId)
        ) ? (
            (m.mtype === 'conversation' && m.message.conversation) ||
            (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ||
            (m.mtype === 'documentMessage' && m.message.documentMessage.caption) ||
            (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ||
            (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ||
            (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ||
            (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId)
        ) : '';

        const budy = (typeof m.text === 'string') ? m.text : '';
        const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
        const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1)
        const text = q = args.join(" ")
        const sender = m.key.fromMe ? (fell.user.id.split(':')[0] + '@s.whatsapp.net' || fell.user.id) : (m.key.participant || m.key.remoteJid)
        const botNumber = await fell.decodeJid(fell.user.id)
        const senderNumber = sender.split('@')[0]
        const pushname = m.pushName || `${senderNumber}`
        const isBot = botNumber.includes(senderNumber)
        const fatkuns = (m.quoted || m)
        const quoted = (fatkuns.mtype == 'buttonsMessage') ? fatkuns[Object.keys(fatkuns)[1]] : (fatkuns.mtype == 'templateMessage') ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]] : (fatkuns.mtype == 'product') ? fatkuns[Object.keys(fatkuns)[0]] : m.quoted ? m.quoted : m
        const mime = (quoted.m || quoted).mimetype || ''
        const qmsg = (quoted.m || quoted)
        const isCreator = (m && m.sender && [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)) || false;

        const groupMetadata = m.isGroup ? await fell.groupMetadata(m.chat).catch(e => { }) : ''
        const groupName = m.isGroup ? groupMetadata.subject : ''
        const participants = m.isGroup ? await groupMetadata.participants : ''
        const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
        const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
        const groupOwner = m.isGroup ? groupMetadata.owner : ''
        const isGroupOwner = m.isGroup ? (groupOwner ? groupOwner : groupAdmins).includes(m.sender) : false

        // console.log(senderNumber)

        if (isCmd) console.log("~> [CMD]", command, "from", pushname, "in", m.isGroup ? "Group Chat" : "Private Chat", '[' + args.length + ']');

        switch (command) {
            case 'menu':
                m.reply('Hola')
                break;

            default:
                if (!m.isGroup) {
                    const userFolder = `./images/${senderNumber}`; // Folder berdasarkan senderId
                    if (m.mtype === 'imageMessage') {
                        if (!fs.existsSync(userFolder)) {
                            fs.mkdirSync(userFolder, { recursive: true });
                        }

                        console.log('Gambar diterima, mengunduh...');
                        const stream = await downloadMediaMessage(m, 'stream', {}, { logger: null });

                        const nameImages = `${Str_Random(5)}.jpeg`

                        const writeStream = fs.createWriteStream(`${userFolder}/${nameImages}`)
                        stream.pipe(writeStream)

                        if (!images[senderNumber]) {
                            images[senderNumber] = []; // Inisialisasi array untuk senderNumber jika belum ada
                        }
                        
                        images[senderNumber].push(nameImages); // Tambahkan gambar ke array yang sesuai
                        console.log(images[senderNumber]); // Lihat daftar gambar untuk senderNumber
                        // console.log(images.length)

                        // m.reply('Gambar berhasil disimpan!');
                        return;
                    }
                    // Menunggu command ".done"
                    if (command === 'done') {
                        if (!images[senderNumber] || images[senderNumber].length === 0) {
                            m.reply('Belum ada gambar yang diunggah!');
                            return;
                        }

                        isWaitingForFilename = true;
                        m.reply('Nama file untuk PDF?');
                        return;
                    }
                    // Proses nama file untuk PDF
                    if (isWaitingForFilename) {
                        const fileName = budy
                        if (!fileName) {
                            m.reply('Nama file tidak boleh kosong. Coba lagi!');
                            return;
                        }

                        console.log('Membuat PDF dengan nama:', fileName);
                        console.log(images)
                        await convertImagesToPdf(images, senderNumber, fileName);

                        const pdfPath = `./documents/${senderNumber}/${fileName}.pdf`;

                        await fell.sendMessage(m.chat, {
                            document: { url: pdfPath },
                            fileName: `${fileName}.pdf`,
                            caption: `${fileName}.pdf`
                        });

                        // Hapus gambar setelah PDF dibuat
                        for (const image of images[senderNumber]) {
                            const imagePath = `${userFolder}/${image}`;
                            fs.unlinkSync(imagePath); // Hapus gambar setelah diproses
                            console.log(`Gambar ${image} telah dihapus.`);
                        }

                        // Hapus PDF setelah dikirim
                        fs.unlinkSync(pdfPath);
                        console.log(`${fileName}.pdf telah dihapus.`);

                        // Reset status dan array
                        isWaitingForFilename = false;
                        delete images[senderNumber]; // Hapus entry untuk senderNumber setelah selesai
                        // m.reply('PDF berhasil dibuat dan dikirim!');
                    }

                    if (command === 'resetimg') {
                        if (images[senderNumber]) {
                            for (const image of images[senderNumber]) {
                                const imagePath = `${userFolder}/${image}`;
                                fs.unlinkSync(imagePath); // Hapus gambar setelah diproses
                                console.log(`Gambar ${image} telah dihapus.`);
                            }
                            delete images[senderNumber]; // Hapus entry untuk senderNumber
                        }
                    
                        isWaitingForFilename = false;
                        m.reply('Image berhasil direset, kirim ulang gambar!');
                    }
                }
                break;
        }
    } catch (err) {
        console.log(require('util').format(err));
    }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(`Update ${__filename}`);
    delete require.cache[file];
    require(file);
});
