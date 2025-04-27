# Mealstorm

A simple web application for managing meal plans and recipes.

## Features

- Upload custom meal plan JSON files
- Use the default timeline
- Interactive checklist for steps
- Collapsible recipe sections
- Local storage to remember checked items

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

## JSON Format

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

## License

MIT License 