# 🛒 FreshNFix - Full-Stack Online Grocery Delivery

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://fresh-n-fix.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue?style=for-the-badge&logo=github)](https://github.com/nikhil00001/FreshNFix.git)

<br>

<p align="center">
  <em>FreshNFix is a modern, full-stack e-commerce web application for a grocery delivery startup. It provides a seamless shopping experience for users and a powerful management dashboard for administrators, built with a robust and scalable tech stack.</em>
</p>

---

## ✨ Key Features

This application is packed with features designed for both customers and administrators.

### 👤 User-Facing Features
* **🔐 Passwordless Authentication:** Secure login/sign-up using only a phone number and a one-time password (OTP), powered by **AWS Cognito**.
* **🛍️ Product Catalog:** A clean, responsive product grid with instant search and category filtering.
* **🛒 Persistent Shopping Cart:** Add, update quantities, and remove items with state saved across sessions.
* **❤️ Wishlist:** Users can "heart" products to save them to a personal wishlist.
* **📍 Advanced Address Management:**
    * Save and manage multiple shipping addresses.
    * "Use my current location" button utilizes the browser's GPS and **Google Maps Geocoding API** to auto-fill the address form.
* **📜 Order Placement & History:** A complete checkout flow and a dedicated account page to view past order details.
* **📱 Fully Responsive Design:** A seamless experience on both desktop and mobile devices.

### 🛠️ Admin Panel Features
* **🛡️ Secure Admin Access:** A dedicated admin panel accessible only to users with the "admin" role.
* **📦 Full Product Management (CRUD):** Admins can easily create, view, update, and delete products.
* **🔄 Drag-and-Drop Reordering:** An intuitive drag-and-drop interface to instantly change the display order of products on the homepage.
* **🚚 Order Management:** A dashboard for viewing all customer orders and updating their fulfillment status.

---

## 🛠️ Tech Stack

This project is a monorepo containing a separate frontend and backend, deployed as serverless functions.

| Frontend                                                                                                                              | Backend                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)                                                     | ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)                                                                       |
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)                                                          | ![Express](https://img.shields.io/badge/Express.js-000?logo=express&logoColor=white)                                                                       |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)                                       | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)                                                                       |
| ![React Context API](https://img.shields.io/badge/Context_API-61DAFB?logo=react&logoColor=black)                                         | ![AWS Cognito](https://img.shields.io/badge/AWS_Cognito-FF9900?logo=amazon-aws&logoColor=white)                                                             |
| ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)                                                        | ![AWS SNS](https://img.shields.io/badge/AWS_SNS-FF4F8B?logo=amazon-aws&logoColor=white)                                                                     |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
* Node.js (v18 or later) & npm
* Git
* A MongoDB Atlas account
* An AWS account (for Cognito, SNS, and IAM credentials)

### Installation & Setup

1.  **Clone the repository**
    ```sh
    git clone YOUR_GITHUB_REPO_URL
    cd fresh-n-fix
    ```

2.  **Set up the Backend**
    ```sh
    cd server
    npm install
    ```
    Create a `.env` file in the `/server` directory and add the required environment variables (see below).

3.  **Set up the Frontend**
    ```sh
    cd ../client
    npm install
    ```
    Create a `.env.local` file in the `/client` directory and add the required environment variables.

4.  **Run the Development Servers**
    * In the `/server` directory, run:
        ```sh
        npm run dev
        ```
    * In the `/client` directory, run:
        ```sh
        npm run dev
        ```

Your application will be running at `http://localhost:3000`.

---

## 🔑 Environment Variables

You will need to create the following `.env` files and populate them with your own credentials.

#### Backend (`/server/.env`)
```env
MONGO_URI=your_mongodb_connection_string
COGNITO_USER_POOL_ID=your_aws_cognito_user_pool_id
COGNITO_APP_CLIENT_ID=your_aws_cognito_app_client_id
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_iam_user_access_key
AWS_SECRET_ACCESS_KEY=your_iam_user_secret_key
```

#### Frontend (`/client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_aws_cognito_user_pool_id
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=your_aws_cognito_app_client_id
NEXT_PUBLIC_AWS_REGION=your_aws_region
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_geocoding_api_key
```

---

## 🔮 Roadmap: Future Improvements

* **💳 Payment Gateway Integration:** Implement a payment provider like Razorpay or Stripe to handle live transactions.
* **✨ UI/UX Polish:** Redesign the Cart and Checkout pages for a more modern feel and replace native browser alerts with toast notifications.
* **🖼️ Image Storage:** Integrate Amazon S3 for direct image uploads from the admin panel, making product management even more seamless.
