# AWS EC2 Deployment Guide for EV Charging App

This guide provides step-by-step instructions to deploy the EV Charging App on an AWS EC2 instance using the free tier.

## Prerequisites
- AWS Free Tier account (12 months free)
- Basic terminal/command line knowledge
- Your application code ready to deploy

## Step 1: Set up AWS Account
1. Go to [AWS Free Tier](https://aws.amazon.com/free/) and sign up
2. Complete the registration and verify your account

## Step 2: Launch an EC2 Instance
1. Log in to AWS Management Console
2. Search for "EC2" in services
3. Click "Launch Instance"
4. Choose "Amazon Linux 2 AMI" (free tier eligible)
5. Select "t2.micro" instance type
6. Click "Next: Configure Instance Details"
7. Keep default settings and proceed through the wizard
8. Configure Security Group with these rules:
   - SSH (port 22)
   - HTTP (port 80)
   - HTTPS (port 443)
   - Custom TCP (your app's port, e.g., 3000)
9. Create and download a new key pair
10. Launch the instance

## Step 3: Connect to Your EC2 Instance
1. In EC2 Dashboard, select your instance
2. Click "Connect" and follow SSH instructions
   - Example: `ssh -i "your-key.pem" ec2-user@your-public-dns`

## Step 4: Server Setup
```bash
# Update packages
sudo yum update -y

# Install Node.js and npm
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo amazon-linux-extras install nginx1 -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 5: Deploy Application
```bash
# Clone your repository
git clone https://github.com/your-username/ev-charging-app.git
cd ev-charging-app

# Install dependencies
npm install
npm run build  # If applicable

# Start with PM2
pm2 start npm --name "ev-charging-app" -- start
pm2 save
pm2 startup
```

## Step 6: Configure Nginx
1. Create config file:
   ```bash
   sudo nano /etc/nginx/conf.d/ev-charging-app.conf
   ```

2. Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-public-dns-or-ip;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Test and restart Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Step 7: Set Up Domain (Optional)
1. Purchase a domain from Route 53 or another registrar
2. Point DNS to your EC2 instance's public IP
3. Update Nginx config with your domain

## Step 8: Set Up SSL (Recommended)
```bash
# Install Certbot
sudo wget -r --no-parent -A 'epel-release-*.rpm' https://dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/
sudo rpm -Uvh dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/epel-release-*.rpm
sudo yum-config-manager --enable epel*
sudo yum install -y certbot python2-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test renewal
sudo certbot renew --dry-run
```

## Access Your Application
- `http://your-ec2-public-ip`
- `https://your-domain.com` (if configured)

## Important Notes
- Monitor AWS Free Tier usage
- Set up billing alerts
- Consider Elastic Beanstalk for easier deployments
- Keep your private key (.pem file) secure
