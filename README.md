# Booksales Data Map Project

The Booksales Data Map project is an Electron application designed to visualize book sale events across different states in the U.S. It pulls HTML sales data from `https://www.booksalefinder.com/`, parses it using BeautifulSoup4 (bs4) in a Python backend, stores it for future use, and displays the information using Leaflet on an interactive map. This project leverages Electron Forge for simplifying the build process and managing the application lifecycle.

## Features

- **Electron Application**: Built with Electron, providing a native desktop application experience across Windows, macOS, and Linux.
- **Data Scraping and Parsing**: Utilizes Python and BeautifulSoup4 to scrape and parse book sale data from the web.
- **Data Storage**: Stores parsed data in a CSV file, reducing the need for repeated scraping.
- **Interactive Map Visualization**: Displays book sales data on an interactive map using Leaflet.js, offering a user-friendly interface for exploring events.
- **Electron Forge Integration**: Uses Electron Forge for building, running, and packaging the application, streamlining development and deployment processes.

## How It Works

1. **Scraping and Parsing Data**: The application scrapes book sale data from `https://www.booksalefinder.com/` using a Python script and BeautifulSoup4, extracting relevant details such as dates, locations, and descriptions.

2. **Storing and Updating Data**: Scraped data is stored in a CSV file for easy access and manipulation. Users can update this data by triggering the Python script through the Electron interface.

3. **Visualizing Data**: The frontend, built with HTML, CSS, and JavaScript, reads the CSV data and uses Leaflet.js to display each book sale event on an interactive map.

4. **Electron Forge**: Facilitates development with hot reloading during development and simplifies the process of packaging the application for distribution.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Leaflet.js
- **Backend**: NodeJS, BeautifulSoup4
- **Desktop Application**: Electron, Electron Forge
- **Data Storage**: CSV

## Setup and Installation

1. **Clone the Repository**:
  - git clone https://github.com/yourusername/booksales-data-map.git

2. **Navigate to the Project Directory**:
  - cd booksales-data-map
3. **Install Dependencies**:
  - For Python (ensure you have Python installed):
  ```
pip install beautifulsoup4 requests
  ```
  - For Node.js and Electron:
  ```
npm install
  ```
4. **Run the Application with Electron Forge**:
```npm start```
  
## Building and Packaging

Electron Forge makes it easy to package and distribute your application. To package your app for your current platform:

```npm run make```

This command will create a distributable package in the `out` directory.

## Contributing

Contributions are welcome! Feel free to submit pull requests for bug fixes, features, or improvements to the code or documentation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

