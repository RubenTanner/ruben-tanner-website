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
   ```bash
   sudo certbot --nginx -d ruben-tanner.uk -d www.ruben-tanner.uk
   ```

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

## Contributing

Feel free to contribute to this project by opening an issue or submitting a pull request. Feedback and feature requests are always welcome.

## Contact

For any questions or concerns, reach out via [GitHub](https://github.com/rubentanner/).
