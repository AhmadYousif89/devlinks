# DevLinks - Link Sharing Application

A modern, full-stack link-sharing platform built with Next.js, allowing users to create, manage, and share their professional links in a beautiful, customizable profile.

## 🚀 Features

- **Link Management**: Create, read, update, and delete links with real-time preview
- **Drag & Drop**: Reorder links with intuitive drag-and-drop functionality
- **Image Upload**: Profile picture upload with Cloudinary integration
- **Profile Customization**: Add profile picture, name, and email with live preview
- **Link Validation**: Smart URL validation for different platforms (GitHub, LinkedIn, etc.)
- **Mobile Mockup**: Real-time preview of how your profile looks on mobile
- **Share Profile**: Generate a public shareable profile link
- **User Authentication**: Secure sign-up and sign-in system
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Highlight Banners**: Highlight important links with custom banners upon profile validation fails.

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React.js 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling framework
- **Shadcn UI** - Shadcn custom Accessible components
- **DND Kit** - Drag and drop functionality
- **Sonner** - Toast notifications

### Backend & Database

- **Next.js App Router** - Server side rendering and routing using the new App Router
- **Server Actions** - Server actions for data mutations and form handling
- **Authentication** - Custom authentication system with session management
- **Cloudinary** - Image hosting and optimization
- **MongoDB 6.16.0** - Database

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AhmadYousif89/devlinks
   cd devlinks
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_NAME=your_mongodb_database_name
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   USER_SESSION_KEY=your_user_session_key
   CURRENT_USER_KEY=your_current_user_key
   GUEST_SESSION_KEY=your_guest_session_key
   SESSION_EXPIRE_TIME=your_session_expire_time
   GUEST_SESSION_EXPIRE_TIME=your_guest_session_expire_time
   EXPIRED_NOTIFICATION_TIME=your_expired_notification_time
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
devlinks/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Authentication pages
│   │   │   ├── signin/             # Sign in page
│   │   │   ├── signup/             # Sign up page
│   │   │   └── _components/        # Auth-specific components
│   │   ├── (main)/                 # Main application
│   │   │   ├── @addLinks/          # Parallel route for link management
│   │   │   ├── @profileDetails/    # Parallel route for profile
│   │   │   ├── @sidePanel/         # Parallel route for side panel
│   │   │   ├── actions/            # Server actions
│   │   │   ├── components/         # Page-specific components
│   │   │   └── skeletons/          # Loading skeletons
│   │   ├── preview/                # Profile preview page
│   │   └── globals.css             # Global styles
│   ├── components/                 # Reusable components
│   │   ├── ui/                     # Shadcn UI components (buttons, inputs, etc.)
│   │   ├── layout/                 # General Layout components
│   │   └── icons/                  # Custom icons components
│   └── lib/                        # Utilities and configurations
│       ├── db.ts                   # Database connection
│       ├── utils.ts                # Utility functions
│       ├── types.ts                # Type definitions
│       └── constants.ts            # App constants
├── public/
│   ├── assets/                     # Static assets
│       ├── images/                 # SVG icons and images
│       └── fonts/                  # Custom fonts
|   └── screenshots/                # Screenshots of the app
└── components.json                 # Shadcn/ui configuration
```

## 📱 Pictures

**Sign In / Sign Up**

<div style="display: flex; gap: 20px; margin-bottom: 20px; justify-content: center;">
  <img src="./public/screenshots/signin.png" alt="Sign In" width="20%" />
  <img src="./public/screenshots/signup.png" alt="Sign Up" width="20%" />
</div>

**Mobile Active**

<div style="display: flex; gap: 20px; margin-bottom: 20px; justify-content: center;">
   <img src="./public/screenshots/active-links-mobile.png" alt="Links" width="15%" />
   <img src="./public/screenshots/active-profile-mobile.png" alt="Profile" width="15%" />
   <img src="./public/screenshots/active-preview-mobile.png" alt="Profile" width="15%" />
</div>

**Desktop**

<div style="display: flex; gap: 20px; margin-bottom: 20px; justify-content: center;">
   <img src="./public/screenshots/links.png" alt="Links" width="25%" />
   <img src="./public/screenshots/profile.png" alt="Profile" width="25%" />
</div>

**Desktop Active**

<div style="display: flex; gap: 20px; margin-bottom: 20px; justify-content: center;">
   <img src="./public/screenshots/active-links.png" alt="Links" width="25%" />
   <img src="./public/screenshots/active-profile.png" alt="Profile" width="25%" />
   <img src="./public/screenshots/preview.png" alt="Preview" width="25%" />
</div>

## 🎯 Usage

### Managing Links

1. Click "Add new link" to create a link
2. Select link platform from a dropdown menu
3. Enter the URL for that platform
4. Drag and drop to reorder links
5. Click "Save" to persist changes

### Profile Details

1. Uploading a profile picture (Optional)
2. Adding your first and last name (Required)
3. Adding an email address (Optional) **(Will only update the displayed profile email without affecting user's registered email)**
4. Save your profile details

### Sharing Your Profile

1. Click "Preview" to see your public profile and wait for a profile validation
2. Click "Share Link" and see if you have some missing information
3. Start sharing your personalized DevLinks profile with the world!

## 🚦 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🌟 Key Features Implementation

### Drag & Drop

Implemented using DND Kit for smooth, accessible drag-and-drop functionality.

### Real-time Preview

Live preview updates as you modify links and profile information.

### Form Validation

Comprehensive validation for URLs, required fields, and platform-specific patterns.

### Image Upload

Cloudinary integration for optimized image upload and delivery.

### Authentication

Custom authentication system with session management for guest and user session.

### Preview Validation

Preview validation to ensure links and profile information are complete before sharing.

### Responsive Design

Mobile-first approach with Tailwind CSS for consistent experience across devices.

## 📄 License

This project is licensed under the BSD License - see the [Licence](LICENCE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Author

Ahmad Yousif

[GitHub](https://github.com/AhmadYousif89)

[Linkedin](https://www.linkedin.com/in/dev-ahmadyousif/)

[Frontendmentor](https://www.frontendmentor.io/profile/ahmadyousif89)

Built with ❤️ using Next.js and modern web technologies.
