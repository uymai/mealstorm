# Mealstorm

A simple web application for managing meal plans and recipes.

## Features

- Upload custom meal plan JSON files
- Use the default timeline
- Interactive checklist for steps
- Collapsible recipe sections
- Local storage to remember checked items
- **Bulk Export**: Export all saved meal plans as JSON for backup or sharing
- **Bulk Import**: Import multiple meal plans from JSON data with selective import options
- **Meal Plan Management**: Save, load, edit, and delete meal plans
- **Cross-device Sharing**: Share meal plans between different browsers and devices

## Application Tabs

Mealstorm is organized into several tabs for different functions:

- **About**: Information about the application and JSON format guide
- **Plan**: Create new meal plans and manage saved plans
- **Cook**: Interactive cooking timeline with recipes and tasks
- **Bulk Export**: Export all saved meal plans as JSON
- **Bulk Import**: Import multiple meal plans from JSON data

## How to Run Locally

### Option 1: Simple HTTP Server

If you have Node.js installed:

1. Clone the repository
2. Navigate to the project directory
3. Run the server:
   ```
   node server.js
   ```
4. Open your browser and go to: http://localhost:3000

### Option 2: Using Python's Built-in HTTP Server

If you have Python installed:

#### Python 3.x
```
python -m http.server
```

#### Python 2.x
```
python -m SimpleHTTPServer
```

Then open your browser and go to: http://localhost:8000

### Option 3: Using Any HTTP Server

You can use any HTTP server of your choice to serve the static files.

## Bulk Import/Export

Mealstorm includes powerful bulk import and export capabilities for managing multiple meal plans.

### Bulk Export

1. Navigate to the **Bulk Export** tab
2. Click "Export Meal Plans" to export all your saved meal plans
3. Copy the generated JSON data from the text area
4. Save it to a file or share it with others

### Bulk Import

1. Navigate to the **Bulk Import** tab
2. Paste your meal plan JSON array into the text area
3. Click "Import Meal Plans" to validate the data
4. Select which meal plans you want to import (all selected by default)
5. Click "Import Selected Meal Plans" to complete the import

### Features

- **Duplicate Prevention**: Plans with the same title will be updated rather than duplicated
- **Selective Import**: Choose which meal plans to import from a batch
- **Validation**: Automatic validation of JSON format and required fields
- **Cross-device Sharing**: Easily share meal plans between different browsers and devices
- **Backup & Restore**: Export your meal plans for backup or transfer to another device

## Testing

1. Install dependencies:
   ```
   npm install
   ```

2. Install Playwright browsers:
   ```
   npx playwright install
   ```

3. Run the tests:
   ```
   npm test
   ```

Additional test commands:
- `npm run test:ui` - Run tests with Playwright UI
- `npm run test:debug` - Run tests in debug mode

The tests run automatically on GitHub Actions for all pushes and pull requests to main branches and feature branches.

## JSON Format

### Single Meal Plan

Your JSON file should follow this structure:

```json
{
  "title": "Your Meal Plan Title",
  "tasks": [
    { "time": "4:30pm", "text": "Preheat oven to 450°F" },
    { "time": "4:45pm", "text": "Prepare the ingredients" }
  ],
  "recipes": [
    {
      "name": "Recipe Name",
      "ingredients": [
        "Ingredient 1",
        "Ingredient 2"
      ],
      "instructions": [
        "Step 1 of the recipe",
        "Step 2 of the recipe"
      ]
    }
  ]
}
```

### Bulk Import Format

For bulk import operations, use an array of meal plans:

```json
[
  {
    "title": "Dinner Party",
    "tasks": [
      { "time": "4:30pm", "text": "Preheat oven to 450°F" },
      { "time": "4:45pm", "text": "Toss and roast potatoes" }
    ],
    "recipes": [
      {
        "name": "Recipe Name",
        "ingredients": [
          "2 Tbsp olive oil",
          "1 cup diced onion",
          "2 cloves garlic"
        ],
        "instructions": [
          "Step 1: Heat oil in pan",
          "Step 2: Add onions and cook until soft",
          "Step 3: Add garlic and cook 30 seconds"
        ]
      }
    ]
  },
  {
    "title": "Another Meal Plan",
    "tasks": [...],
    "recipes": [...]
  }
]
```

## License

MIT License 