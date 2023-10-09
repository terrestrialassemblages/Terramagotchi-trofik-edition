//version with QR code onplay
/*
function createQR() {
    //const qr_code_canvas = document.getElementById("qr-code");
    const remote_url = document.location.origin + "/remote/?id=" + INSTANCE_ID;

    // CURRENT VERSION GENERATES TEXT LINK INSTEAD OF QR CODE
    const remote_url_link = document.createElement("a");
    remote_url_link.href = remote_url;
    remote_url_link.textContent = remote_url;


    document.getElementById("remote-url").textContent = '';
    document.getElementById("remote-url").appendChild(remote_url_link);


    createQRCode(remote_url);
}




function createQRCode(remote_url) {
    // Create an HTML element to hold the QR code
    const qrCodeElement = document.createElement('div');
    
    // Initialize the QR code generator
    new QRCode(qrCodeElement, {
        text: remote_url,
        width: 128,
        height: 128
    });

    // Clear existing content in the container and append the new QR code element
    const container = document.getElementById('remote-url');
    container.textContent = '';
    container.appendChild(qrCodeElement);
}
*/


// Generate random instance ID every time the page is loaded
const INSTANCE_ID = Math.floor(Math.random() * 1000000000);

function createQR() {
    const remote_url = document.location.origin + "/remote/?id=" + INSTANCE_ID;

    // Create a text link
    const remote_url_link = document.createElement("a");
    remote_url_link.href = remote_url;
    remote_url_link.textContent = remote_url;

    const container = document.getElementById("remote-url");

    // Clear existing content
    container.textContent = '';

    // Append the link
    container.appendChild(remote_url_link);

    // Create and append the QR code
    createQRCode(remote_url);
}

function createQRCode(remote_url) {
    // Create an HTML element to hold the QR code
    const qrCodeElement = document.createElement('div');
    
    // Initialize the QR code generator
    new QRCode(qrCodeElement, {
        text: remote_url,
        width: 128,
        height: 128
    });

    // Append the new QR code element to the existing container
    const container = document.getElementById('remote-url');
    container.appendChild(qrCodeElement);
}