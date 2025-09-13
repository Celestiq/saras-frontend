# Authentication Pages

This directory contains the authentication pages for the Saras application.

## Pages

### `/auth` - Auth Landing Page
- Simple landing page with navigation to signup and login
- Clean design matching the app's aesthetic

### `/auth/signup` - Sign Up Page
- **Fields**: Name, Email, Password
- **Features**:
  - Form validation
  - Password visibility toggle
  - Google OAuth integration (placeholder)
  - Loading states
  - Error handling
  - Link to login page

### `/auth/login` - Login Page
- **Fields**: Email, Password
- **Features**:
  - Form validation
  - Password visibility toggle
  - "Remember me" checkbox
  - "Forgot password" link
  - Google OAuth integration (placeholder)
  - Loading states
  - Error handling
  - Link to signup page

### `/auth/forgot-password` - Forgot Password Page
- **Fields**: Email
- **Features**:
  - Email validation
  - Success state with confirmation
  - Link back to login
  - Error handling

## Components

### `AuthCard`
- Reusable wrapper component for authentication forms
- Consistent styling and layout
- Includes Saras branding

### `GoogleButton`
- Reusable Google OAuth button
- Consistent styling across all auth pages
- Includes Google logo SVG

### `PasswordInput`
- Reusable password input with visibility toggle
- Consistent styling and behavior

## Design Features

- **Consistent Styling**: Matches the existing app design system
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper labels, focus states, and keyboard navigation
- **Smooth Animations**: Framer Motion animations for better UX
- **Loading States**: Visual feedback during form submission
- **Error Handling**: Clear error messages and validation

## TODO: Implementation Notes

The following features are currently placeholder implementations and need to be connected to actual backend services:

1. **Form Submission**: Connect to authentication API endpoints
2. **Google OAuth**: Implement actual Google authentication
3. **Password Reset**: Connect to email service for password reset
4. **Session Management**: Handle user sessions and redirects
5. **Form Validation**: Add client-side validation rules

## Usage

Navigate to any of the auth pages:
- `/auth` - Choose between signup or login
- `/auth/signup` - Create a new account
- `/auth/login` - Sign in to existing account
- `/auth/forgot-password` - Reset password
