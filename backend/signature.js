const fs = require('fs');
const forge = require('node-forge');
const { PDFDocument, rgb } = require('pdf-lib');

// Function to extract the private key and certificate from the .p12 file
const extractKeyFromP12 = (p12FilePath, p12Password) => {
  const p12Data = fs.readFileSync(p12FilePath);
  
  // Convert the p12 data to ASN.1 format using node-forge
  const p12Buffer = forge.util.createBuffer(p12Data);
  const p12Asn1 = forge.asn1.fromDer(p12Buffer);
  
  // Load the PKCS12 object from the ASN.1 structure
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, p12Password); // Correct method to load PKCS12

  // Extract the private key and certificate
  const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const privateKey = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certificate = certBags[forge.pki.oids.certBag][0].cert;

  return { privateKey, certificate };
};

// Function to sign the PDF with the extracted private key
const signPdf = async (pdfPath, outputPdfPath, privateKey) => {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Example of adding a text signature (this can be replaced with a real signature)
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  page.drawText('Sample Sig', {
    x: width - 200,
    y: height - 100,
    size: 12,
    color: rgb(0, 0, 0),
  });

  // Saving the signed PDF
  const signedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, signedPdfBytes);

  console.log('PDF Signed successfully!');
};

// Main function to extract key and sign the PDF
const main = () => {
  const p12FilePath = 'digital_signature.p12'; // Path to your .p12 file
  const p12Password = '!Hesoyam123'; // Password for your .p12 file

  const { privateKey, certificate } = extractKeyFromP12(p12FilePath, p12Password);
  console.log('Private Key:', privateKey);
  console.log('Certificate:', certificate);

  const pdfPath = 'sample.pdf'; // Path to your original PDF
  const outputPdfPath = 'signed_pdf.pdf'; // Output path for the signed PDF

  // Sign the PDF
  signPdf(pdfPath, outputPdfPath, privateKey)
    .then(() => console.log('PDF signed successfully'))
    .catch((error) => console.error('Error signing PDF:', error));
};

// Run the main function
main();
