# My personal website AND Destroyers Strength & Conditioning Tracker

## Overview

The **Portsmouth Destroyers Strength & Conditioning Tracker** is a web application designed to help track the strength progress of the Portsmouth Destroyers American Football Team. It allows players to submit their strength metrics (e.g., weight, bench, squat, deadlift), and coaches to view the weekly progress of the entire team. The project uses Node.js, Express, and Nginx, with a front end built in HTML, CSS, and JavaScript.

## Features

- Players can submit their strength metrics.
- Coaches can view all players' submissions for each week.
- Data is saved to a JSON file at the end of each week.
- Password-protected data export.
- HTTPS support for secure connections.

## Project Structure

```
/home/web/
├── assets/
│   ├── main.css
│   ├── main.js
│   ├── strength-tracker.css
│   └── strength-tracker-favico/
│       ├──images
│           ├──android-chrome-192x192.png
│           ├──android-chrome-512x512.png
│           ├──apple-touch-icon.png
│           ├──favicon-16x16.png
│           ├──favicon-32x32.png
│           ├──favicon.ico
│           ├──site.webmanifest
├── index.html
├── strength-tracker.html
├── server.js
├── package.json
├── package-lock.json
├── .env
└── README.md
```

- **`assets/`**: Contains CSS, JavaScript, and other assets for the front end.
- **`index.html`**: Homepage with links to projects and social media.
- **`strength-tracker.html`**: The main page for submitting and viewing strength metrics.
- **`main.js`**: Handles front-end logic for form submissions and data display.
- **`server.js`**: Express server handling API endpoints, data processing, and file management.
- **`.env`**: Stores environment variables (e.g., password for exporting data).

## Setup Instructions

### Prerequisites

- **Node.js** and **npm** (Node Package Manager)
- **Nginx** for reverse proxy
- **PM2** for process management

### Installation

1. **Clone the repository** to your server:

   ```bash
   git clone https://github.com/RubenTanner/ruben-tanner-website
   cd ruben-tanner-website
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:

   - Create a `.env` file in the root directory with the following content:
   - nb: replace the password with an actual password you'll use
     ```
     EXPORT_PASSWORD=SECRET PASSWORD GOES HERE
     ```

4. **Set up Nginx as a Reverse Proxy**:

   - Update your Nginx configuration file (`/etc/nginx/sites-available/ruben-tanner-server`) as follows:

     ```nginx
     server {
         listen 80;
         server_name ruben-tanner.uk www.ruben-tanner.uk;

         # Redirect HTTP to HTTPS
         return 301 https://$host$request_uri;
     }

     server {
         listen 443 ssl;
         server_name ruben-tanner.uk www.ruben-tanner.uk;

         ssl_certificate /etc/letsencrypt/live/ruben-tanner.uk/fullchain.pem;
         ssl_certificate_key /etc/letsencrypt/live/ruben-tanner.uk/privkey.pem;
         include /etc/letsencrypt/options-ssl-nginx.conf;
         ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

         location / {
             proxy_pass http://localhost:3000;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
         }

         location /assets/ {
             alias /home/web/assets/;
             try_files $uri =404;
         }

         location /.well-known/acme-challenge/ {
             root /var/www/html;
         }
     }
     ```

5. **Start the Application** using PM2:

   ```bash
   pm2 start server.js --name ruben-tanner-server
   pm2 save
   pm2 startup
   ```

6. **Obtain SSL Certificate** (for HTTPS) using Certbot:

   - To secure your website, run the following command to obtain an SSL certificate:
     ```bash
     sudo certbot --nginx -d ruben-tanner.uk -d www.ruben-tanner.uk
     ```
   - **Explanation**: This command uses **Certbot**, a free and open-source tool, to obtain and install SSL certificates from **Let's Encrypt**. The `--nginx` flag allows Certbot to automatically configure Nginx to use the new certificates, and the `-d` flags specify the domains to secure.
   - After running this command, you will receive prompts to agree to the terms of service and provide an email address for renewal reminders.
   - **Renewal**: Let's Encrypt certificates are valid for **90 days**. Certbot will automatically set up a cron job to renew the certificate, ensuring that your website remains secure.

7. **Verify SSL Certificate Setup**:
   - You can manually test the renewal process to ensure it works without issues:
     ```bash
     sudo certbot renew --dry-run
     ```
   - This command simulates the renewal process without actually renewing the certificate, helping verify that everything is correctly set up.

### Accessing the Application

- **Homepage**: Visit `https://ruben-tanner.uk`.
- **Strength Tracker**: Visit `https://ruben-tanner.uk/strength-tracker.html`.

## Usage

1. **Submit Strength Data**:

   - Players can enter their name, weight, position, and strength metrics (bench, squat, deadlift).
   - Data is saved until the end of the week.

2. **View Weekly Results**:

   - Coaches can filter results by position and see the entire team's performance.

3. **Export Weekly Data**:
   - Enter the correct password to export the data as a JSON file.
   - Data is cleared each week after export.

## Highlighted Features those curious

### SSL/TLS Integration

- Implemented **SSL/TLS certificates** using **Let's Encrypt** to secure all communications between clients and the server.
- Configured **Nginx** to redirect all HTTP traffic to **HTTPS**, ensuring data privacy and security.
- Set up automatic certificate **renewal** using Certbot to keep the SSL certificates up to date without manual intervention, demonstrating knowledge of security best practices.

### Deployment and Process Management

- Used **Nginx** as a **reverse proxy** to manage incoming requests and serve static assets efficiently, which is a common practice in modern web applications.
- Deployed the Node.js server with **PM2** to ensure high availability and manage application restarts in case of failure.

## Contributing

Feel free to contribute to this project by opening an issue or submitting a pull request. Feedback and feature requests are always welcome.

## Contact

For any questions or concerns, reach out via [GitHub](https://github.com/rubentanner/).
