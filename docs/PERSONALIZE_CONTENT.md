## Ensure Content is Personalized

When working with Contensis, it is normal to render the content fields of an Entry of a specific content type that has fields containing the content for the current "page".

```json
{
  // The non-personalized content could look like this
  "lead": "Personalization in Contensis",
  // Personalized "variants" curated with an "audiences" field
  "variants": [
    {
      // We could add a default (non-personalized) variant with the other variants
      "audiences": [],
      "lead": "Personalization in Contensis (the default variant)"
    },
    {
      "audiences": ["userHasLoggedIn"],
      "lead": "This variant will be rendered for visitors placed in the above audience(s)"
    }
    // Add more variants...
  ]
  // ...other Entry fields
}
```

### Repeatable Component
For the next example, our Entry uses a Component field set up in the Content Type called `personalizedHero`. The Component field is configured to be repeatable. We will add multiples of this Component field for every audience we wish to tailor the content for.

The Component is defined with an Audience Picker field in addition to the content field(s) encapsulated within this component.

We will also use the original `hero` field in the Content Type that serves as the default version (the variation we will render when the visitor matches no audiences in the `personalizedHero`). We could drop the `hero` field from this Content Type and use only the `personalizedHero` field, but we would have to include a variant of the component that serves as the default version to render in each Entry.

```json
{
  "id": "exampleHomePage",
  "projectId": "website",
  "dataFormat": "entry",
  "name": {
    "en-GB": "Example: Home Page"
  },
  "entryTitleField": "title",
  "fields": [
    {
      "id": "title",
      "name": {
        "en-GB": "Title"
      },
      "dataType": "string",
      "dataFormat": "heading",
      "groupId": "main"
    },
    {
      "id": "hero",
      "name": {
        "en-GB": "Hero"
      },
      "dataType": "object",
      "dataFormat": "component.personalizedhero",
      "groupId": "main"
    },
    {
      "id": "personalizedHero",
      "name": {
        "en-GB": "Personalized Hero"
      },
      "dataType": "objectArray",
      "dataFormat": "component.personalizedhero",
      "editor": {
        "properties": {
          "componentButtonLabel": "Add personalized variant"
        }
      },
      "groupId": "main"
    }
  ]
}
```

_Example Content Type JSON_

```json
{
  "id": "personalizedHero",
  "projectId": "website",
  "dataFormat": "component",
  "name": {
    "en-GB": "Personalized Hero"
  },
  "description": {
    "en-GB": "Create personalized variations for any audience"
  },
  "fields": [
    {
      "id": "audiences",
      "name": {
        "en-GB": "Audiences"
      },
      "dataType": "objectArray",
      "dataFormat": "audience",
      "validations": {
        "allowedIds": {
          "ids": ["returningVisitors", "potentialStudents", "campaignSignUp"]
        }
      },
      "editor": {
        "instructions": {
          "en-GB": "Choose one or more audiences that will have this variant rendered"
        },
        "properties": {
          "componentButtonLabel": "Add another audience"
        }
      }
    },
    {
      "id": "heading",
      "name": {
        "en-GB": "Heading"
      },
      "dataType": "string"
    },
    {
      "id": "leadIn",
      "name": {
        "en-GB": "Lead-In"
      },
      "dataType": "string",
      "editor": {
        "id": "text"
      }
    },
    {
      "id": "backgroundImage",
      "name": {
        "en-GB": "Background image"
      },
      "dataType": "object",
      "dataFormat": "image",
      "editor": {
        "properties": {
          "uploadPath": "/image-library",
          "filterPaths": ["/image-library"]
        }
      }
    }
  ]
}
```

_Example Personalized Hero Component JSON_

After we have made changes to the Component and Content Type (adding the Resource Picker to the Component and the repeating Component field in the Content Type) and the changes have been Published, we can begin adding audence-specific variants of the content in a new or an existing Entry of this Content Type.
