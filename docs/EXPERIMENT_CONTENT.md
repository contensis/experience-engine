## Perform Tests with Experimental Content


```json
{
  // The original content could look like this
  "lead": "Personalization in Contensis",
  // Multiple "experiments" curated with a number assigned to a "split" field
  "experiments": [
    {
      "split": 0,
      "lead": "This content will be rendered for visitors randomly placed in the lower 10%"
    },
    {
      "split": 10,
      "lead": "This content will be rendered for visitors in the 10-50 percentile range"
    },
    {
      "split": 50,
      "lead": "This content will be rendered for visitors randomly placed in the top 50%"
      // Removing this experiment will make the previous experiment render for the top 90%
    }
    // Add more experiments and split them however...
  ]
  // ...other Entry fields
}
```