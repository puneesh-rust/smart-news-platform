# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color:rgb(79, 98, 117);
  color: #212529;
}

.App {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dark-mode {
  background-color:rgba(78, 76, 76, 0.81); /* Dark background */
  color:rgb(254, 253, 246); /* White text */
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color:rgb(31, 50, 69);
  color: #fff;
}

.dark-mode .app-header {
  background-color: #1e1e1e; /* Darker background for header */
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  margin-right: 10px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.toggle-button, .today-button, .sign-out-button, .eye-button,.category-filter{
  padding: 5px 10px;
  background-color: #fff;
  color:rgb(1, 3, 4);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .toggle-button,
.dark-mode .today-button,
.dark-mode .sign-out-button,
.dark-mode .eye-button {
  background-color:rgb(245, 240, 240); /* Dark background for buttons */
  color:rgb(14, 14, 14); /* White text for buttons */
}

.toggle-button:hover, .today-button:hover, .sign-out-button:hover, .eye-button:hover {
  background-color: #0056b3;
  color: #fff;
  transform: translateY(-2px);
}

.category-filter{
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
}

.dark-mode .category-filter, .dark-mode .date-filter {
  background-color: #333333; /* Dark background for date filter */
  color: #ffffff; /* White text for date filter */
  border-color: #555555; /* Dark border for date filter */
}

.category-filter:focus, .date-filter:focus {
  outline: none;
  border-color: #007bff;
}


/* Main Content */
.main-content {
  padding: 20px;
}

/* Calendar centered styles */
.centered-calendar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 20px 0;
}
.selected-date-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  text-align: center;
}

.selected-date-display h2 {
  margin-bottom: 15px;
}

.today-button {
  margin: 0 auto 10px auto;
  width: auto;
  padding: 8px 15px;
  font-weight: bold;
}

/* Update the centered-calendar class */
.centered-calendar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 10px 0 20px 0;
}

/* Rest of your CSS remains the same 

/* Calendar styling similar to FotMob */
.modern-calendar {
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 10px;
  width: auto !important;
  max-width: 400px;
  background-color: #222;
  color: #fff;
}

/* Calendar tile styling */
.calendar-tile {
  border-radius: 5px;
  transition: all 0.2s;
}

.selected-tile {
  background-color: #007bff !important;
  color:rgb(11, 250, 15)  !important;
}

.dark-mode .selected-tile {
  background-color: #4caf50 !important;
}

/* React Calendar overrides */
.react-calendar {
  border: none;
}

.dark-mode .react-calendar {
  background-color: #222;
  color: #fff;
}

.react-calendar__navigation button {
  color:rgb(255, 0, 0);
}

.dark-mode .react-calendar__navigation button {
  color: #fff;
}

.react-calendar__month-view__weekdays {
  font-weight: bold;
}

.dark-mode .react-calendar__month-view__weekdays {
  color: #4caf50;
}

.react-calendar__tile--active {
  background-color: #007bff;
  color: #fff;
}

.dark-mode .react-calendar__tile--active {
  background-color: #4caf50;
}
.load-more-container {
  text-align: center;
  margin: 20px 0;
}

.load-more-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.load-more-button:hover {
  background-color: #45a049;
}

.load-more-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.news-container {
  max-width: 400px;
  margin: 0 auto;
}

.news-item {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in-out;
}

.dark-mode .news-item {
  background-color: #1e1e1e; /* Dark background for news items */
  color: #ffffff; /* White text for news items */
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Auth Container */
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.dark-mode .auth-container {
  background-color: #1e1e1e; /* Dark background for auth container */
  color: #ffffff; /* White text for auth container */
}

.auth-container h2 {
  margin-bottom: 20px;
  color: #007bff;
}

.dark-mode .auth-container h2 {
  color: #4caf50; /* Green color for auth container heading */
}

.auth-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-size: 16px;
}

.dark-mode .auth-input {
  background-color: #333333; /* Dark background for input fields */
  color: #ffffff; /* White text for input fields */
  border-color: #555555; /* Dark border for input fields */
}

.auth-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.auth-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .auth-button {
  background-color: #4caf50; /* Green background for buttons */
  color: #ffffff; /* White text for buttons */
}

.auth-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.auth-switch {
  margin-top: 15px;
  color: #6c757d;
}

.dark-mode .auth-switch {
  color: #ffffff; /* White text for auth switch */
}

.auth-switch span {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}

.dark-mode .auth-switch span {
  color: #4caf50; /* Green color for auth switch text */
}

.auth-error {
  color: #dc3545;
  margin-bottom: 15px;
}

/* Loading and error states */
.loading, .error, .no-news {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.loading {
  color: #007bff;
}

.dark-mode .loading {
  color: #4caf50;
}

.error {
  color: #dc3545;
}

.no-news {
  color: #6c757d;
}

.dark-mode .no-news {
  color: #adb5bd;
}

/* Footer */
footer {
  text-align: center;
  padding: 20px;
  background-color: #007bff;
  color: #fff;
  margin-top: auto;
}

.dark-mode footer {
  background-color: #1e1e1e; /* Dark background for footer */
  color: #ffffff; /* White text for footer */
}

.footer-icons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.footer-icons img {
  width: 30px;
  height: 30px;
}

/* Marquee Styling */
.marquee-container {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  background-color:rgb(44, 59, 94);
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.dark-mode .marquee-container {
  background-color: #1e1e1e; /* Dark background for marquee */
  border-color: #555555; /* Dark border for marquee */
}

.marquee-content {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 70s linear infinite;
}

.marquee-item {
  margin-right: 50px;
  font-size: 16px;
  color:rgb(255, 0, 0);
}

.dark-mode .marquee-item {
  color: #ffffff; /* White text for marquee items */
}

.marquee-item a {
  color: #28a745;
  text-decoration: none;
}

.dark-mode .marquee-item a {
  color: #4caf50; /* Green color for marquee links */
}

.marquee-item a:hover {
  text-decoration: underline;
}

@keyframes marquee {
  0% {
      transform: translateX(100%);
  }
  100% {
      transform: translateX(-100%);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
      flex-direction: column;
      align-items: flex-start;
  }
  .header-buttons {
      flex-direction: column;
      gap: 5px;
  }
} */